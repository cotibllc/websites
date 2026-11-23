'use strict';
// The rate limit (100 per 15 minutes per IP) covers form posts and /api/*
// only. Pages and static files never get a 429, since one page load is about
// 15 requests. Each test uses its own client IP through X-Forwarded-For
// (the app trusts one proxy hop), so counts never leak between tests.
process.env.NODE_ENV = 'production';
const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

const PAGE_AND_ASSET_GETS = [
  '/', '/about', '/royal-caribbean', '/theme-parks', '/sports', '/guide',
  '/css/main.bundle.css', '/js/main.js', '/js/nav.js', '/images/logo/ee-favicon.png',
  '/images/logo/ee-circle-seal.svg', '/images/photos/alaska-glacier-card.webp', '/robots.txt', '/sitemap.xml',
];

function statusCounts(statuses) {
  const counts = {};
  for (const s of statuses) counts[s] = (counts[s] || 0) + 1;
  return counts;
}

test('150 page and static GETs from one IP never get a 429', async () => {
  const statuses = [];
  for (let i = 0; i < 150; i++) {
    const res = await fetch(base + PAGE_AND_ASSET_GETS[i % PAGE_AND_ASSET_GETS.length], { headers: { 'X-Forwarded-For': '203.0.113.10' } });
    await res.arrayBuffer();
    statuses.push(res.status);
  }
  assert.deepEqual(statusCounts(statuses), { 200: 150 });
});

test('POST /api/plan from one IP gets a 429 on request 101, with RateLimit headers', async () => {
  const statuses = [];
  let last;
  for (let i = 0; i < 101; i++) {
    last = await fetch(`${base}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.20' },
      body: '{}',
    });
    await last.arrayBuffer();
    statuses.push(last.status);
  }
  // An empty body is refused with 400 before any network call.
  assert.deepEqual(statusCounts(statuses.slice(0, 100)), { 400: 100 });
  assert.equal(statuses[100], 429);
  assert.ok(last.headers.get('ratelimit-limit') || last.headers.get('ratelimit-policy'), 'standard RateLimit headers are sent');
});

test('once an IP hits the form limit, its page and static GETs still load', async () => {
  const headers = { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.30' };
  for (let i = 0; i < 101; i++) {
    const r = await fetch(`${base}/api/plan`, { method: 'POST', headers, body: '{}' });
    await r.arrayBuffer();
  }
  for (const p of ['/', '/css/main.bundle.css', '/js/main.js']) {
    const res = await fetch(base + p, { headers: { 'X-Forwarded-For': '203.0.113.30' } });
    await res.arrayBuffer();
    assert.equal(res.status, 200, p);
  }
});

test('GETs under /api/ count toward the limit too', async () => {
  const statuses = [];
  for (let i = 0; i < 101; i++) {
    const res = await fetch(`${base}/api/no-such-route`, { headers: { 'X-Forwarded-For': '203.0.113.40' } });
    await res.arrayBuffer();
    statuses.push(res.status);
  }
  assert.deepEqual(statusCounts(statuses.slice(0, 100)), { 404: 100 });
  assert.equal(statuses[100], 429);
});
