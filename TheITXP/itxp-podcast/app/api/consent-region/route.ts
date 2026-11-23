import { consentRegion } from "@/lib/consent";

// Per-visitor answer: never cache it at the CDN, or one country's answer would serve another.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const region = consentRegion(request.headers.get("x-vercel-ip-country"));
  return Response.json(
    { region },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
