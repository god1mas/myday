"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primary = [
  ["Today", "/today"],
  ["Tasks", "/tasks"],
  ["Planner", "/planner"],
  ["Calendar", "/calendar"],
] as const;
const secondary = [
  ["Events", "/events"],
  ["Projects", "/projects"],
  ["Areas", "/areas"],
  ["Reviews", "/reviews"],
  ["Trash", "/trash"],
] as const;

function active(pathname:string,href:string){return pathname===href||pathname.startsWith(`${href}/`)}
function NavLink({href,label,mobile=false}:{href:string;label:string;mobile?:boolean}){const pathname=usePathname(),current=active(pathname,href);return <Link aria-current={current?"page":undefined} href={href} className={mobile?`flex min-h-12 flex-1 items-center justify-center border-t-2 px-2 text-xs font-semibold ${current?"border-emerald-600 bg-emerald-50 text-emerald-900":"border-transparent text-slate-500"}`:`flex min-h-11 items-center rounded-lg border-l-4 px-3 text-sm font-medium ${current?"border-emerald-600 bg-emerald-50 text-emerald-950":"border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>{label}</Link>}

export function AppShell({username,logoutAction,children}:{username:string;logoutAction:()=>Promise<void>;children:React.ReactNode}){
  return <div className="min-h-screen bg-slate-50 text-slate-950 md:grid md:grid-cols-[14rem_minmax(0,1fr)]">
    <aside className="hidden min-h-screen border-r border-slate-200 bg-white p-5 md:sticky md:top-0 md:flex md:h-screen md:flex-col">
      <div className="px-3"><p className="text-lg font-bold tracking-tight">MyDay</p><p className="mt-0.5 truncate text-xs text-slate-500">{username}</p></div>
      <nav aria-label="Navigasi utama" className="mt-8 grid gap-1">{primary.map(([label,href])=><NavLink key={href} href={href} label={label}/>)}</nav>
      <p className="mb-2 mt-7 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Organize</p>
      <nav aria-label="Navigasi lainnya" className="grid gap-1">{secondary.map(([label,href])=><NavLink key={href} href={href} label={label}/>)}</nav>
      <form action={logoutAction} className="mt-auto"><button className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Keluar</button></form>
    </aside>
    <div className="min-w-0 pb-24 md:pb-0">
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <Link href="/today" className="font-bold tracking-tight">MyDay</Link>
        <details className="relative"><summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3 text-sm font-semibold text-slate-700">More</summary><div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"><nav aria-label="Navigasi lainnya" className="grid">{secondary.map(([label,href])=><NavLink key={href} href={href} label={label}/>)}</nav><form action={logoutAction} className="mt-2 border-t pt-2"><button className="min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</button></form></div></details>
      </header>
      <div className="min-w-0">{children}</div>
      <nav aria-label="Navigasi utama mobile" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">{primary.map(([label,href])=><NavLink key={href} href={href} label={label} mobile/>)}</nav>
    </div>
  </div>
}
