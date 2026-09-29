import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { jakartaDate, jakartaDayRange } from "@/lib/date/jakarta";
import { selectNowOrNext } from "@/lib/smart-today/activity";
import type { CalendarItem } from "@/server/queries/calendar-queries";
import { getCalendarItemsForRange } from "@/server/queries/calendar-queries";
import { getSmartTodayTasks } from "@/server/queries/today-queries";
import { setTodayPinAction } from "@/server/actions/today";

const time = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const fullDate = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const deadlineDate = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const priorityStyle = { LOW: "bg-slate-100 text-slate-700", MEDIUM: "bg-sky-100 text-sky-800", HIGH: "bg-amber-100 text-amber-900", URGENT: "bg-rose-100 text-rose-800" } as const;

function ScheduleItem({ item }: { item: CalendarItem }) {
  return <li><Link href={item.href} className="flex min-h-16 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300">
    <span className="w-24 shrink-0 font-mono text-sm text-slate-600">{time.format(item.startAt)}–{time.format(item.endAt!)}</span>
    <span className="min-w-0"><span className="block font-medium text-slate-950">{item.title}</span><span className="block truncate text-sm text-slate-500">{item.type === "EVENT" ? "Event" : "Time Block"}{item.context ? ` · ${item.context}` : ""}{item.isRecurring ? " · Berulang" : ""}</span></span>
  </Link></li>;
}

export default async function TodayPage() {
  const user = await requireUser();
  const now = new Date();
  const today = jakartaDate(now);
  const range = jakartaDayRange(today);
  const [calendarItems, smartTasks] = await Promise.all([
    getCalendarItemsForRange(user.id, range.start, range.end),
    getSmartTodayTasks(user.id, now, range.start, range.end, today),
  ]);
  const schedule = calendarItems.filter((item) => item.type !== "TASK_DEADLINE");
  const focus = selectNowOrNext(schedule, now);

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
    <header className="mb-8"><p className="text-sm font-semibold text-emerald-700">TODAY</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Selamat datang, {user.username}.</h1><p className="mt-2 capitalize text-slate-600">{fullDate.format(now)}</p></header>
    <section aria-labelledby="focus-heading" className="rounded-2xl bg-slate-950 p-6 text-white">
      <p id="focus-heading" className="text-xs font-bold tracking-[0.2em] text-emerald-300">{focus?.label ?? "NOW / NEXT"}</p>
      {focus ? <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold">{focus.item.title}</h2><p className="mt-1 text-slate-300">{focus.item.type === "EVENT" ? "Event" : "Time Block"}{focus.item.context ? ` · ${focus.item.context}` : ""}</p></div><div className="text-right"><p className="font-mono text-lg">{time.format(focus.item.startAt)}–{time.format(focus.item.endAt!)}</p><Link href={focus.item.href} className="mt-2 inline-block text-sm font-semibold text-emerald-300">Buka detail →</Link></div></div> : <p className="mt-3 text-lg text-slate-300">You&apos;re clear for the rest of the day.</p>}
    </section>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section aria-labelledby="schedule-heading"><div className="mb-4 flex items-end justify-between"><div><p className="text-sm font-semibold text-sky-700">AGENDA</p><h2 id="schedule-heading" className="mt-1 text-2xl font-semibold">Jadwal hari ini</h2></div><Link href={`/calendar?view=day&date=${today}`} className="text-sm font-semibold text-sky-700">Lihat kalender</Link></div>
        {schedule.length ? <ol className="space-y-3">{schedule.map((item) => <ScheduleItem key={item.id} item={item} />)}</ol> : <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">Belum ada Event atau Time Block hari ini.</div>}
      </section>
      <section aria-labelledby="smart-heading"><div className="mb-4"><p className="text-sm font-semibold text-amber-700">SMART TODAY</p><h2 id="smart-heading" className="mt-1 text-2xl font-semibold">Must do</h2><p className="mt-1 text-sm text-slate-500">Maksimal tiga tugas, diprioritaskan otomatis.</p></div>
        {smartTasks.length ? <ol className="space-y-3">{smartTasks.map((task, index) => { const pinnedToday = task.pinnedDate !== null && jakartaDate(task.pinnedDate) === today; return <li key={task.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/tasks/${task.id}`} className="font-semibold text-slate-950 hover:text-emerald-700">{task.title}</Link><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityStyle[task.priority]}`}>{task.priority}</span>{pinnedToday ? <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">Pinned</span> : null}</div><p className="mt-1 text-sm text-slate-500">{task.project?.name ?? "Tanpa project"} · Progress {task.progress}%{task.deadlineAt ? ` · Deadline ${deadlineDate.format(task.deadlineAt)}` : " · Tanpa deadline"}</p><p className="mt-2 text-xs text-slate-500">{task.reasons.join(" · ")}</p></div><form action={setTodayPinAction}><input type="hidden" name="taskId" value={task.id}/><input type="hidden" name="pinned" value={String(!pinnedToday)}/><button className="min-h-11 rounded-lg border px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="submit">{pinnedToday ? "Unpin" : "Pin to Today"}</button></form></div></li>;})}</ol> : <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">Tidak ada tugas prioritas untuk hari ini.</div>}
      </section>
    </div>
  </main>;
}
