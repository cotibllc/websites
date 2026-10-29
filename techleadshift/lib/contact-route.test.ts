// Runs the real POST /api/contact handler with siteverify and Resend mocked
// through globalThis.fetch, so nothing leaves the machine.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { POST } from "../app/api/contact/route";
import { errorLead } from "./contact-copy";

const SECRET = "mock-turnstile-secret-value";
const TOKEN = "tok-single-use-123";
const EMAIL = "reader@example.com";
const realFetch = globalThis.fetch;
const realError = console.error;

let siteverify: () => Response;
let lines: string[];
let resendCalls: number;

beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = SECRET;
  process.env.RESEND_API_KEY = "mock-resend-key";
  resendCalls = 0;
  lines = [];
  console.error = (...a: unknown[]) => { lines.push(a.map(String).join(" ")); };
  siteverify = () => Response.json({ success: true, hostname: "techleadshift.com" });
  globalThis.fetch = (async (url: string | URL | Request) => {
    const u = String(url);
    if (u.startsWith("https://challenges.cloudflare.com/")) return siteverify();
    if (u.startsWith("https://api.resend.com/")) { resendCalls++; return Response.json({ id: "email_1" }); }
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = realFetch; console.error = realError; });

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new Request("https://techleadshift.com/api/contact", { method: "POST", headers: { "content-type": "application/json", host: "techleadshift.com", ...headers }, body }));
const good = JSON.stringify({ name: "Reader", email: EMAIL, message: "Keynote in March", honeypot: "", turnstileToken: TOKEN });
const events = () => lines.map((l) => { try { return JSON.parse(l); } catch { return { raw: l }; } });

describe("POST /api/contact", () => {
  it("sends on a good token", async () => {
    const r = await post(good);
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { success: true });
    assert.equal(resendCalls, 1);
  });

  it("malformed JSON is a 400 with its own code, not a 500", async () => {
    for (const body of ["{not json", "", "[1,2]", "null"]) {
      const r = await post(body);
      assert.equal(r.status, 400, JSON.stringify(body));
      assert.deepEqual(await r.json(), { error: "The form couldn't be read. Refresh the page and try again", code: "badJson" });
    }
    assert.equal(resendCalls, 0);
  });

  it("each refused siteverify gets its own status, code and log reason, and sends nothing", async () => {
    const cases: Array<[() => Response, number, string, string, string[]]> = [
      [() => Response.json({ success: false, "error-codes": ["invalid-input-secret"] }), 503, "config", "config", ["invalid-input-secret"]],
      [() => Response.json({ success: false, "error-codes": ["invalid-input-secret"], messages: [] }, { status: 400 }), 503, "config", "config", ["invalid-input-secret"]],
      [() => Response.json({ success: false, "error-codes": ["timeout-or-duplicate"] }), 409, "expired", "expired", ["timeout-or-duplicate"]],
      [() => Response.json({ success: false, "error-codes": ["invalid-input-response"] }), 400, "failed", "failed", ["invalid-input-response"]],
      [() => Response.json({ success: true, hostname: "evil.example" }), 400, "failed", "hostname", []],
      [() => new Response("bad gateway", { status: 502 }), 502, "unreachable", "unreachable", []],
    ];
    for (const [reply, status, code, reason, codes] of cases) {
      siteverify = reply;
      lines = [];
      const r = await post(good, { "cf-connecting-ip": "203.0.113.9" });
      const data = await r.json();
      assert.equal(r.status, status, reason);
      assert.equal(data.code, code, reason);
      const line = events().find((e) => e.event === "contact.turnstile_failed");
      assert.ok(line, `${reason}: no contact.turnstile_failed line`);
      assert.equal(line.reason, reason);
      assert.deepEqual(line.errorCodes, codes);
      if (reason === "hostname") assert.equal(line.hostname, "evil.example");
    }
    assert.equal(resendCalls, 0);
  });

  it("config and expired read differently from a plain failure", async () => {
    const msgs = new Set<string>();
    for (const code of ["invalid-input-secret", "timeout-or-duplicate", "invalid-input-response"]) {
      siteverify = () => Response.json({ success: false, "error-codes": [code] });
      msgs.add((await (await post(good)).json()).error);
    }
    assert.equal(msgs.size, 3);
  });

  it("logs never carry the secret, the token or the email", async () => {
    for (const reply of [
      () => Response.json({ success: false, "error-codes": ["invalid-input-secret"] }),
      () => Response.json({ success: false, "error-codes": ["timeout-or-duplicate"] }),
      () => Response.json({ success: true, hostname: "evil.example" }),
    ]) {
      siteverify = reply;
      await post(good);
    }
    await post("{not json");
    const all = lines.join("\n");
    assert.ok(lines.length >= 4, "expected log lines");
    for (const secretish of [SECRET, TOKEN, EMAIL]) assert.ok(!all.includes(secretish), `log leaked ${secretish}`);
  });
});

describe("errorLead", () => {
  it("joins the server message to the fallback with one period", () => {
    assert.equal(errorLead("Captcha verification failed"), "Captcha verification failed. Or email");
    assert.equal(errorLead("Something went wrong."), "Something went wrong. Or email");
    assert.equal(errorLead(""), "Something went wrong. Or email");
  });
});
