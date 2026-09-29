import "dotenv/config";

import { hash } from "@node-rs/argon2";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { loginSchema } from "@/lib/validation/login";

import { authenticateCredentials } from "./credentials";

const username = `auth-${randomUUID()}`;
const password = "phase-12-test-password";

describe("personal credentials authentication", () => {
  beforeAll(async () => {
    await db.user.create({
      data: {
        username,
        passwordHash: await hash(password, { algorithm: 2, memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 }),
      },
    });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { username } });
    await db.$disconnect();
  });

  it("authenticates an account with its Argon2id password", async () => {
    const user = await authenticateCredentials({ username: `  ${username}  `, password });

    expect(user).toEqual(expect.objectContaining({ username }));
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password with the same null result", async () => {
    const user = await authenticateCredentials({ username, password: "definitely-wrong" });

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
