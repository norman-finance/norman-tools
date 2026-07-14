import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GLOBAL_DAILY_LIMIT,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  checkAnalysisRateLimit,
  getClientIp,
  resetForTests,
} from "./rate-limit";

// Fixed epoch: 2026-06-11T12:00:00.000Z
const FIXED_NOW = 1749643200000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  resetForTests();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

// ---------------------------------------------------------------------------
// getClientIp
// ---------------------------------------------------------------------------
describe("getClientIp", () => {
  it("returns x-real-ip when valid, even if x-forwarded-for is also present", () => {
    const headers = new Headers({
      "x-real-ip": "1.2.3.4",
      "x-forwarded-for": "5.6.7.8, 9.10.11.12",
    });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls through to the first x-forwarded-for hop when x-real-ip is absent", () => {
    const headers = new Headers({ "x-forwarded-for": "10.0.0.1, 192.168.1.1" });
    expect(getClientIp(headers)).toBe("10.0.0.1");
  });

  it("returns 'unknown' when the first x-forwarded-for hop is not a valid IP", () => {
    // Invalid first hop — does NOT fall through to the second hop (stricter, simpler)
    const headers = new Headers({ "x-forwarded-for": "999.999.999.999, 1.2.3.4" });
    expect(getClientIp(headers)).toBe("unknown");
  });

  it("returns 'unknown' for a non-IP string in x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "abc, 1.2.3.4" });
    expect(getClientIp(headers)).toBe("unknown");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("accepts a valid IPv6 address in x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "::1" });
    expect(getClientIp(headers)).toBe("::1");
  });
});

// ---------------------------------------------------------------------------
// Per-IP window (in-memory)
// ---------------------------------------------------------------------------
describe("per-IP rate limiting", () => {
  it("allows the first 6 requests within the window", async () => {
    const headers = new Headers({ "x-real-ip": "1.2.3.4" });
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      const result = await checkAnalysisRateLimit(headers);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the 7th request within the window with reason 'ip'", async () => {
    const headers = new Headers({ "x-real-ip": "1.2.3.4" });
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      await checkAnalysisRateLimit(headers);
    }
    const result = await checkAnalysisRateLimit(headers);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("ip");
      expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1);
      expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
    }
  });

  it("re-allows requests after the window expires", async () => {
    const headers = new Headers({ "x-real-ip": "1.2.3.4" });
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      await checkAnalysisRateLimit(headers);
    }
    // Advance past the window
    vi.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1000);
    const result = await checkAnalysisRateLimit(headers);
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// IP isolation and "unknown" bucket
// ---------------------------------------------------------------------------
describe("IP bucket isolation", () => {
  it("distinct IPs do not share rate limit buckets", async () => {
    const headersA = new Headers({ "x-real-ip": "10.0.0.1" });
    const headersB = new Headers({ "x-real-ip": "10.0.0.2" });

    // Exhaust A's quota
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      await checkAnalysisRateLimit(headersA);
    }
    const blockedA = await checkAnalysisRateLimit(headersA);
    expect(blockedA.allowed).toBe(false);

    // B should still be allowed
    const allowedB = await checkAnalysisRateLimit(headersB);
    expect(allowedB.allowed).toBe(true);
  });

  it("requests with invalid IP headers share the 'unknown' bucket", async () => {
    const garbage1 = new Headers({ "x-forwarded-for": "not-an-ip" });
    const garbage2 = new Headers({ "x-forwarded-for": "also-not-an-ip" });

    // Both should resolve to "unknown" and share one bucket
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      // Alternate between the two garbage headers
      await checkAnalysisRateLimit(i % 2 === 0 ? garbage1 : garbage2);
    }
    // The 7th should be blocked regardless of which garbage header is used
    const result = await checkAnalysisRateLimit(garbage1);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("ip");
    }
  });
});

