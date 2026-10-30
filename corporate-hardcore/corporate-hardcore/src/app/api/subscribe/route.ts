import { NextResponse } from 'next/server';
import { handleSubscribe, isValidEmail } from '@/lib/kit-subscribe';
import { createRateLimiter } from '@/lib/rate-limit';
import { SIGNUP_ERRORS, type SignupErrorCode } from '@/lib/signup-copy';
import { verifyTurnstile, type TurnstileReason } from '@/lib/turnstile';

// Per server instance, see rate-limit.ts. Five tries per address per ten
// minutes is plenty for a person fixing a typo.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function fail(code: SignupErrorCode, status: number) {
  return NextResponse.json({ error: SIGNUP_ERRORS[code], code }, { status });
}

// One JSON line per event. Never the secret, the token, the email or the Kit key.
function log(event: string, fields: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ at: new Date().toISOString(), event, ...fields }));
}

const TURNSTILE_REPLY: Record<TurnstileReason, { code: SignupErrorCode; status: number }> = {
  config: { code: 'notConfigured', status: 503 },
  expired: { code: 'expired', status: 409 },
  unreachable: { code: 'unreachable', status: 502 },
  hostname: { code: 'failed', status: 400 },
  failed: { code: 'failed', status: 400 },
};

function clientIp(headers: Headers) {
  return (
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    undefined
  );
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    payload = parsed as Record<string, unknown>;
  } catch {
    log('subscribe.bad_json');
    return fail('badJson', 400);
  }

  const list = payload.source === 'merch' ? 'merch' : 'field_notes';

  // Honeypot: people never see the field, so anything in it is a bot. Answer
  // like a success so the bot learns nothing, and send nothing to Kit.
  if (typeof payload.honeypot === 'string' && payload.honeypot.trim()) {
    log('subscribe.honeypot', { list });
    return NextResponse.json({ success: true });
  }

  const ip = clientIp(request.headers);
  if (ip && !limiter.hit(ip)) {
    log('subscribe.rate_limited', { list });
    return fail('rateLimited', 429);
  }

  if (!isValidEmail(payload.email)) {
    return fail('invalidEmail', 400);
  }

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    log('subscribe.misconfigured', { missing: ['TURNSTILE_SECRET_KEY'] });
    return fail('notConfigured', 503);
  }

  const token = typeof payload.turnstileToken === 'string' ? payload.turnstileToken.trim() : '';
  if (!token || token.length > 2048) {
    return fail('noToken', 400);
  }

  const verdict = await verifyTurnstile({
    secret,
    token,
    remoteIp: request.headers.get('cf-connecting-ip')?.trim() || undefined,
    requestHost: (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').split(',')[0].trim(),
  });
  if (!verdict.ok) {
    log('subscribe.turnstile_failed', {
      list,
      reason: verdict.reason,
      errorCodes: verdict.errorCodes,
      hostname: verdict.hostname,
      action: verdict.action,
      challengeAgeSec: verdict.challengeAgeSec,
      httpStatus: verdict.httpStatus,
    });
    const reply = TURNSTILE_REPLY[verdict.reason];
    return fail(reply.code, reply.status);
  }

  const result = await handleSubscribe(
    { email: payload.email, source: payload.source },
    {
      KIT_API_KEY: process.env.KIT_API_KEY,
      KIT_MERCH_FORM_ID: process.env.KIT_MERCH_FORM_ID,
      KIT_MERCH_TAG_ID: process.env.KIT_MERCH_TAG_ID,
    },
    (url, init) => fetch(url, init),
  );

  return NextResponse.json(result.body, { status: result.status });
}
