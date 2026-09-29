import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db/client";
import { addJakartaDays, jakartaDate, jakartaDateTime, jakartaDayRange } from "@/lib/date/jakarta";
import type { ReviewItemInput } from "@/lib/validation/daily-review";

export class DailyReviewRuleError extends Error {}
type Client = Prisma.TransactionClient | typeof db;

export function reviewDateValue(date: string) { return new Date(`${date}T00:00:00.000Z`); }
export function nextReviewDate(date: string) { return addJakartaDays(date, 1); }

async function summary(client: Client, userId: string, date: string) {
  const { start, end } = jakartaDayRange(date);
  const [completed, unfinished] = await Promise.all([
    client.task.findMany({ where: { userId, deletedAt: null, completedAt: { gte: start, lt: end } }, select: { id: true, title: true, completedAt: true }, orderBy: [{ completedAt: "asc" }, { id: "asc" }] }),
    client.task.findMany({
      where: { userId, deletedAt: null, status: { not: "DONE" }, OR: [
        { pinnedDate: reviewDateValue(date) },
        { deadlineAt: { gte: start, lt: end } },
        { timeBlocks: { some: { deletedAt: null, startAt: { lt: end }, endAt: { gt: start } } } },
      ] },
      select: { id: true, title: true, priority: true, deadlineAt: true, pinnedDate: true, project: { select: { name: true } }, timeBlocks: { where: { deletedAt: null, startAt: { lt: end }, endAt: { gt: start } }, select: { id: true } } },
      orderBy: [{ deadlineAt: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    }),
  ]);
  return { completed, unfinished: unfinished.map((task) => ({ ...task, reasons: [...(task.timeBlocks.length ? ["Scheduled"] : []), ...(task.pinnedDate && jakartaDate(task.pinnedDate) === date ? ["Pinned"] : []), ...(task.deadlineAt && jakartaDate(task.deadlineAt) === date ? ["Due today"] : [])] })) };
}

export function getDailyReviewSummary(userId: string, date: string) { return summary(db, userId, date); }

export async function submitDailyReview(userId: string, date: string, reflection: string | null, inputs: ReviewItemInput[]) {
  for (const input of inputs) if (input.action === "RESCHEDULE") {
    const startAt=jakartaDateTime(input.date!,input.startTime!),endAt=jakartaDateTime(input.date!,input.endTime!);
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt<=startAt) throw new DailyReviewRuleError("Waktu Reschedule tidak valid.");
  }
  return db.$transaction(async (tx) => {
    const existing = await tx.dailyReview.findUnique({ where: { userId_reviewDate: { userId, reviewDate: reviewDateValue(date) } }, select: { id: true } });
    if (existing) return existing;
    const current = await summary(tx, userId, date);
    const eligibleIds = current.unfinished.map((task) => task.id).sort();
    const inputIds = inputs.map((input) => input.taskId).sort();
    if (new Set(inputIds).size !== inputIds.length || eligibleIds.length !== inputIds.length || eligibleIds.some((id, index) => id !== inputIds[index])) throw new DailyReviewRuleError("Daftar tugas berubah. Muat ulang review sebelum melanjutkan.");
    const taskMap = new Map(current.unfinished.map((task) => [task.id, task]));
    const tomorrow = reviewDateValue(nextReviewDate(date));
    for (const input of inputs) {
      const task = taskMap.get(input.taskId);
      if (!task) throw new DailyReviewRuleError("Tugas review tidak tersedia.");
      if (input.action === "TOMORROW") { const changed=await tx.task.updateMany({ where: { id: input.taskId, userId, deletedAt:null, status:{not:"DONE"} }, data: { pinnedDate: tomorrow } }); if(changed.count!==1)throw new DailyReviewRuleError("Tugas review tidak lagi tersedia."); }
      if (input.action === "RESCHEDULE") await tx.timeBlock.create({ data: { userId, taskId: input.taskId, title: task.title, startAt: jakartaDateTime(input.date!, input.startTime!), endAt: jakartaDateTime(input.date!, input.endTime!) } });
    }
    return tx.dailyReview.create({ data: {
      userId, reviewDate: reviewDateValue(date), reflection,
      completedTaskCount: current.completed.length, unfinishedTaskCount: current.unfinished.length,
      items: { create: inputs.map((input) => ({ taskId: input.taskId, taskTitleSnapshot: taskMap.get(input.taskId)!.title, action: input.action })) },
    }, select: { id: true } });
  }, { isolationLevel: "Serializable" });
}
