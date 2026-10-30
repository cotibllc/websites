// Runs the real POST /api/subscribe handler with siteverify and Kit mocked
// through globalThis.fetch, so nothing leaves the machine.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { POST } from "../app/api/subscribe/route";
import { SIGNUP_ERRORS } from "./signup-copy";
import { createRateLimiter } from "./rate-limit";
import { handleSubscribe } from "./kit-subscribe";

const SECRET = "mock-turnstile-secret-value";
const KIT_KEY = "mock-kit-key-value";
const TOKEN = "tok-single-use-123";
const EMAIL = "reader@example.com";
const realFetch = globalThis.fetch;
const realError = console.error;

let siteverify: () => Response;
let lines: string[];
let kitUrls: string[];
let siteverifyCalls: number;
let ipSeq = 0;

beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = SECRET;
  process.env.KIT_API_KEY = KIT_KEY;
  process.env.KIT_MERCH_FORM_ID = "1111111";
  delete process.env.KIT_MERCH_TAG_ID;
  kitUrls = [];
  siteverifyCalls = 0;
  lines = [];
  console.error = (...a: unknown[]) => { lines.push(a.map(String).join(" ")); };
  siteverify = () => Response.json({ success: true, hostname: "www.corphardcore.com" });
  globalThis.fetch = (async (url: string | URL | Request) => {
    const u = String(url);
    if (u.startsWith("https://challenges.cloudflare.com/")) { siteverifyCalls++; return siteverify(); }
    if (u.startsWith("https://api.convertkit.com/")) { kitUrls.push(u); return Response.json({ subscription: {} }); }
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = realFetch; console.error = realError; });

// A fresh address per call, so the shared limiter only counts where a test means it to.
const post = (body: string, ip = `198.51.100.${++ipSeq % 250}`) =>
  POST(new Request("https://www.corphardcore.com/api/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json", host: "www.corphardcore.com", "cf-connecting-ip": ip },
    body,
  }));
const body = (extra: Record<string, unknown> = {}) => JSON.stringify({ email: EMAIL, honeypot: "", turnstileToken: TOKEN, ...extra });
const events = () => lines.map((l) => { try { return JSON.parse(l); } catch { return { raw: l }; } });

