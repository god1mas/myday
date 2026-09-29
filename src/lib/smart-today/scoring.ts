import type { TaskPriority } from "@/generated/prisma/enums";
import { jakartaDate } from "@/lib/date/jakarta";

export type SmartCandidate = {
  id: string;
  priority: TaskPriority;
  deadlineAt: Date | null;
  pinnedDate: Date | null;
  createdAt: Date;
  progress: number;
  scheduledToday: boolean;
};

export type SmartResult<T extends SmartCandidate = SmartCandidate> = T & {
  score: number;
  reasons: string[];
};

const priorityPoints: Record<TaskPriority, number> = { LOW: 10, MEDIUM: 20, HIGH: 35, URGENT: 50 };

export function priorityScore(priority: TaskPriority) { return priorityPoints[priority]; }

export function deadlineScore(deadlineAt: Date | null, now: Date) {
  if (!deadlineAt) return 0;
  const remaining = deadlineAt.getTime() - now.getTime();
  if (remaining < 0) return 65 + Math.min(Math.floor(-remaining / 86_400_000) * 3, 30);
  const hours = remaining / 3_600_000;
  if (hours <= 2) return 80;
  if (hours <= 6) return 70;
  if (hours <= 24) return 60;
  if (hours <= 48) return 45;
  if (hours <= 72) return 30;
  if (hours <= 168) return 15;
  return 5;
}

export function progressScore(progress: number) {
  if (progress <= 25) return 15;
  if (progress <= 50) return 10;
  if (progress <= 75) return 5;
  if (progress <= 99) return 2;
  return 0;
}

export function scoreTask<T extends SmartCandidate>(task: T, now: Date, today = jakartaDate(now)): SmartResult<T> {
  const pinnedToday = task.pinnedDate !== null && jakartaDate(task.pinnedDate) === today;
  const deadline = deadlineScore(task.deadlineAt, now);
  const priority = priorityScore(task.priority);
  const progress = progressScore(task.progress);
  const score = (pinnedToday ? 1000 : 0) + priority + deadline + progress + (task.scheduledToday ? 25 : 0);
  const reasons = [
    ...(pinnedToday ? ["Pinned today +1000"] : []),
    `${task.priority} priority +${priority}`,
    ...(task.deadlineAt ? [`${task.deadlineAt < now ? "Overdue" : jakartaDate(task.deadlineAt) === today ? "Due today" : "Upcoming deadline"} +${deadline}`] : []),
    `Progress ${task.progress}% +${progress}`,
    ...(task.scheduledToday ? ["Scheduled today +25"] : []),
  ];
  return { ...task, score, reasons };
}

export function rankSmartTasks<T extends SmartCandidate>(tasks: T[], now: Date, today = jakartaDate(now)) {
  return tasks.map((task) => scoreTask(task, now, today)).sort((a, b) =>
    b.score - a.score ||
    Number(jakartaDate(b.pinnedDate ?? new Date(0)) === today) - Number(jakartaDate(a.pinnedDate ?? new Date(0)) === today) ||
    (a.deadlineAt?.getTime() ?? Number.POSITIVE_INFINITY) - (b.deadlineAt?.getTime() ?? Number.POSITIVE_INFINITY) ||
    priorityScore(b.priority) - priorityScore(a.priority) ||
    a.createdAt.getTime() - b.createdAt.getTime() ||
    a.id.localeCompare(b.id)
  );
}

export function rankSmartToday<T extends SmartCandidate>(tasks: T[], now: Date, today = jakartaDate(now), limit = 3) {
  return rankSmartTasks(tasks, now, today).slice(0, limit);
}
