// Best effort per-IP limit for /api/subscribe. It lives in this server
// instance's memory only: no database, no new service. Vercel can run several
// instances and restarts them, so a determined bot can get past it. Turnstile
// is the real check; this only slows a single address that keeps retrying.

export type RateLimiter = {
  // true when this hit is allowed, false when the address is over the limit.
  hit: (key: string) => boolean;
};

export function createRateLimiter(opts: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  now?: () => number;
}): RateLimiter {
  const { limit, windowMs, maxKeys = 5000, now = Date.now } = opts;
  const hits = new Map<string, number[]>();

  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.delete(key);
      hits.set(key, recent);
      // Keep memory bounded: drop the oldest addresses first.
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }
      return true;
    },
  };
}
