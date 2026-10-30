/**
 * Kit (ConvertKit v3) subscribe routing for /api/subscribe.
 *
 * - No source, or any source other than "merch": Field Notes newsletter,
 *   form 9272877. Behavior is unchanged from the original route.
 * - source "merch": destination comes only from env, never 9272877.
 *     KIT_MERCH_FORM_ID set  -> POST /v3/forms/{id}/subscribe
 *                               (plus tags: [KIT_MERCH_TAG_ID] if that is set too)
 *     only KIT_MERCH_TAG_ID  -> POST /v3/tags/{id}/subscribe
 *     neither set            -> 503, nothing is sent to Kit
 */

export const FIELD_NOTES_FORM_ID = "9272877";
const KIT_API_BASE = "https://api.convertkit.com/v3";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KIT_ID_RE = /^\d+$/;

// Same check for both lists. The route runs it before Turnstile, and each
// handler runs it again so a bad address never reaches Kit.
export function isValidEmail(raw: unknown): boolean {
  const email = typeof raw === "string" ? raw.trim() : "";
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email);
}

export type SubscribeEnv = {
  KIT_API_KEY?: string;
  KIT_MERCH_FORM_ID?: string;
  KIT_MERCH_TAG_ID?: string;
};

export type SubscribeResult = { status: number; body: Record<string, unknown> };

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type MerchDestination =
  | { kind: "form"; url: string; tagId?: string }
  | { kind: "tag"; url: string }
  | { kind: "none"; reason: string };

export function resolveMerchDestination(env: SubscribeEnv): MerchDestination {
  const formId = env.KIT_MERCH_FORM_ID?.trim() || undefined;
  const tagId = env.KIT_MERCH_TAG_ID?.trim() || undefined;

  if (!formId && !tagId) {
    return { kind: "none", reason: "Merch notify signup is not configured yet." };
  }
  if ((formId && !KIT_ID_RE.test(formId)) || (tagId && !KIT_ID_RE.test(tagId))) {
    return { kind: "none", reason: "Merch notify signup is misconfigured." };
  }
  if (formId === FIELD_NOTES_FORM_ID) {
    // Guard: merch must never land on the Field Notes list.
    return { kind: "none", reason: "Merch notify signup is misconfigured." };
  }
  if (formId) {
    return { kind: "form", url: `${KIT_API_BASE}/forms/${formId}/subscribe`, tagId };
  }
  return { kind: "tag", url: `${KIT_API_BASE}/tags/${tagId}/subscribe` };
}

export async function handleSubscribe(
  payload: unknown,
  env: SubscribeEnv,
  fetchImpl: FetchLike,
): Promise<SubscribeResult> {
  const data = (payload ?? {}) as { email?: unknown; source?: unknown };

  if (data.source === "merch") {
    return handleMerch(data.email, env, fetchImpl);
  }
  return handleFieldNotes(data.email, env, fetchImpl);
}

async function handleMerch(rawEmail: unknown, env: SubscribeEnv, fetchImpl: FetchLike): Promise<SubscribeResult> {
  if (!isValidEmail(rawEmail)) {
    return { status: 400, body: { error: "Please enter a valid email address." } };
  }
  const email = String(rawEmail).trim();

  const destination = resolveMerchDestination(env);
  if (destination.kind === "none") {
    console.error(`Merch signup unavailable: ${destination.reason}`);
    return { status: 503, body: { error: destination.reason } };
  }

  const kitApiKey = env.KIT_API_KEY;
  if (!kitApiKey) {
    console.error("Merch signup is missing KIT_API_KEY.");
    return { status: 503, body: { error: "Merch notify signup is not configured yet." } };
  }

  const kitBody: Record<string, unknown> = { api_key: kitApiKey, email };
  if (destination.kind === "form" && destination.tagId) {
    kitBody.tags = [Number(destination.tagId)];
  }

  try {
    const response = await fetchImpl(destination.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kitBody),
    });
    if (!response.ok) {
      // Status only. Never log the request body (it carries the API key).
      console.error(`Kit merch ${destination.kind} subscribe failed with status ${response.status}.`);
      return { status: 502, body: { error: "Request could not be filed. Try again later." } };
    }
  } catch {
    console.error(`Kit merch ${destination.kind} subscribe request failed.`);
    return { status: 502, body: { error: "Request could not be filed. Try again later." } };
  }

  return { status: 200, body: { success: true } };
}

// Original Field Notes behavior, plus the email format check.
async function handleFieldNotes(rawEmail: unknown, env: SubscribeEnv, fetchImpl: FetchLike): Promise<SubscribeResult> {
  const kitApiKey = env.KIT_API_KEY;
  if (!kitApiKey) {
    console.error("Newsletter signup is missing KIT_API_KEY.");
    return { status: 500, body: { error: "Newsletter signup is not configured." } };
  }

  if (!rawEmail) {
    return { status: 400, body: { error: "Email is required" } };
  }
  if (!isValidEmail(rawEmail)) {
    return { status: 400, body: { error: "Please enter a valid email address." } };
  }
  const email = String(rawEmail).trim();

  const response = await fetchImpl(`${KIT_API_BASE}/forms/${FIELD_NOTES_FORM_ID}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: kitApiKey, email }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Kit error:", response.status, body);
    return { status: response.status, body: { error: "Subscription failed." } };
  }

  return { status: 200, body: { success: true } };
}