// ---------------------------------------------------------------------------
// Expired entries are pruned
// ---------------------------------------------------------------------------
describe("pruning expired entries", () => {
  it("expired entries are pruned on subsequent calls, allowing new window to start", async () => {
    const headers = new Headers({ "x-real-ip": "172.16.0.1" });

    // Exhaust quota
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      await checkAnalysisRateLimit(headers);
    }
    expect((await checkAnalysisRateLimit(headers)).allowed).toBe(false);

    // Advance time past window — the stale entry should be pruned on the next call
    vi.advanceTimersByTime(RATE_LIMIT_WINDOW_MS + 1);

    // First call after expiry prunes the old entry and allows
    const after = await checkAnalysisRateLimit(headers);
    expect(after.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Global daily budget
// ---------------------------------------------------------------------------
describe("global daily budget", () => {
  it(`blocks after ${GLOBAL_DAILY_LIMIT} total analyses with reason 'daily_budget'`, async () => {
    // Exhaust the budget using many distinct IPs (each gets a fresh bucket)
    for (let i = 0; i < GLOBAL_DAILY_LIMIT; i++) {
      const ip = `10.0.${Math.floor(i / 250)}.${i % 250}`;
      const headers = new Headers({ "x-real-ip": ip });
      const result = await checkAnalysisRateLimit(headers);
      expect(result.allowed).toBe(true);
    }

    // One more distinct IP should now be blocked by the daily budget
    const overHeaders = new Headers({ "x-real-ip": "192.168.99.99" });
    const over = await checkAnalysisRateLimit(overHeaders);
    expect(over.allowed).toBe(false);
    if (!over.allowed) {
      expect(over.reason).toBe("daily_budget");
      expect(over.retryAfterSeconds).toBeGreaterThan(0);
      expect(over.retryAfterSeconds).toBeLessThanOrEqual(86400);
    }
  });

  it("resets the daily budget after UTC midnight", async () => {
    // Exhaust budget
    for (let i = 0; i < GLOBAL_DAILY_LIMIT; i++) {
      const ip = `10.1.${Math.floor(i / 250)}.${i % 250}`;
      await checkAnalysisRateLimit(new Headers({ "x-real-ip": ip }));
    }
    const blocked = await checkAnalysisRateLimit(new Headers({ "x-real-ip": "1.1.1.1" }));
    expect(blocked.allowed).toBe(false);

    // Advance past UTC midnight (FIXED_NOW is 12:00:00 UTC, so 12h01m crosses midnight)
    vi.advanceTimersByTime(12 * 60 * 60 * 1000 + 61 * 1000);

    // New day — a fresh IP should be allowed again
    const result = await checkAnalysisRateLimit(new Headers({ "x-real-ip": "2.2.2.2" }));
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Upstash path
// ---------------------------------------------------------------------------
describe("Upstash backend", () => {
  it("calls the Upstash incr endpoint with correct URL and Bearer auth when env vars are set", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret-token");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 1 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const headers = new Headers({ "x-real-ip": "5.5.5.5" });
    const result = await checkAnalysisRateLimit(headers);
    expect(result.allowed).toBe(true);

    // Verify fetch was called with the incr path and Bearer header,
    // and that the per-IP incr comes BEFORE the daily incr.
    const calls = mockFetch.mock.calls as [string, { headers: { Authorization: string } }][];
    const incrCalls = calls.filter(([url]) => url.includes("/incr/"));
    expect(incrCalls.length).toBeGreaterThanOrEqual(2);
    expect(incrCalls[0][0]).toContain("/incr/finanzamt:ip:");
    expect(incrCalls[1][0]).toContain("/incr/finanzamt:daily:");
    expect(incrCalls[0][1].headers.Authorization).toBe("Bearer secret-token");

    vi.unstubAllGlobals();
  });

  it("does not increment the daily counter when the IP is over its rate limit", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret-token");

    // IP incr returns 7 (over the 6-request limit); daily should never be called.
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 7 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const headers = new Headers({ "x-real-ip": "8.8.8.8" });
    const result = await checkAnalysisRateLimit(headers);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("ip");
      expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    }

    // No fetch call should target the daily counter key
    const calls = mockFetch.mock.calls as [string][];
    const dailyCalls = calls.filter(([url]) => url.includes("/incr/finanzamt:daily:"));
    expect(dailyCalls).toHaveLength(0);

    vi.unstubAllGlobals();
  });

  it("falls back to in-memory and still allows the request when fetch rejects (fail-open)", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret-token");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    const headers = new Headers({ "x-real-ip": "6.6.6.6" });
    const result = await checkAnalysisRateLimit(headers);
    // Fail-open: in-memory fallback should allow the request
    expect(result.allowed).toBe(true);

    vi.unstubAllGlobals();
  });

  it("uses the finanzamt: key prefix in Upstash calls", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret-token");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 1 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await checkAnalysisRateLimit(new Headers({ "x-real-ip": "7.7.7.7" }));

    const calls = mockFetch.mock.calls as [string][];
    expect(calls.some(([url]) => url.includes("finanzamt:"))).toBe(true);

    vi.unstubAllGlobals();
  });
});
