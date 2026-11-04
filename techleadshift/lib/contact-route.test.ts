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
let resendBodies: Array<Record<string, unknown>>;

beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = SECRET;
  process.env.RESEND_API_KEY = "mock-resend-key";
  resendCalls = 0;
  resendBodies = [];
  lines = [];
  console.error = (...a: unknown[]) => { lines.push(a.map(String).join(" ")); };
  siteverify = () => Response.json({ success: true, hostname: "techleadshift.com" });
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    if (u.startsWith("https://challenges.cloudflare.com/")) return siteverify();
    if (u.startsWith("https://api.resend.com/")) {
      resendCalls++;
      resendBodies.push(JSON.parse(String(init?.body ?? "{}")));
      return Response.json({ id: "email_1" });
    }
    throw new Error(`unexpected fetch ${u}`);
  }) as typeof fetch;
});
afterEach(() => { globalThis.fetch = realFetch; console.error = realError; });

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new Request("https://techleadshift.com/api/contact", { method: "POST", headers: { "content-type": "application/json", host: "techleadshift.com", ...headers }, body }));
const ANSWERS = { interest: "review", role: "director", teamSize: "50-199", timeline: "90days", approval: "shared" };
const goodBody = { name: "Reader", email: EMAIL, message: "Keynote in March", ...ANSWERS, honeypot: "", turnstileToken: TOKEN };
const good = JSON.stringify(goodBody);
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

describe("POST /api/contact diagnostic", () => {
  it("a qualified lead is tagged in the subject, body and Resend tags, and logged by value only", async () => {
    const r = await post(good);
    assert.equal(r.status, 200);
    assert.equal(resendBodies.length, 1);
    const sent = resendBodies[0];
    assert.equal(sent.subject, "[Qualified] Diagnostic Inquiry from Reader");
    assert.equal(sent.to, "hello@techleadshift.com");
    assert.equal(sent.reply_to, EMAIL);
    assert.equal(
      sent.text,
      [
        "Name: Reader",
        `Email: ${EMAIL}`,
        "",
        "What are you looking for? An AI Operating Model Review for my team",
        "Your role Director or head of a function",
        "How many people do you lead? 50 to 199",
        "When do you want to start? In the next 90 days",
        "Who signs off on work like this? I recommend it, someone else signs",
        "Qualified: yes",
        "",
        "Keynote in March",
      ].join("\n")
    );
    assert.deepEqual(sent.tags, [
      { name: "form", value: "work" },
      { name: "interest", value: "review" },
      { name: "qualified", value: "yes" },
    ]);
    const line = events().find((e) => e.event === "contact.sent");
    assert.deepEqual({ interest: line?.interest, qualified: line?.qualified }, { interest: "review", qualified: true });
    assert.ok(!lines.join("\n").includes(EMAIL));
    assert.ok(!lines.join("\n").includes("Reader"));
  });

  it("a speaking inquiry is sent untagged as a Speaking Inquiry", async () => {
    const r = await post(JSON.stringify({ ...goodBody, interest: "speaking" }));
    assert.equal(r.status, 200);
    assert.equal(resendBodies[0].subject, "Speaking Inquiry from Reader");
    assert.match(String(resendBodies[0].text), /\nQualified: no \(outside the rule on: interest\)\n/);
  });

  it("a missing answer is a 400 missingFields and sends nothing", async () => {
    for (const id of Object.keys(ANSWERS)) {
      const body: Record<string, unknown> = { ...goodBody };
      delete body[id];
      const r = await post(JSON.stringify(body));
      assert.equal(r.status, 400, id);
      assert.equal((await r.json()).code, "missingFields", id);
    }
    assert.equal(resendCalls, 0);
  });

  it("a value not on the list is a 400 invalidChoice, checked before the token is spent", async () => {
    let siteverifyCalls = 0;
    siteverify = () => { siteverifyCalls++; return Response.json({ success: true, hostname: "techleadshift.com" }); };
    for (const [id, bad] of [["interest", "consulting"], ["role", "CEO"], ["teamSize", 500], ["timeline", "now"], ["approval", ["me"]]] as const) {
      lines = [];
      const r = await post(JSON.stringify({ ...goodBody, [id]: bad }));
      assert.equal(r.status, 400, id);
      assert.deepEqual(await r.json(), { error: "One of the answers isn't on the list. Refresh the page and try again", code: "invalidChoice" }, id);
      assert.deepEqual(events().find((e) => e.event === "contact.invalid_choice")?.field, id);
    }
    assert.equal(siteverifyCalls, 0);
    assert.equal(resendCalls, 0);
  });

  it("the honeypot still wins: 200 and nothing sent, even with bad answers", async () => {
    const r = await post(JSON.stringify({ ...goodBody, interest: "nope", honeypot: "http://spam" }));
    assert.equal(r.status, 200);
    assert.equal(resendCalls, 0);
  });
});

describe("errorLead", () => {
  it("joins the server message to the fallback with one period", () => {
    assert.equal(errorLead("Captcha verification failed"), "Captcha verification failed. Or email");
    assert.equal(errorLead("Something went wrong."), "Something went wrong. Or email");
    assert.equal(errorLead(""), "Something went wrong. Or email");
  });
});
