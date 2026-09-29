import { db } from "@/lib/db/client";

export async function setTaskPinnedDate(userId: string, taskId: string, pinnedDate: Date | null) {
  const result = await db.task.updateMany({
    where: { id: taskId, userId, deletedAt: null, status: { not: "DONE" } },
    data: { pinnedDate },
  });
  return result.count === 1;
}
