import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SITEVERIFY_URL, verifyTurnstile } from "./turnstile";

type Call = { url: string; body: URLSearchParams; hasSignal: boolean };

function mockFetch(reply: (() => Response) | Error) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), body: new URLSearchParams(String(init?.body)), hasSignal: !!init?.signal });
    if (reply instanceof Error) throw reply;
    return reply();
  }) as typeof fetch;
  return { calls, fetchImpl };
}
const json = (data: unknown, status = 200) => () => new Response(JSON.stringify(data), { status });
const NOW = Date.parse("2026-10-29T20:00:00Z");
const base = { secret: "mock-secret", token: "tok-1", requestHost: "www.corphardcore.com", now: () => NOW };

describe("verifyTurnstile", () => {
  it("passes a good token and reports hostname, action and challenge age", async () => {
    const { calls, fetchImpl } = mockFetch(json({ success: true, hostname: "www.corphardcore.com", action: "contact", challenge_ts: "2026-10-29T19:59:30Z", "error-codes": [] }));
    const r = await verifyTurnstile({ ...base, fetchImpl, remoteIp: "203.0.113.9" });
    assert.deepEqual(r, { ok: true, errorCodes: [], hostname: "www.corphardcore.com", action: "contact", challengeAgeSec: 30 });
    assert.equal(calls[0].url, SITEVERIFY_URL);
    assert.equal(calls[0].body.get("remoteip"), "203.0.113.9");
    assert.equal(calls[0].hasSignal, true, "request has a timeout signal");
  });

  it("trims the secret and leaves remoteip off when there is no CF-Connecting-IP", async () => {
    const { calls, fetchImpl } = mockFetch(json({ success: true, hostname: "www.corphardcore.com" }));
    await verifyTurnstile({ ...base, secret: "  mock-secret\n", fetchImpl });
    assert.equal(calls[0].body.get("secret"), "mock-secret");
    assert.equal(calls[0].body.has("remoteip"), false);
  });

  it("maps each refusal to its reason", async () => {
    const cases: Array<[string, () => Response, string, string[]]> = [
      ["invalid-input-secret", json({ success: false, "error-codes": ["invalid-input-secret"] }), "config", ["invalid-input-secret"]],
      ["missing-input-secret", json({ success: false, "error-codes": ["missing-input-secret"] }), "config", ["missing-input-secret"]],
      ["timeout-or-duplicate", json({ success: false, "error-codes": ["timeout-or-duplicate"] }), "expired", ["timeout-or-duplicate"]],
      ["invalid-input-response", json({ success: false, "error-codes": ["invalid-input-response"] }), "failed", ["invalid-input-response"]],
      ["other site", json({ success: true, hostname: "evil.example" }), "hostname", []],
      ["HTTP 400 bad secret, as Cloudflare really answers", json({ success: false, "error-codes": ["invalid-input-secret"], messages: [] }, 400), "config", ["invalid-input-secret"]],
      ["HTTP 500", json({}, 500), "unreachable", []],
      ["HTTP 502 HTML", () => new Response("<html>bad gateway</html>", { status: 502 }), "unreachable", []],
      ["not JSON", () => new Response("<html>", { status: 200 }), "unreachable", []],
    ];
    for (const [name, reply, reason, codes] of cases) {
      const r = await verifyTurnstile({ ...base, fetchImpl: mockFetch(reply).fetchImpl });
      assert.equal(r.ok, false, name);
      assert.deepEqual([!r.ok && r.reason, r.errorCodes], [reason, codes], name);
    }
    const down = await verifyTurnstile({ ...base, fetchImpl: mockFetch(new Error("timeout")).fetchImpl });
    assert.deepEqual(down, { ok: false, reason: "unreachable", errorCodes: [] });
  });

  it("an all-space secret is config without calling Cloudflare", async () => {
    const { calls, fetchImpl } = mockFetch(json({ success: true }));
    const r = await verifyTurnstile({ ...base, secret: "  ", fetchImpl });
    assert.deepEqual(r, { ok: false, reason: "config", errorCodes: ["missing-input-secret"] });
    assert.equal(calls.length, 0);
  });
});
