// Cloudflare Turnstile siteverify, shared by every corphardcore.com form that
// shows the widget. Same rules as cotib.com PR #34 and the techleadshift /work
// fix: every refusal comes back with a reason and Cloudflare's error-codes so
// the log says which case it was. The secret and the token are never returned
// or logged.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

export const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const SITEVERIFY_TIMEOUT_MS = 8000;
export const PRODUCTION_HOSTS = ["www.corphardcore.com", "corphardcore.com"] as const;

// config: our secret is missing or wrong. expired: token used already or older
// than 300 seconds. hostname: token solved on another site. unreachable:
// siteverify did not answer with JSON in time. failed: anything else refused.
export type TurnstileReason = "config" | "expired" | "hostname" | "failed" | "unreachable";

export type TurnstileDetail = {
  errorCodes: string[];
  hostname?: string;
  action?: string;
  challengeAgeSec?: number;
  httpStatus?: number;
};

export type TurnstileResult = ({ ok: true } | { ok: false; reason: TurnstileReason }) & TurnstileDetail;

const CONFIG_CODES = new Set(["missing-input-secret", "invalid-input-secret"]);
const EXPIRED_CODES = new Set(["timeout-or-duplicate"]);

type SiteverifyReply = {
  success?: unknown;
  "error-codes"?: unknown;
  hostname?: unknown;
  action?: unknown;
  challenge_ts?: unknown;
};

export async function verifyTurnstile(opts: {
  secret: string;
  token: string;
  remoteIp?: string;
  requestHost?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}): Promise<TurnstileResult> {
  const { fetchImpl = fetch, now = Date.now } = opts;
  const secret = opts.secret.trim();
  if (!secret) return { ok: false, reason: "config", errorCodes: ["missing-input-secret"] };

  const form = new URLSearchParams({ secret, response: opts.token });
  if (opts.remoteIp) form.set("remoteip", opts.remoteIp);

  let res: Response;
  let data: SiteverifyReply;
  try {
    res = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, reason: "unreachable", errorCodes: [] };
  }
  // Cloudflare answers a bad secret or token with HTTP 400 and a JSON body
  // carrying the error-codes, so read the body whatever the status. Only a
  // reply with no usable JSON counts as unreachable.
  const httpStatus = res.ok ? {} : { httpStatus: res.status };
  try {
    data = (await res.json()) as SiteverifyReply;
  } catch {
    return { ok: false, reason: "unreachable", errorCodes: [], httpStatus: res.status };
  }
  if (!data || typeof data !== "object" || typeof data.success !== "boolean") {
    return { ok: false, reason: "unreachable", errorCodes: [], httpStatus: res.status };
  }

  const codes = Array.isArray(data["error-codes"]) ? data["error-codes"].map(String).slice(0, 5) : [];
  const ts = typeof data.challenge_ts === "string" ? Date.parse(data.challenge_ts) : NaN;
  const detail: TurnstileDetail = {
    errorCodes: codes,
    ...httpStatus,
    ...(typeof data.hostname === "string" && data.hostname ? { hostname: data.hostname.slice(0, 253) } : {}),
    ...(typeof data.action === "string" && data.action ? { action: data.action.slice(0, 64) } : {}),
    ...(Number.isFinite(ts) ? { challengeAgeSec: Math.round((now() - ts) / 1000) } : {}),
  };

  if (data.success !== true) {
    const reason: TurnstileReason = codes.some((c) => CONFIG_CODES.has(c))
      ? "config"
      : codes.some((c) => EXPIRED_CODES.has(c))
        ? "expired"
        : "failed";
    return { ok: false, reason, ...detail };
  }

  const allowed = new Set<string>([...PRODUCTION_HOSTS, (opts.requestHost ?? "").split(":")[0].toLowerCase()]);
  if (detail.hostname && !allowed.has(detail.hostname.toLowerCase())) return { ok: false, reason: "hostname", ...detail };
  return { ok: true, ...detail };
}
