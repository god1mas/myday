import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db/client";

export type CurrentUser = {
  id: string;
  username: string;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();

  if (!session?.user.id) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true },
  });
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
