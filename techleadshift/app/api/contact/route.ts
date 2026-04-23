import { NextResponse } from 'next/server';
import { Resend } from 'resend';

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  honeypot?: unknown;
  turnstileToken?: unknown;
};

function getTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!resendApiKey || !turnstileSecretKey) {
    console.error('Contact form is missing required environment variables.');
    return NextResponse.json({ error: 'Contact form is not configured.' }, { status: 500 });
  }

  const body = (await request.json()) as ContactRequestBody;
  const honeypot = getTrimmedString(body.honeypot);

  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  const name = getTrimmedString(body.name);
  const email = getTrimmedString(body.email);
  const message = getTrimmedString(body.message);
  const turnstileToken = getTrimmedString(body.turnstileToken);

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!turnstileToken) {
    return NextResponse.json({ error: 'Captcha verification is required' }, { status: 400 });
  }

  const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: turnstileSecretKey,
      response: turnstileToken,
    }).toString(),
    cache: 'no-store',
  });

  if (!turnstileRes.ok) {
    console.error(`Turnstile verification failed with status ${turnstileRes.status}.`);
    return NextResponse.json({ error: 'Captcha verification failed' }, { status: 502 });
  }

  const turnstileData = await turnstileRes.json();
  if (!turnstileData.success) {
    return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 });
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
    console.error('Resend error:', JSON.stringify(error));
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
