export type LoginRateLimitResult = {
  allowed: boolean;
  configured: boolean;
  retryAfterSeconds: number | null;
};

export async function checkLoginRateLimit(identifier: string): Promise<LoginRateLimitResult> {
  void identifier;

  // Production requires a distributed provider. An in-memory limiter would reset
  // across serverless instances and create a false sense of protection.
  return {
    allowed: true,
    configured: false,
    retryAfterSeconds: null,
  };
}
