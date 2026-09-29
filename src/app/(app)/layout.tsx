import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/session";
import { logout } from "@/server/actions/auth";

export default async function ApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return <AppShell username={user.username} logoutAction={logout}>{children}</AppShell>;
}
