import type { CalendarItem } from "@/server/queries/calendar-queries";

export function selectNowOrNext(items: CalendarItem[], now: Date) {
  const scheduled = items.filter((item) => item.type !== "TASK_DEADLINE" && item.endAt !== null);
  const current = scheduled.filter((item) => item.startAt <= now && item.endAt! > now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime() || a.id.localeCompare(b.id))[0];
  if (current) return { label: "NOW" as const, item: current };
  const next = scheduled.filter((item) => item.startAt > now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime() || a.id.localeCompare(b.id))[0];
  return next ? { label: "NEXT" as const, item: next } : null;
}
