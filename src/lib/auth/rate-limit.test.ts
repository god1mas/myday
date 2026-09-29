import { describe, expect, it } from "vitest";

import { checkLoginRateLimit } from "./rate-limit";

describe("distributed login rate limiting", () => {
  it("reports an unconfigured local provider without blocking development", async () => {
    await expect(checkLoginRateLimit("local:user", null)).resolves.toEqual({
      allowed: true,
      configured: false,
      retryAfterSeconds: null,
    });
  });

  it("allows requests accepted by the distributed provider", async () => {
    await expect(checkLoginRateLimit("ip:user", { limit: async () => ({ success: true, reset: 0 }) })).resolves.toEqual({
      allowed: true,
      configured: true,
      retryAfterSeconds: null,
    });
  });

  it("blocks exhausted identifiers and returns a retry window", async () => {
    const reset = Date.now() + 30_000;
    const result = await checkLoginRateLimit("ip:user", { limit: async () => ({ success: false, reset }) });

    expect(result).toMatchObject({ allowed: false, configured: true });
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(29);
  });

  it("fails closed when the distributed provider errors", async () => {
    const result = await checkLoginRateLimit("ip:user", { limit: async () => { throw new Error("provider unavailable"); } });

    expect(result).toEqual({ allowed: false, configured: true, retryAfterSeconds: null });
  });
});
