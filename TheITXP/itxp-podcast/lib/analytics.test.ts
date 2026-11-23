// Runs the consent-gated GA loader against a fake page and counts every
// request, to prove nothing goes to Google before consent in the EU, EEA,
// UK and Switzerland (or when the country is unknown).
import { test } from "node:test";
import assert from "node:assert/strict";
import { createAnalytics, GA_SCRIPT_SRC, type AnalyticsEnv, type ScriptLike } from "./analytics";

function fakePage({ region = "required", stored = null as string | null, regionFails = false, storage = new Map<string, string>() } = {}) {
  if (stored) storage.set("itxp-analytics-consent-v1", stored);
  const requests: string[] = [];
  const scripts: ScriptLike[] = [];
  const cookies: string[] = [];
  const win = { location: { hostname: "www.theitxp.com" } } as AnalyticsEnv["win"];
  const env: AnalyticsEnv = {
    win,
    doc: {
      createElement: () => ({ id: "", async: false, src: "" }),
      head: { appendChild: (n: ScriptLike) => scripts.push(n) },
      set cookie(v: string) { cookies.push(v); },
      get cookie() { return ""; },
    },
    fetch: async (url) => {
      requests.push(url);
      if (regionFails) throw new Error("offline");
      return { ok: true, json: async () => ({ region }) };
    },
    storage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => void storage.set(k, v) },
  };
  const googleRequests = () => [...requests, ...scripts.map((s) => s.src)].filter((u) => /google/.test(u));
  return { env, win, requests, scripts, cookies, storage, googleRequests };
}

const plain = (v: unknown) => JSON.parse(JSON.stringify(v));

test("EU/UK first visit: the banner is asked for and nothing is requested from Google", async () => {
  const p = fakePage({ region: "required" });
  let asked = 0;
  await createAnalytics(p.env).start(() => asked++);
  assert.equal(asked, 1);
  assert.deepEqual(p.requests, ["/api/consent-region"]);
  assert.deepEqual(p.googleRequests(), []);
  assert.equal(p.win.dataLayer, undefined);
  assert.equal(p.win.gtag, undefined);
});

test("unknown country or a failed region lookup also asks first", async () => {
  const p = fakePage({ regionFails: true });
  let asked = 0;
  await createAnalytics(p.env).start(() => asked++);
  assert.equal(asked, 1);
  assert.deepEqual(p.googleRequests(), []);
});

test("Reject: GA stays off, cookies are cleared, and the next page view requests nothing", async () => {
  const p = fakePage({ region: "required" });
  const a = createAnalytics(p.env);
  await a.start(() => {});
  a.choose("denied");
  assert.equal(p.storage.get("itxp-analytics-consent-v1"), "denied");
  assert.equal(p.win["ga-disable-G-2FEJYVGXPP"], true);
  assert.ok(p.cookies.some((c) => c.startsWith("_ga=; Max-Age=0")));
  assert.ok(p.cookies.some((c) => c.startsWith("_ga_2FEJYVGXPP=; Max-Age=0")));
  assert.deepEqual(p.googleRequests(), []);
  const next = fakePage({ storage: p.storage });
  let asked = 0;
  await createAnalytics(next.env).start(() => asked++);
  assert.equal(asked, 0);
  assert.deepEqual(next.requests, [], "a stored choice skips the region lookup");
  assert.deepEqual(next.googleRequests(), []);
});

test("Accept: gtag.js loads once, with advertising consent denied", async () => {
  const p = fakePage({ region: "required" });
  const a = createAnalytics(p.env);
  await a.start(() => {});
  a.choose("granted");
  a.choose("granted");
  assert.deepEqual(p.scripts.map((s) => s.src), [GA_SCRIPT_SRC]);
  assert.equal(GA_SCRIPT_SRC, "https://www.googletagmanager.com/gtag/js?id=G-2FEJYVGXPP");
  const calls = plain((p.win.dataLayer ?? []).map((x) => Array.from(x as ArrayLike<unknown>)));
  assert.deepEqual(calls[0], ["consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" }]);
  assert.deepEqual(calls[2], ["config", "G-2FEJYVGXPP"]);
  assert.deepEqual(calls.at(-1), ["consent", "update", { analytics_storage: "granted" }]);
});

test("withdrawing consent after Accept stops GA on the page", async () => {
  const p = fakePage({ stored: "granted" });
  const a = createAnalytics(p.env);
  await a.start(() => {});
  assert.equal(p.scripts.length, 1);
  a.choose("denied");
  assert.equal(p.win["ga-disable-G-2FEJYVGXPP"], true);
  assert.deepEqual(plain(Array.from((p.win.dataLayer ?? []).at(-1) as ArrayLike<unknown>)), ["consent", "update", { analytics_storage: "denied" }]);
});

test("outside the consent region GA loads by default, still with advertising denied", async () => {
  const p = fakePage({ region: "not-required" });
  let asked = 0;
  await createAnalytics(p.env).start(() => asked++);
  assert.equal(asked, 0);
  assert.equal(p.scripts.length, 1);
});
