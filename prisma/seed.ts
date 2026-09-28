import "dotenv/config";

import { hash, verify } from "@node-rs/argon2";

import { db } from "../src/lib/db/client";

const username = process.env.SEED_USERNAME?.trim();
const password = process.env.SEED_PASSWORD;

if (!username) {
  throw new Error("SEED_USERNAME must be configured before seeding.");
}

if (!password) {
  throw new Error("SEED_PASSWORD must be configured before seeding.");
}

const existingUser = await db.user.findUnique({ where: { username } });
const passwordMatches = existingUser
  ? await verify(existingUser.passwordHash, password).catch(() => false)
  : false;

const passwordHash = existingUser && passwordMatches
  ? existingUser.passwordHash
  : await hash(password, {
      algorithm: 2, // Argon2id; the package exposes this as an ambient const enum.
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    });

let user = existingUser;

if (!user) {
  user = await db.user.create({ data: { username, passwordHash } });
} else if (!passwordMatches) {
  user = await db.user.update({ where: { id: user.id }, data: { passwordHash } });
}

const defaultAreas = ["Kuliah", "Coding", "Organisasi", "Personal"];

for (const [position, name] of defaultAreas.entries()) {
  const existingArea = await db.area.findFirst({
    where: { userId: user.id, name },
    select: { id: true, position: true, deletedAt: true },
  });

  if (existingArea && (existingArea.position !== position || existingArea.deletedAt !== null)) {
    await db.area.update({
      where: { id: existingArea.id },
      data: { position, deletedAt: null },
    });
  } else if (!existingArea) {
    await db.area.create({
      data: { userId: user.id, name, position },
    });
  }
}

console.log(`Seeded personal user "${username}" and ${defaultAreas.length} default areas.`);

await db.$disconnect();
