import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const response = await fetch('https://app.kit.com/forms/0857ce1976/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_address: email }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error('Kit error:', response.status, body);
    return NextResponse.json({ error: 'Subscription failed', details: body }, { status: response.status });
  }

  return NextResponse.json({ success: true });
}
