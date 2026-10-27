import { NextResponse } from 'next/server';
import { handleSubscribe } from '@/lib/kit-subscribe';

export async function POST(request: Request) {
  const payload = await request.json();

  const result = await handleSubscribe(
    payload,
    {
      KIT_API_KEY: process.env.KIT_API_KEY,
      KIT_MERCH_FORM_ID: process.env.KIT_MERCH_FORM_ID,
      KIT_MERCH_TAG_ID: process.env.KIT_MERCH_TAG_ID,
    },
    (url, init) => fetch(url, init),
  );

  return NextResponse.json(result.body, { status: result.status });
}
