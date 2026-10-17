// Guide lead store. Saves each lead with its guide type and the scheduled
// Resend email IDs (day 3 and day 7) so unsubscribe can cancel them.
//
// Adapter: a JSON file at LEAD_STORE_PATH. In development it defaults to
// .data/leads.json. In production there is no default because the Vercel
// filesystem is read-only and not shared between instances; until a real
// store is configured, the store is a no-op and unsubscribe relies on the
// IDs carried in the signed token plus the Resend contact "unsubscribed" flag.
const fs = require('fs');
const path = require('path');

function storePath() {
  if (process.env.LEAD_STORE_PATH) return process.env.LEAD_STORE_PATH;
  if (process.env.NODE_ENV === 'production') return null;
  return path.join(__dirname, '..', '.data', 'leads.json');
}

function readAll(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeAll(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

const keyFor = (email) => String(email).trim().toLowerCase();

function enabled() {
  return Boolean(storePath());
}

function getLead(email) {
  const file = storePath();
  if (!file) return null;
  return readAll(file)[keyFor(email)] || null;
}

function upsertLead(email, fields) {
  const file = storePath();
  if (!file) return null;
  const all = readAll(file);
  const key = keyFor(email);
  const now = new Date().toISOString();
  all[key] = { email: key, createdAt: now, ...(all[key] || {}), ...fields, updatedAt: now };
  writeAll(file, all);
  return all[key];
}

module.exports = { enabled, getLead, upsertLead, storePath };
