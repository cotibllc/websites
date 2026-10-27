// Returns the Resend client. With RESEND_MOCK=1 (never in production) it
// returns a local stub that makes no network calls, logs every call, and
// returns fake IDs, so the guide flow can be proven end to end safely.
const { Resend } = require('resend');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function mockClient() {
  const log = (...args) => console.log('[resend-mock]', ...args);
  const id = (prefix) => `${prefix}_mock_${crypto.randomBytes(6).toString('hex')}`;
  const outbox = [];
  const client = {
    __mock: true,
    outbox,
    emails: {
      async send(opts) {
        const emailId = id('email');
        outbox.push({ id: emailId, ...opts });
        // Optional: write each mocked email to RESEND_MOCK_OUTBOX_DIR for review.
        if (process.env.RESEND_MOCK_OUTBOX_DIR && opts.html) {
          fs.mkdirSync(process.env.RESEND_MOCK_OUTBOX_DIR, { recursive: true });
          fs.writeFileSync(path.join(process.env.RESEND_MOCK_OUTBOX_DIR, `${outbox.length}-${emailId}.html`), opts.html);
        }
        log('emails.send', JSON.stringify({
          id: emailId,
          from: opts.from,
          to: opts.to,
          subject: opts.subject,
          scheduledAt: opts.scheduledAt || null,
          headers: opts.headers || null,
        }));
        return { data: { id: emailId }, error: null };
      },
      async cancel(emailId) {
        log('emails.cancel', JSON.stringify({ id: emailId }));
        return { data: { object: 'email', id: emailId }, error: null };
      },
    },
    contacts: {
      async create(opts) {
        log('contacts.create', JSON.stringify({ email: opts.email, unsubscribed: opts.unsubscribed }));
        return { data: { id: id('contact') }, error: null };
      },
      async update(opts) {
        log('contacts.update', JSON.stringify({ email: opts.email, unsubscribed: opts.unsubscribed }));
        return { data: { id: id('contact') }, error: null };
      },
    },
  };
  return client;
}

let mockSingleton = null;

function getResend() {
  if (process.env.RESEND_MOCK === '1') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_MOCK is not allowed in production');
    }
    if (!mockSingleton) mockSingleton = mockClient();
    return mockSingleton;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

module.exports = { getResend };
