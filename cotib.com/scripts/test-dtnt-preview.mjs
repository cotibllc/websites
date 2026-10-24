#!/usr/bin/env node
// Preview test for the Do the Next Thing free sampler (setup addendum F11
// free-path cases and F10 CAN-SPAM checks) against a deployed base URL.
//
//   node scripts/test-dtnt-preview.mjs https://<preview-or-prod-host>
//
// Levels (each adds to the one before):
//   (default)            Read-only smoke checks. Sends no email, writes nothing.
//   DTNT_TOKEN_SECRET=.. Also mints tokens locally to test expired and valid
//                        links. Still sends no email and writes nothing.
//   --live --email you@x Also runs a real confirm for that inbox: creates the
//                        Resend contact, sends the delivery email, then
//                        unsubscribes it. Use your own address only.
//
// Vercel previews sit behind Vercel Authentication. Set VERCEL_BYPASS to a
// Protection Bypass for Automation secret, or run it against production
// after merge. Turnstile can't be scripted, so the form steps that need it
// are printed as a manual checklist at the end.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) || '').replace(/\/$/, '');
const live = args.includes('--live');
const emailArg = args[args.indexOf('--email') + 1];
if (!base) {
  console.error('Usage: node scripts/test-dtnt-preview.mjs <base-url> [--live --email you@example.com]');
  process.exit(2);
}
if (live && (!emailArg || !emailArg.includes('@'))) {
  console.error('--live needs --email <your own inbox>');
  process.exit(2);
}
const hasSecret = !!process.env.DTNT_TOKEN_SECRET;
const tokens = hasSecret ? require('../lib/dtnt/tokens.js') : null;

const bypass = process.env.VERCEL_BYPASS ? { 'x-vercel-protection-bypass': process.env.VERCEL_BYPASS } : {};
const results = [];
const req = (path, opts = {}) => fetch(path.startsWith('http') ? path : base + path, { redirect: 'manual', ...opts, headers: { ...bypass, ...(opts.headers || {}) } });

// Stop early with a clear message when Vercel Authentication is in front.
{
  const r = await req('/do-the-next-thing');
  const loc = r.headers.get('location') || '';
  if ([302, 307, 401, 403].includes(r.status) && (/vercel\.com\/(login|sso)|_vercel_sso/.test(loc) || r.status === 401 || r.status === 403)) {
    console.error(`${base} is behind Vercel Authentication (status ${r.status}). Set VERCEL_BYPASS to a Protection Bypass for Automation secret, or run against production after merge.`);
    process.exit(3);
  }
}

async function check(id, name, fn) {
  try {
    const note = await fn();
    results.push({ id, name, ok: true, note });
    console.log(`PASS  ${id}  ${name}${note ? `  (${note})` : ''}`);
  } catch (err) {
    results.push({ id, name, ok: false, note: err.message });
    console.log(`FAIL  ${id}  ${name}: ${err.message}`);
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };
const DASHES = /[\u2013\u2014]|&ndash;|&mdash;/;

// The signup route allows 10 posts a minute from one address. If an earlier
// run used that up, wait once and retry.
async function postSignup(body, { origin = base } = {}) {
  const send = () => req('/do-the-next-thing/free', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(origin ? { Origin: origin } : {}) },
    body: JSON.stringify(body),
  });
  let r = await send();
  if (r.status === 429) {
    console.log('      (rate limited from an earlier run; waiting 60 seconds)');
    await new Promise((ok) => setTimeout(ok, 61_000));
    r = await send();
  }
  return r;
}

function minted(purpose, data, ttl, ageSeconds = 0) {
  const real = Date.now;
  Date.now = () => real() - ageSeconds * 1000;
  try { return tokens.createToken(purpose, data, ttl); } finally { Date.now = real; }
}

console.log(`Do the Next Thing preview test against ${base}`);
console.log(`Level: ${live ? 'live (sends one real email to ' + emailArg + ')' : hasSecret ? 'tokens (no email sent)' : 'smoke (read-only)'}\n`);

