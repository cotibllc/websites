import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const { name, email, reason, message, honeypot, turnstileToken } = await request.json();

  // Honeypot — silently discard bot submissions
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  if (!name || !email || !reason || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify Turnstile token
  const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  });
  const turnstileData = await turnstileRes.json();
  if (!turnstileData.success) {
    return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'The IT XP <social-media@theitxp.com>',
    to: 'social-media@theitxp.com',
    replyTo: email,
    subject: `[${reason}] Contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nReason: ${reason}\n\n${message}`,
  });

  if (error) {
    console.error('Resend error:', JSON.stringify(error));
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
