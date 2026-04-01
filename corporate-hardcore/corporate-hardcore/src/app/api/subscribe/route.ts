import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const response = await fetch('https://api.convertkit.com/v3/forms/9272877/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.KIT_API_KEY, email }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('Kit error:', response.status, body);
    return NextResponse.json({ error: 'Subscription failed', details: body }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
