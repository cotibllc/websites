const { Resend } = require('resend');
const http = require('../lib/dtnt/http');
const { PRODUCTION_HOSTS } = require('../lib/dtnt/config');
const { verifyTurnstile } = require('../lib/dtnt/turnstile');

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = 'customerservice@cotib.com';
const FROM_EMAIL = 'COTIB LLC <no-reply@cotib.com>';

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function originAllowed(req) {
    const origin = http.header(req, 'origin');
    if (!origin) return false;
    let host;
    try { host = new URL(origin).host.toLowerCase(); } catch { return false; }
    return host === http.requestHost(req) || PRODUCTION_HOSTS.includes(host);
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Same Origin rule as the sampler signup: only pages on cotib.com (or the
    // host that served this request, for previews) may post here.
    if (!originAllowed(req)) {
        http.log('contact.bad_origin', {
            origin: http.header(req, 'origin').slice(0, 200) || '(none)',
            requestHost: http.requestHost(req),
        });
        return res.status(403).json({ error: 'This form only works on www.cotib.com. Open www.cotib.com/contact and try again.' });
    }

    // Best effort, per function instance, no new infrastructure (same helper
    // as the sampler signup). Turnstile stays the real gate.
    const visitorIp = http.header(req, 'cf-connecting-ip') || http.clientIp(req);
    if (http.rateLimited(`contact:${visitorIp}`, 5)) {
        http.log('contact.rate_limited');
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: 'Too many tries from here. Wait a minute and try again.' });
    }

    const { name, email, organization, phone, service, message, turnstileToken, website } = req.body || {};

    // Honeypot: real users never fill this hidden field. Pretend success so
    // bots don't learn they were caught.
    if (website) {
        return res.status(200).json({ success: true });
    }

    if (!name?.trim() || !email?.trim() || !message?.trim() || !turnstileToken) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Cloudflare Turnstile, shared with the sampler signup: trimmed secret,
    // 8 second timeout, hostname check, and a reason for every refusal.
    const ts = await verifyTurnstile(turnstileToken, { ip: visitorIp, host: http.requestHost(req) });
    if (!ts.ok) {
        // Reason and Cloudflare's error-codes only, never the secret, the
        // token or the visitor's email.
        http.log('contact.turnstile_failed', {
            reason: ts.reason,
            errorCodes: ts.errorCodes,
            hostname: ts.hostname,
            challengeAgeSec: ts.challengeAgeSec,
        });
        if (ts.reason === 'unreachable') {
            return res.status(500).json({ error: 'Unable to complete security check. Please try again.' });
        }
        if (ts.reason === 'config') {
            return res.status(503).json({ error: 'The contact form is not working on our end right now. Please email customerservice@cotib.com.' });
        }
        return res.status(400).json({ error: 'Security check failed. Please refresh the page and try again.' });
    }

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-left: 4px solid #0099FF; padding-left: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #0099FF;">New Free Consultation Request</h2>
    <p style="margin: 4px 0 0; color: #666;">Submitted via cotib.com</p>
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr style="background: #f8f9fa;">
      <td style="padding: 10px 12px; font-weight: bold; width: 160px; border-bottom: 1px solid #eee;">Name</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">
        <a href="mailto:${escapeHtml(email)}" style="color: #0099FF;">${escapeHtml(email)}</a>
      </td>
    </tr>
    <tr style="background: #f8f9fa;">
      <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Organization</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">
        ${escapeHtml(organization) || '<em style="color:#999">Not provided</em>'}
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Phone</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #eee;">
        ${escapeHtml(phone) || '<em style="color:#999">Not provided</em>'}
      </td>
    </tr>
    <tr style="background: #f8f9fa;">
      <td style="padding: 10px 12px; font-weight: bold;">Service of Interest</td>
      <td style="padding: 10px 12px;">
        ${escapeHtml(service) || '<em style="color:#999">Not specified</em>'}
      </td>
    </tr>
  </table>
  <div style="background: #f8f9fa; padding: 16px; border-top: 3px solid #0099FF;">
    <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: bold;">Message</p>
    <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
  </div>
  <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #999; margin: 0;">
    Reply directly to this email to respond to ${escapeHtml(name)}.
  </p>
</body>
</html>`;

    try {
        // The Resend SDK returns { error } instead of throwing on an API
        // error, so check it, or a failed send would show success.
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            replyTo: email,
            subject: `[COTIB] Free Consultation: ${service || 'General Inquiry'}, from ${name}`,
            html,
        });
        if (error) throw Object.assign(new Error(String(error.message || 'send failed')), { name: error.name, statusCode: error.statusCode });

        http.log('contact.sent', { service: String(service || 'General Inquiry').slice(0, 60) });
        return res.status(200).json({ success: true });
    } catch (err) {
        http.log('contact.send_failed', {
            name: err && err.name,
            statusCode: err && err.statusCode,
            message: String((err && err.message) || '').split(String(email)).join('[email]').slice(0, 300),
        });
        return res.status(500).json({
            error: 'Failed to send your message. Please try again or use the contact information on this page.',
        });
    }
};
