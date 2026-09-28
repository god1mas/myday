import { verify } from "@node-rs/argon2";

import { db } from "@/lib/db/client";
import { loginSchema } from "@/lib/validation/login";

import { checkLoginRateLimit } from "./rate-limit";

export type AuthenticatedUser = {
  id: string;
  username: string;
};

export async function authenticateCredentials(
  input: unknown,
  requestIdentifier = "unknown",
): Promise<AuthenticatedUser | null> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  const { username, password } = parsed.data;
  const rateLimit = await checkLoginRateLimit(`${requestIdentifier}:${username}`);

  if (!rateLimit.allowed) {
    return null;
  }

  const [user, fallbackHash] = await Promise.all([
    db.user.findUnique({
      where: { username },
      select: { id: true, username: true, passwordHash: true },
    }),
    db.user.findFirst({ select: { passwordHash: true } }),
  ]);
  const passwordHash = user?.passwordHash ?? fallbackHash?.passwordHash;

  if (!passwordHash) {
    return null;
  }

  const passwordIsValid = await verify(passwordHash, password).catch(() => false);

  if (!user || !passwordIsValid) {
    return null;
  }

  return { id: user.id, username: user.username };
}
