import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LoginRateLimitResult = {
  allowed: boolean;
  configured: boolean;
  retryAfterSeconds: number | null;
};

type LoginRateLimitProvider = {
  limit(identifier: string): Promise<{ success: boolean; reset: number }>;
};

let provider: LoginRateLimitProvider | null | undefined;

function getProvider(): LoginRateLimitProvider | null {
  if (provider !== undefined) return provider;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Distributed login rate limiting is not configured.");
    }

    provider = null;
    return provider;
  }

  const redis = new Redis({
    url,
    token,
    retry: { retries: 2, backoff: (attempt) => attempt * 100 },
    signal: () => AbortSignal.timeout(3_000),
  });

  provider = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "myday:login",
    analytics: false,
    timeout: 0,
  });

  return provider;
}

export async function checkLoginRateLimit(
  identifier: string,
  overrideProvider?: LoginRateLimitProvider | null,
): Promise<LoginRateLimitResult> {
  const activeProvider = overrideProvider === undefined ? getProvider() : overrideProvider;

  if (!activeProvider) {
    return { allowed: true, configured: false, retryAfterSeconds: null };
  }

  try {
    const result = await activeProvider.limit(identifier);
    return {
      allowed: result.success,
      configured: true,
      retryAfterSeconds: result.success ? null : Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000)),
    };
  } catch {
    // Authentication is security-sensitive: a provider outage must not silently
    // bypass the distributed limiter in production.
    return { allowed: false, configured: true, retryAfterSeconds: null };
  }
}
