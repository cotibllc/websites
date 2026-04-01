const { Resend } = require('resend');

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

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, organization, phone, service, message, turnstileToken } = req.body || {};

    if (!name?.trim() || !email?.trim() || !message?.trim() || !turnstileToken) {
        return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Verify Cloudflare Turnstile token
    let verifyData;
    try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                secret: process.env.TURNSTILE_SECRET_KEY,
                response: turnstileToken,
            }),
        });
        verifyData = await verifyRes.json();
    } catch {
        return res.status(500).json({ error: 'Unable to complete security check. Please try again.' });
    }

    if (!verifyData.success) {
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
        await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            replyTo: email,
            subject: `[COTIB] Free Consultation: ${service || 'General Inquiry'} — ${name}`,
            html,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Resend error:', err);
        return res.status(500).json({
            error: 'Failed to send your message. Please try again or use the contact information on this page.',
        });
    }
};
