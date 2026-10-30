// Runs the real POST /api/contact handler with siteverify and Resend mocked
// through globalThis.fetch, so nothing leaves the machine.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { POST } from "../app/api/contact/route";
import { CONTACT_ERRORS, errorSentence } from "./contact-copy";

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
  siteverify = () => Response.json({ success: true, hostname: "www.corphardcore.com" });
  globalThis.fetch = (async (url: string | URL | Request) => {
    const u = String(url);
    if (u.startsWith("https://challenges.cloudflare.com/")) return siteverify();
    if (u.startsWith("https://api.resend.com/")) { resendCalls++; return Response.json({ id: "email_1" }); }
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = realFetch; console.error = realError; });

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new Request("https://www.corphardcore.com/api/contact", { method: "POST", headers: { "content-type": "application/json", host: "www.corphardcore.com", ...headers }, body }));
const good = JSON.stringify({ name: "Reader", email: EMAIL, subject: "Press", message: "Ticket about synergy", honeypot: "", turnstileToken: TOKEN });
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
      assert.deepEqual(await r.json(), { error: "The ticket couldn't be read. Refresh the page.", code: "badJson" });
    }
    assert.equal(resendCalls, 0);
  });

  it("missing fields and a missing token keep their 400s", async () => {
    const noName = await post(JSON.stringify({ email: EMAIL, message: "x", turnstileToken: TOKEN }));
    assert.equal(noName.status, 400);
    assert.equal((await noName.json()).code, "missingFields");
    const noToken = await post(JSON.stringify({ name: "R", email: EMAIL, message: "x" }));
    assert.equal(noToken.status, 400);
    assert.equal((await noToken.json()).code, "noToken");
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

  it("missing env names the variable, never its value", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const r = await post(good);
    assert.equal(r.status, 500);
    assert.equal((await r.json()).code, "notConfigured");
    const line = events().find((e) => e.event === "contact.misconfigured");
    assert.deepEqual(line?.missing, ["TURNSTILE_SECRET_KEY"]);
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

describe("errorSentence", () => {
  it("every message reads as one sentence before 'Try again or email'", () => {
    assert.equal(errorSentence("Missing required fields"), "Missing required fields.");
    assert.equal(errorSentence("Captcha verification failed."), "Captcha verification failed.");
    assert.equal(errorSentence("Wait!!"), "Wait.");
    assert.equal(errorSentence(undefined), "Transmission failed.");
    assert.equal(errorSentence(""), "Transmission failed.");
    for (const m of Object.values(CONTACT_ERRORS)) assert.equal(errorSentence(m), m, m);
  });
});
