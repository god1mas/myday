import { db } from "@/lib/db/client";
import { taskProgress } from "@/server/services/task-service";
import { rankSmartToday } from "@/lib/smart-today/scoring";

export async function getSmartTodayTasks(userId: string, now: Date, start: Date, end: Date, today: string) {
  const tasks = await db.task.findMany({
    where: { userId, deletedAt: null, status: { not: "DONE" } },
    include: {
      subtasks: { select: { isCompleted: true } },
      project: { select: { name: true } },
      timeBlocks: { where: { deletedAt: null, startAt: { lt: end }, endAt: { gt: start } }, select: { id: true } },
    },
  });
  return rankSmartToday(tasks.map((task) => ({
    ...task,
    progress: taskProgress(task).progress,
    scheduledToday: task.timeBlocks.length > 0,
  })), now, today);
}
