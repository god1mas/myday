import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk | MyDay",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/today");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold tracking-wide text-emerald-700">MYDAY</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Selamat datang kembali</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Masuk ke planner pribadi Anda.</p>
        <LoginForm />
      </section>
    </main>
  );
}