describe("POST /api/subscribe", () => {
  it("Field Notes and merch subscribe on a good token, each to its own list", async () => {
    const notes = await post(body());
    assert.equal(notes.status, 200);
    assert.deepEqual(await notes.json(), { success: true });
    const merch = await post(body({ source: "merch" }));
    assert.equal(merch.status, 200);
    assert.deepEqual(kitUrls, [
      "https://api.convertkit.com/v3/forms/9272877/subscribe",
      "https://api.convertkit.com/v3/forms/1111111/subscribe",
    ]);
    assert.equal(siteverifyCalls, 2);
  });

  it("malformed JSON is a 400 with its own code, not a 500", async () => {
    for (const raw of ["{not json", "", "[1,2]", "null"]) {
      const r = await post(raw);
      assert.equal(r.status, 400, JSON.stringify(raw));
      assert.deepEqual(await r.json(), { error: SIGNUP_ERRORS.badJson, code: "badJson" });
    }
    assert.equal(kitUrls.length, 0);
  });

  it("a filled honeypot looks like success but sends nothing to Kit or Cloudflare", async () => {
    for (const source of [undefined, "merch"]) {
      const r = await post(body({ source, honeypot: "https://spam.example", turnstileToken: undefined }));
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { success: true });
    }
    assert.equal(kitUrls.length, 0);
    assert.equal(siteverifyCalls, 0);
    assert.deepEqual(events().map((e) => e.event), ["subscribe.honeypot", "subscribe.honeypot"]);
  });

  it("the server checks the email format on both lists before anything else", async () => {
    for (const source of [undefined, "merch"]) {
      for (const email of ["", "nope", "a@b", "a b@example.com", 42, null, `${"x".repeat(250)}@example.com`]) {
        const r = await post(body({ source, email }));
        assert.equal(r.status, 400, `${source} ${String(email)}`);
        assert.equal((await r.json()).code, "invalidEmail");
      }
    }
    assert.equal(siteverifyCalls, 0);
    assert.equal(kitUrls.length, 0);
  });

  it("a missing or oversized token is refused before Kit", async () => {
    for (const turnstileToken of [undefined, "", "x".repeat(2049)]) {
      const r = await post(body({ turnstileToken }));
      assert.equal(r.status, 400);
      assert.equal((await r.json()).code, "noToken");
    }
    assert.equal(siteverifyCalls, 0);
    assert.equal(kitUrls.length, 0);
  });

  it("each refused siteverify gets its own status, code and log reason, and sends nothing", async () => {
    const cases: Array<[() => Response, number, string, string, string[]]> = [
      [() => Response.json({ success: false, "error-codes": ["invalid-input-secret"] }), 503, "notConfigured", "config", ["invalid-input-secret"]],
      [() => Response.json({ success: false, "error-codes": ["timeout-or-duplicate"] }), 409, "expired", "expired", ["timeout-or-duplicate"]],
      [() => Response.json({ success: false, "error-codes": ["invalid-input-response"] }), 400, "failed", "failed", ["invalid-input-response"]],
      [() => Response.json({ success: true, hostname: "evil.example" }), 400, "failed", "hostname", []],
      [() => new Response("bad gateway", { status: 502 }), 502, "unreachable", "unreachable", []],
    ];
    for (const source of [undefined, "merch"]) {
      for (const [reply, status, code, reason, codes] of cases) {
        siteverify = reply;
        lines = [];
        const r = await post(body({ source }));
        assert.equal(r.status, status, reason);
        assert.equal((await r.json()).code, code, reason);
        const ev = events().find((e) => e.event === "subscribe.turnstile_failed");
        assert.ok(ev, reason);
        assert.equal(ev.reason, reason);
        assert.equal(ev.list, source === "merch" ? "merch" : "field_notes");
        assert.deepEqual(ev.errorCodes, codes);
      }
    }
    assert.equal(kitUrls.length, 0);
  });

  it("a missing TURNSTILE_SECRET_KEY fails closed and names only the variable", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const r = await post(body());
    assert.equal(r.status, 503);
    assert.equal((await r.json()).code, "notConfigured");
    assert.deepEqual(events()[0].missing, ["TURNSTILE_SECRET_KEY"]);
    assert.equal(kitUrls.length, 0);
  });

  it("one address gets five tries per window, then 429 without calling Cloudflare or Kit", async () => {
    const ip = "203.0.113.77";
    for (let i = 0; i < 5; i++) assert.equal((await post(body(), ip)).status, 200);
    const sixth = await post(body(), ip);
    assert.equal(sixth.status, 429);
    assert.equal((await sixth.json()).code, "rateLimited");
    assert.equal(siteverifyCalls, 5);
    assert.equal(kitUrls.length, 5);
    assert.equal((await post(body(), "203.0.113.78")).status, 200);
  });

  it("logs never carry the secret, the token, the Kit key or the email", async () => {
    siteverify = () => Response.json({ success: false, "error-codes": ["invalid-input-response"] });
    await post(body());
    await post(body({ honeypot: "bot" }));
    await post("{bad");
    delete process.env.TURNSTILE_SECRET_KEY;
    await post(body());
    assert.ok(lines.length >= 4);
    for (const l of lines) for (const s of [SECRET, TOKEN, KIT_KEY, EMAIL]) assert.ok(!l.includes(s), l);
  });
});

describe("createRateLimiter", () => {
  it("allows the limit, refuses the next, and frees up after the window", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => t });
    assert.equal(rl.hit("a"), true);
    assert.equal(rl.hit("a"), true);
    assert.equal(rl.hit("a"), false);
    assert.equal(rl.hit("b"), true);
    t = 1000;
    assert.equal(rl.hit("a"), true);
  });

  it("stays bounded by dropping the oldest addresses", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2, now: () => 0 });
    rl.hit("a"); rl.hit("b"); rl.hit("c");
    assert.equal(rl.hit("a"), true, "a was evicted, so it starts fresh");
  });
});

describe("Field Notes email check in handleSubscribe", () => {
  it("rejects a malformed address before Kit, keeps the missing email 400", async () => {
    let calls = 0;
    const fetchImpl = async () => { calls++; return Response.json({}); };
    const bad = await handleSubscribe({ email: "nope" }, { KIT_API_KEY: KIT_KEY }, fetchImpl);
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error, "Please enter a valid email address.");
    const missing = await handleSubscribe({}, { KIT_API_KEY: KIT_KEY }, fetchImpl);
    assert.equal(missing.body.error, "Email is required");
    assert.equal(calls, 0);
  });
});