// ---------- Pages ----------
await check('P1', 'landing page is up, sampler-first, no buy buttons', async () => {
  const r = await req('/do-the-next-thing');
  expect(r.status === 200, `status ${r.status}`);
  const h = await r.text();
  expect(/id="free-form"/.test(h), 'signup form missing');
  expect(!/type="checkbox"[^>]*checked/.test(h), 'consent box is pre-checked');
  expect(/class="cf-turnstile"/.test(h), 'Turnstile widget missing');
  expect((h.match(/Coming soon<\/p>/g) || []).length === 2, 'expected 2 "Coming soon" tiers');
  expect(!/stripe\.com|Get the Pack/i.test(h), 'a buy link or button is on the page');
  expect(/href="\/do-the-next-thing\/privacy"/.test(h), 'privacy link missing');
  expect(!DASHES.test(h), 'em or en dash on the page');
});
await check('P2', 'privacy notice is up and names Vercel, not Workers, KV or R2', async () => {
  const r = await req('/do-the-next-thing/privacy');
  expect(r.status === 200, `status ${r.status}`);
  const h = await r.text();
  expect(/Vercel:<\/strong>/.test(h), 'Vercel processor line missing');
  expect(!/Workers|\bKV\b|\bR2\b/.test(h), 'Worker, KV or R2 wording still there');
  expect(/155 Willowbrook Blvd, Ste 110 #2800, Wayne NJ 07470/.test(h), 'postal address missing');
  return /\[launch date\]/.test(h) ? 'effective date still shows [launch date]' : '';
});

// ---------- F11 cases that need no secret ----------
await check('F11.6', 'Turnstile failure is refused with the approved message', async () => {
  const r = await postSignup({ email: 'preview-test@example.com', consent: true, turnstileToken: 'not-a-real-token' });
  const d = await r.json().catch(() => ({}));
  expect(r.status !== 503, 'got 503: an env var is missing in this deployment (see the function log for its name)');
  expect(r.status === 400, `status ${r.status}`);
  expect(d.error === "We couldn't confirm you're human. Refresh the page and try again.", `message: ${d.error}`);
});
await check('F11.6b', 'missing Turnstile token is refused', async () => {
  const r = await postSignup({ email: 'preview-test@example.com', consent: true });
  expect(r.status === 400, `status ${r.status}`);
});
await check('FORM1', 'bad email is refused', async () => {
  const r = await postSignup({ email: 'nope', consent: true, turnstileToken: 'x' });
  const d = await r.json().catch(() => ({}));
  expect(r.status === 400 && /doesn't look right/.test(d.error || ''), `status ${r.status} ${JSON.stringify(d.error)}`);
});
await check('FORM2', 'unchecked consent box is refused', async () => {
  const r = await postSignup({ email: 'preview-test@example.com', consent: false, turnstileToken: 'x' });
  const d = await r.json().catch(() => ({}));
  expect(r.status === 400 && /Check the box/.test(d.error || ''), `status ${r.status} ${JSON.stringify(d.error)}`);
});
await check('FORM3', 'a post from another site is refused', async () => {
  const r = await postSignup({ email: 'preview-test@example.com', consent: true, turnstileToken: 'x' }, { origin: 'https://evil.example' });
  expect(r.status === 403, `status ${r.status}`);
});
await check('F11.3a', 'garbage confirm link shows the expired page, no-store', async () => {
  const r = await req('/do-the-next-thing/free/confirm?t=garbage');
  expect(r.status === 400, `status ${r.status}`);
  expect((r.headers.get('cache-control') || '').includes('no-store'), 'missing Cache-Control: no-store');
  expect(/That confirm link has expired or was already used\./.test(await r.text()), 'expired copy missing');
});
await check('F11.3b', 'garbage download link is refused', async () => {
  const r = await req('/do-the-next-thing/free/dl/d1.garbage');
  expect(r.status === 404, `status ${r.status}`);
});
await check('F11.3c', 'no public URL serves the PDF', async () => {
  for (const p of ['/private/dtnt/do-the-next-thing-free-sampler-v2.pdf', '/do-the-next-thing-free-sampler-v2.pdf', '/dtnt/do-the-next-thing-free-sampler-v2.pdf', '/do-the-next-thing/free/dl/']) {
    const r = await req(p);
    expect(r.status !== 200 || !/pdf/.test(r.headers.get('content-type') || ''), `${p} returned a PDF`);
  }
});
await check('F11.4a', 'garbage unsubscribe link is refused', async () => {
  const r = await req('/do-the-next-thing/free/unsubscribe?t=garbage');
  expect(r.status === 400, `status ${r.status}`);
});

// ---------- Token cases (need DTNT_TOKEN_SECRET; send nothing) ----------
if (hasSecret) {
  const probe = 'preview-probe@example.com';
  await check('F11.3d', 'confirm link older than 48 hours is expired', async () => {
    const t = minted('confirm', { e: probe, cv: 'dtnt-free-2026-10-07' }, 48 * 3600, 49 * 3600);
    const r = await req(`/do-the-next-thing/free/confirm?t=${t}`);
    expect(r.status === 400, `status ${r.status}`);
  });
  await check('F11.1a', 'valid download link returns the PDF as an attachment', async () => {
    const t = minted('download', { eh: 'preview-probe' }, 30 * 86400);
    const r = await req(`/do-the-next-thing/free/dl/${t}`);
    expect(r.status === 200, `status ${r.status}`);
    expect(r.headers.get('content-type') === 'application/pdf', `type ${r.headers.get('content-type')}`);
    expect(/^attachment;/.test(r.headers.get('content-disposition') || ''), 'not an attachment');
    expect((r.headers.get('cache-control') || '').includes('no-store'), 'missing no-store');
    const b = Buffer.from(await r.arrayBuffer());
    expect(b.subarray(0, 5).toString() === '%PDF-', 'body is not a PDF');
    return `${b.length} bytes`;
  });
  await check('F11.3e', 'download link older than 30 days is expired', async () => {
    const t = minted('download', { eh: 'preview-probe' }, 30 * 86400, 31 * 86400);
    const r = await req(`/do-the-next-thing/free/dl/${t}`);
    expect(r.status === 410, `status ${r.status}`);
  });
  await check('F10.5a', 'unsubscribe link from 400 days ago still opens (CAN-SPAM 30 days), asks only for a click', async () => {
    const t = minted('unsubscribe', { e: probe }, null, 400 * 86400);
    const r = await req(`/do-the-next-thing/free/unsubscribe?t=${t}`);
    expect(r.status === 200, `status ${r.status}`);
    const h = await r.text();
    expect(/Unsubscribe from Do the Next Thing emails\?/.test(h), 'ask page missing');
    expect(!/type="(email|password|text)"/.test(h), 'asks for more than a click');
  });
  await check('F11.3f', 'a confirm token used as a download token is refused', async () => {
    const t = minted('confirm', { e: probe }, 3600);
    const r = await req(`/do-the-next-thing/free/dl/${t}`);
    expect(r.status === 404, `status ${r.status}`);
  });
}

// ---------- Live cases (real Resend writes and one real email) ----------
if (live && hasSecret) {
  const email = emailArg.trim().toLowerCase();
  let downloadPath = '';
  await check('F11.1b', `confirm for ${email} shows the download (creates the Resend contact, sends the delivery email)`, async () => {
    const t = minted('confirm', { e: email, cv: 'dtnt-free-2026-10-07', sa: new Date().toISOString(), ih: 'preview-test' }, 48 * 3600);
    const r = await req(`/do-the-next-thing/free/confirm?t=${t}`);
    expect(r.status === 200, `status ${r.status}`);
    const h = await r.text();
    const m = h.match(/href="(\/do-the-next-thing\/free\/dl\/[^"]+)"/);
    expect(m, 'download button missing');
    downloadPath = m[1];
    globalThis.__confirmToken = t;
  });
  await check('F11.1c', 'download from the confirm page works', async () => {
    const r = await req(downloadPath);
    expect(r.status === 200 && r.headers.get('content-type') === 'application/pdf', `status ${r.status}`);
  });
  await check('F11.2a', 'repeat confirm click shows the download again (check: no second delivery email arrives)', async () => {
    const r = await req(`/do-the-next-thing/free/confirm?t=${globalThis.__confirmToken}`);
    expect(r.status === 200, `status ${r.status}`);
  });
  await check('F11.4b', 'one-click unsubscribe works', async () => {
    const t = tokens.createToken('unsubscribe', { e: email }, null);
    const r = await req(`/do-the-next-thing/free/unsubscribe?t=${t}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'List-Unsubscribe=One-Click' });
    expect(r.status === 200, `status ${r.status}`);
  });
  await check('F11.4c', 'after unsubscribe, the old confirm link no longer works', async () => {
    const r = await req(`/do-the-next-thing/free/confirm?t=${globalThis.__confirmToken}`);
    expect(r.status === 400, `status ${r.status}`);
  });
} else if (live) {
  console.log('SKIP  live cases: set DTNT_TOKEN_SECRET (same value as in Vercel) to run them');
}

// ---------- Manual checklist (Turnstile needs a real browser) ----------
console.log(`
Manual steps in a browser at ${base}/do-the-next-thing (use your own inbox):
  [ ] F11.1  Sign up with the form. The page says "Check your email." One confirm email arrives.
  [ ] F11.1  Click the confirm link. The page says "You're confirmed." and the download works.
             The delivery email arrives with a download link that works.
  [ ] F11.2  Sign up again with the same address. Same "Check your email." message, and a fresh
             delivery email (not a confirm email) arrives.
  [ ] F11.4  Unsubscribe from the confirm email, and (with a second address) from the delivery email.
             Each link shows one Unsubscribe button and then "You're unsubscribed."
  [ ] F11.4  Sign up again with an unsubscribed address. Same message, and no email arrives.
  [ ] F11.6  Covered above by the script (Turnstile failure is refused).
  [ ] Resend Contacts: confirmed addresses are in the DTNT free segment; unsubscribed ones show
             Unsubscribed. Delete your test contacts when you're done.
  F10 CAN-SPAM, on both emails (open "Show original" for the headers):
  [ ] From is "COTIB LLC <no-reply@cotib.com>" and Reply-To is customerservice@cotib.com.
  [ ] The subject says what's inside.
  [ ] The footer has COTIB LLC, 155 Willowbrook Blvd, Ste 110 #2800, Wayne NJ 07470, United States.
  [ ] The footer has a working Unsubscribe link, and the headers include List-Unsubscribe and
      List-Unsubscribe-Post: List-Unsubscribe=One-Click (Gmail shows "Unsubscribe" next to the sender).
  [ ] Unsubscribe takes effect right away and asks for nothing but a click.
  [ ] Unsubscribed addresses are never exported or shared (process check, not scriptable).
`);

const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
