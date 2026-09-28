import "dotenv/config";

import { afterAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { loginSchema } from "@/lib/validation/login";

import { authenticateCredentials } from "./credentials";

const seedUsername = process.env.SEED_USERNAME;
const seedPassword = process.env.SEED_PASSWORD;

describe("personal credentials authentication", () => {
  afterAll(async () => {
    await db.$disconnect();
  });

  it("authenticates the seeded account with its Argon2id password", async () => {
    expect(seedUsername).toBeTruthy();
    expect(seedPassword).toBeTruthy();

    const user = await authenticateCredentials({ username: `  ${seedUsername}  `, password: seedPassword });

    expect(user).toEqual(expect.objectContaining({ username: seedUsername }));
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password with the same null result", async () => {
    const user = await authenticateCredentials({ username: seedUsername, password: "definitely-wrong" });

    expect(user).toBeNull();
  });

  it("rejects an unknown username with the same null result", async () => {
    const user = await authenticateCredentials({ username: "unknown-user", password: "definitely-wrong" });

    expect(user).toBeNull();
  });

  it("rejects empty credentials at the validation boundary", async () => {
    expect(loginSchema.safeParse({ username: "", password: "" }).success).toBe(false);
    await expect(authenticateCredentials({ username: "", password: "" })).resolves.toBeNull();
  });
});
