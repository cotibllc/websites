import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { CONTACT_ERRORS } from '@/lib/contact-copy';
import { verifyTurnstile, type TurnstileReason } from '@/lib/turnstile';

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  honeypot?: unknown;
  turnstileToken?: unknown;
};

type ErrorKey = keyof typeof CONTACT_ERRORS;

function getTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function fail(key: ErrorKey, status: number) {
  return NextResponse.json({ error: CONTACT_ERRORS[key], code: key }, { status });
}

// One JSON line per event. Never the secret, the token, the email or the
// message text.
function log(event: string, fields: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ at: new Date().toISOString(), event, ...fields }));
}

// How each refused siteverify answers the visitor.
const TURNSTILE_REPLY: Record<TurnstileReason, { key: ErrorKey; status: number }> = {
  config: { key: 'config', status: 503 },
  expired: { key: 'expired', status: 409 },
  unreachable: { key: 'unreachable', status: 502 },
  hostname: { key: 'failed', status: 400 },
  failed: { key: 'failed', status: 400 },
};

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!resendApiKey || !turnstileSecretKey) {
    console.error('Contact form is missing required environment variables.');
    return fail('notConfigured', 500);
  }

  let body: ContactRequestBody;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    body = parsed as ContactRequestBody;
  } catch {
    log('contact.bad_json');
    return fail('badJson', 400);
  }

  const honeypot = getTrimmedString(body.honeypot);

  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  const name = getTrimmedString(body.name);
  const email = getTrimmedString(body.email);
  const message = getTrimmedString(body.message);
  const turnstileToken = getTrimmedString(body.turnstileToken);

  if (!name || !email || !message) {
    return fail('missingFields', 400);
  }

  if (!turnstileToken || turnstileToken.length > 2048) {
    return fail('noToken', 400);
  }

  const headers = request.headers;
  const ts = await verifyTurnstile({
    secret: turnstileSecretKey,
    token: turnstileToken,
    remoteIp: headers.get('cf-connecting-ip')?.trim() || undefined,
    requestHost: (headers.get('x-forwarded-host') || headers.get('host') || '').split(',')[0].trim(),
  });

  if (!ts.ok) {
    log('contact.turnstile_failed', {
      reason: ts.reason,
      errorCodes: ts.errorCodes,
      hostname: ts.hostname,
      action: ts.action,
      challengeAgeSec: ts.challengeAgeSec,
      httpStatus: ts.httpStatus,
    });
    const { key, status } = TURNSTILE_REPLY[ts.reason];
    return fail(key, status);
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: 'Tech Lead Shift <contact@techleadshift.com>',
    to: 'hello@techleadshift.com',
    replyTo: email,
    subject: `Speaking Inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (error) {
    const e = error as { name?: unknown; statusCode?: unknown; message?: unknown };
    log('contact.send_failed', {
      name: e.name,
      statusCode: e.statusCode,
      message: String(e.message ?? '').split(email).join('[email]').slice(0, 300),
    });
    return fail('send', 500);
  }

  return NextResponse.json({ success: true });
}
