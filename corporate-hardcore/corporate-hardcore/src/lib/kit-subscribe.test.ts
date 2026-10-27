import { test } from "node:test";
import assert from "node:assert/strict";
import { handleSubscribe, FIELD_NOTES_FORM_ID } from "./kit-subscribe";

type Call = { url: string; body: Record<string, unknown> };

// Fake Kit. Never hits the network.
function mockFetch(status = 200) {
  const calls: Call[] = [];
  const fn = async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return new Response(JSON.stringify({ ok: status < 400 }), { status });
  };
  return { fn, calls };
}

const KEY = "test-key-not-real";
const fieldNotesUrl = `https://api.convertkit.com/v3/forms/${FIELD_NOTES_FORM_ID}/subscribe`;

test("merch with no destination env returns 503 and never calls Kit", async () => {
  const kit = mockFetch();
  const r = await handleSubscribe({ email: "a@example.com", source: "merch" }, { KIT_API_KEY: KEY }, kit.fn);
  assert.equal(r.status, 503);
  assert.match(String(r.body.error), /not configured/);
  assert.equal(kit.calls.length, 0);
});

test("merch with KIT_MERCH_FORM_ID calls the merch form, not 9272877", async () => {
  const kit = mockFetch();
  const r = await handleSubscribe(
    { email: "a@example.com", source: "merch" },
    { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "1111111" },
    kit.fn,
  );
  assert.equal(r.status, 200);
  assert.equal(kit.calls.length, 1);
  assert.equal(kit.calls[0].url, "https://api.convertkit.com/v3/forms/1111111/subscribe");
  assert.deepEqual(kit.calls[0].body, { api_key: KEY, email: "a@example.com" });
});

test("merch with form and tag env subscribes to the form with the tag applied", async () => {
  const kit = mockFetch();
  await handleSubscribe(
    { email: "a@example.com", source: "merch" },
    { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "1111111", KIT_MERCH_TAG_ID: "2222222" },
    kit.fn,
  );
  assert.equal(kit.calls[0].url, "https://api.convertkit.com/v3/forms/1111111/subscribe");
  assert.deepEqual(kit.calls[0].body.tags, [2222222]);
});

test("merch with only KIT_MERCH_TAG_ID calls the tag subscribe endpoint", async () => {
  const kit = mockFetch();
  const r = await handleSubscribe(
    { email: "a@example.com", source: "merch" },
    { KIT_API_KEY: KEY, KIT_MERCH_TAG_ID: "2222222" },
    kit.fn,
  );
  assert.equal(r.status, 200);
  assert.equal(kit.calls[0].url, "https://api.convertkit.com/v3/tags/2222222/subscribe");
});

test("merch refuses KIT_MERCH_FORM_ID=9272877 (no fallback onto Field Notes)", async () => {
  const kit = mockFetch();
  const r = await handleSubscribe(
    { email: "a@example.com", source: "merch" },
    { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: FIELD_NOTES_FORM_ID },
    kit.fn,
  );
  assert.equal(r.status, 503);
  assert.equal(kit.calls.length, 0);
});

test("merch rejects a non numeric destination id", async () => {
  const kit = mockFetch();
  const r = await handleSubscribe(
    { email: "a@example.com", source: "merch" },
    { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "../tags/1" },
    kit.fn,
  );
  assert.equal(r.status, 503);
  assert.equal(kit.calls.length, 0);
});

test("merch validates the email before anything else", async () => {
  const kit = mockFetch();
  for (const email of ["", "nope", "a@b", 42, undefined]) {
    const r = await handleSubscribe({ email, source: "merch" }, { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "1111111" }, kit.fn);
    assert.equal(r.status, 400);
  }
  assert.equal(kit.calls.length, 0);
});

test("merch Kit failure returns 502 and does not log the key", async () => {
  const kit = mockFetch(422);
  const logged: string[] = [];
  const orig = console.error;
  console.error = (...a: unknown[]) => { logged.push(a.map(String).join(" ")); };
  try {
    const r = await handleSubscribe(
      { email: "a@example.com", source: "merch" },
      { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "1111111" },
      kit.fn,
    );
    assert.equal(r.status, 502);
  } finally {
    console.error = orig;
  }
  assert.ok(logged.length > 0);
  assert.ok(logged.every((l) => !l.includes(KEY)));
});

test("no source still goes to Field Notes 9272877, even with merch env set", async () => {
  const kit = mockFetch();
  const r = await handleSubscribe(
    { email: "a@example.com" },
    { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "1111111", KIT_MERCH_TAG_ID: "2222222" },
    kit.fn,
  );
  assert.equal(r.status, 200);
  assert.equal(kit.calls.length, 1);
  assert.equal(kit.calls[0].url, fieldNotesUrl);
  assert.deepEqual(kit.calls[0].body, { api_key: KEY, email: "a@example.com" });
});

test("a source other than merch keeps Field Notes behavior", async () => {
  const kit = mockFetch();
  await handleSubscribe({ email: "a@example.com", source: "footer" }, { KIT_API_KEY: KEY, KIT_MERCH_FORM_ID: "1111111" }, kit.fn);
  assert.equal(kit.calls[0].url, fieldNotesUrl);
});

test("Field Notes keeps its original missing key and missing email responses", async () => {
  const kit = mockFetch();
  const noKey = await handleSubscribe({ email: "a@example.com" }, {}, kit.fn);
  assert.equal(noKey.status, 500);
  const noEmail = await handleSubscribe({}, { KIT_API_KEY: KEY }, kit.fn);
  assert.equal(noEmail.status, 400);
  assert.equal(kit.calls.length, 0);
});

test("DistributionList Field Notes payload {email} hits form 9272877 only", async () => {
  const kit = mockFetch();
  // Exact body the homepage DistributionList component sends.
  const payload = JSON.parse(JSON.stringify({ email: "notes@example.com" }));
  const r = await handleSubscribe(payload, { KIT_API_KEY: KEY }, kit.fn);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true });
  assert.equal(kit.calls.length, 1);
  assert.equal(kit.calls[0].url, "https://api.convertkit.com/v3/forms/9272877/subscribe");
  assert.deepEqual(kit.calls[0].body, { api_key: KEY, email: "notes@example.com" });
});
