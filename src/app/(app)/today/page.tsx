import { requireUser } from "@/lib/auth/session";

export default async function TodayPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-medium text-emerald-700">TODAY</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Welcome back, {user.username}.</h1>
      <p className="mt-4 text-lg text-slate-600">Your personal daily planner is ready.</p>
    </main>
  );
}
