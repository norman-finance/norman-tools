import { isIP } from "node:net";

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 6;
export const GLOBAL_DAILY_LIMIT = 300; // analyses/day across all users

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; reason: "ip" | "daily_budget"; retryAfterSeconds: number };

// In-memory stores — shared within a single serverless instance.
// Per-instance state means the daily budget is not globally enforced unless Upstash is configured,
// but it still bounds worst-case spend per instance.
const ipStore = new Map<string, { count: number; resetAt: number }>();
const dailyStore = new Map<string, number>();

/** Clears in-memory state between tests. */
export function resetForTests(): void {
  ipStore.clear();
  dailyStore.clear();
}

/**
 * Resolves the trustworthy client IP from request headers.
 * Priority: x-real-ip (set by Vercel to the true client IP), then first x-forwarded-for hop.
 * Each candidate is validated with isIP — spoofers with non-IP strings collapse into
 * a single shared "unknown" bucket rather than bypassing the limiter with fake IPs.
 */
export function getClientIp(headers: Headers): string {
  const candidates: (string | null)[] = [
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0] ?? null,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim() ?? "";
    if (trimmed && isIP(trimmed) !== 0) {
      return trimmed;
    }
  }

  // No valid IP found — all such requests share one limited bucket.
  return "unknown";
}

/** Returns seconds until the next UTC midnight. */
function secondsUntilMidnight(): number {
  const now = Date.now();
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return Math.ceil((tomorrow.getTime() - now) / 1000);
}

/** Current UTC date key, e.g. "2026-06-11". */
function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Checks and increments both per-IP and global daily counters via Upstash REST API.
 * Uses fetch with GET /incr/<key> and GET /expire/<key>/<seconds> endpoints.
 * Returns null on any error so the caller can fall back to in-memory.
 *
 * Fail-open decision: on Upstash errors we degrade to in-memory rather than blocking
 * all requests, accepting the tradeoff that a store outage doesn't take down the feature.
 *
 * Order matters: the per-IP counter is checked FIRST. If the IP is over its limit we
 * return immediately without touching the daily counter, preventing a throttled spammer
 * from burning the shared daily budget via repeated requests.
 */
async function checkUpstash(
  ipKey: string,
  dailyKey: string,
): Promise<RateLimitDecision | null> {
  // Read env vars inside the function so tests can stub them with vi.stubEnv.
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // Check + increment per-IP counter FIRST.
    // Reject over-limit IPs before touching the shared daily budget.
    const ipRes = await fetch(`${url}/incr/finanzamt:${ipKey}`, { headers });
    if (!ipRes.ok) {
      console.warn("[rate-limit] Upstash IP incr failed, falling back to in-memory");
      return null;
    }
    const ipData = (await ipRes.json()) as { result: number };
    const ipCount = ipData.result;

    if (ipCount === 1) {
      // First hit in this window — set expiry.
      await fetch(`${url}/expire/finanzamt:${ipKey}/${Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)}`, {
        headers,
      });
    }

    if (ipCount > RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        reason: "ip",
        retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
      };
    }

    // Check + increment global daily counter only for requests that pass the IP check.
    const dailyRes = await fetch(`${url}/incr/finanzamt:${dailyKey}`, { headers });
    if (!dailyRes.ok) {
      console.warn("[rate-limit] Upstash daily incr failed, falling back to in-memory");
      return null;
    }
    const dailyData = (await dailyRes.json()) as { result: number };
    const dailyCount = dailyData.result;

    if (dailyCount === 1) {
      // First increment today — set expiry to end of UTC day.
      await fetch(`${url}/expire/finanzamt:${dailyKey}/${secondsUntilMidnight()}`, { headers });
    }

    if (dailyCount > GLOBAL_DAILY_LIMIT) {
      return { allowed: false, reason: "daily_budget", retryAfterSeconds: secondsUntilMidnight() };
    }

    return { allowed: true };
  } catch (err) {
    console.warn("[rate-limit] Upstash fetch error, falling back to in-memory:", err);
    return null;
  }
}

/**
 * Checks rate limits using in-memory stores.
 * Prunes expired per-IP entries on every call.
 * Checks daily budget before incrementing the per-IP counter.
 */
function checkInMemory(ipKey: string, dailyKey: string): RateLimitDecision {
  const now = Date.now();

  // Unconditionally prune expired per-IP entries on every call.
  for (const [key, value] of ipStore) {
    if (value.resetAt <= now) ipStore.delete(key);
  }

  // Check global daily budget first.
  const dailyCount = dailyStore.get(dailyKey) ?? 0;
  if (dailyCount >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false, reason: "daily_budget", retryAfterSeconds: secondsUntilMidnight() };
  }

  // Check per-IP window.
  const current = ipStore.get(ipKey);
  if (current && current.resetAt > now && current.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { allowed: false, reason: "ip", retryAfterSeconds: retryAfter };
  }

  // Request is allowed — increment both counters.
  dailyStore.set(dailyKey, dailyCount + 1);

  if (!current || current.resetAt <= now) {
    ipStore.set(ipKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    current.count += 1;
  }

  return { allowed: true };
}

/**
 * Checks whether the incoming request is within rate limits.
 * Tries Upstash first when configured; falls back to in-memory on any error.
 */
export async function checkAnalysisRateLimit(headers: Headers): Promise<RateLimitDecision> {
  const ip = getClientIp(headers);
  const ipKey = `ip:${ip}`;
  const dailyKey = `daily:${utcDateKey()}`;

  const upstashResult = await checkUpstash(ipKey, dailyKey);
  if (upstashResult !== null) return upstashResult;

  return checkInMemory(ipKey, dailyKey);
}
