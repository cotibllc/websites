import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { name, email, subject, message, honeypot } = await request.json();

  // Honeypot check — bots fill this in, humans don't
  if (honeypot) {
    return NextResponse.json({ success: true }); // Silently discard
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: 'Corporate Hardcore <hello@corphardcore.com>',
    to: 'hello@corphardcore.com',
    replyTo: email,
    subject: subject ? `Contact: ${subject}` : `Contact form submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
