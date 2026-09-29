export default function Loading() {
  return <main aria-live="polite" className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-3 w-24 animate-pulse rounded bg-slate-200"/><div className="mt-4 h-9 w-52 animate-pulse rounded bg-slate-200"/><div className="mt-8 grid gap-3"><div className="h-20 animate-pulse rounded-xl border bg-white"/><div className="h-20 animate-pulse rounded-xl border bg-white"/></div><span className="sr-only">Memuat halaman…</span></main>;
}
