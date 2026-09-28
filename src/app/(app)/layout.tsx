import { requireUser } from "@/lib/auth/session";
import { logout } from "@/server/actions/auth";

export default async function ApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-semibold text-slate-950">MyDay</p>
            <p className="text-xs text-slate-500">{user.username}</p>
          </div>
          <form action={logout}>
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              type="submit"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
