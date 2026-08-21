/**
 * Best-effort in-memory rate limiter for public, unauthenticated POST
 * endpoints (lead/booking submission) — a defense against basic scripted
 * spam alongside the existing honeypot field, not a substitute for a WAF.
 *
 * Deliberately simple and dependency-free: a fixed-window counter keyed by
 * `${scope}:${ip}`. Known, accepted limitation on serverless (Vercel): each
 * warm function instance holds its own copy of `buckets`, so a burst spread
 * across multiple cold/warm instances isn't caught by this alone — a
 * guaranteed cross-instance limit needs a shared store (Upstash Redis /
 * Vercel KV), which is a new service this project doesn't have yet. This
 * still meaningfully raises the bar against unsophisticated bots hammering
 * a single warm instance, which is the common case in practice.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so `buckets` doesn't grow forever on a long-lived
// instance — runs at most once a minute, piggybacking on whatever request
// happens to land after that mark, rather than a separate timer.
let lastSweep = 0;
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true if `ip` has exceeded `limit` requests within `windowMs` for
 * the given `scope` (a separate counter per scope, so /api/leads and
 * /api/bookings don't share a budget).
 */
export function isRateLimited(scope: string, ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const key = `${scope}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") || "unknown";
}
