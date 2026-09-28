import type { TaskStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db/client";
import type { TaskInput } from "@/lib/validation/task";

export class TaskRuleError extends Error {}
export function deadlineFromInput(date: string, time: string) { return date ? new Date(`${date}T${time || "23:59"}:00+07:00`) : null; }
export function taskProgress(task: { status: string; subtasks: { isCompleted: boolean }[] }) {
  const totalSubtasks = task.subtasks.length, completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  return { totalSubtasks, completedSubtasks, progress: totalSubtasks ? Math.round(completedSubtasks / totalSubtasks * 100) : task.status === "DONE" ? 100 : 0 };
}
export function isTaskOverdue(task: { deadlineAt: Date | null; status: string; deletedAt: Date | null }, now = new Date()) { return task.deletedAt === null && task.status !== "DONE" && task.deadlineAt !== null && task.deadlineAt < now; }
async function projectAvailable(userId: string, projectId: string | null) { return !projectId || Boolean(await db.project.findFirst({ where: { id: projectId, userId, deletedAt: null, status: { not: "ARCHIVED" } }, select: { id: true } })); }
export async function createTask(userId: string, input: TaskInput) {
  if (!(await projectAvailable(userId, input.projectId))) throw new TaskRuleError("Project yang dipilih tidak tersedia.");
  return db.task.create({ data: { userId, title: input.title, description: input.description, projectId: input.projectId, deadlineAt: deadlineFromInput(input.deadlineDate, input.deadlineTime), priority: input.priority, estimatedMinutes: input.estimatedMinutes } });
}
export async function updateTask(userId: string, id: string, input: TaskInput) {
  if (!(await projectAvailable(userId, input.projectId))) throw new TaskRuleError("Project yang dipilih tidak tersedia.");
  const result = await db.task.updateMany({ where: { id, userId, deletedAt: null }, data: { title: input.title, description: input.description, projectId: input.projectId, deadlineAt: deadlineFromInput(input.deadlineDate, input.deadlineTime), priority: input.priority, estimatedMinutes: input.estimatedMinutes } });
  return result.count === 1;
}
export async function changeTaskStatus(userId: string, id: string, status: TaskStatus) {
  const task = await db.task.findFirst({ where: { id, userId, deletedAt: null }, select: { status: true } });
  if (!task) return false;
  const allowed = task.status === status || (task.status === "TODO" && ["IN_PROGRESS", "DONE"].includes(status)) || (task.status === "IN_PROGRESS" && ["TODO", "DONE"].includes(status)) || (task.status === "DONE" && status === "TODO");
  if (!allowed) throw new TaskRuleError("Perubahan status tugas tidak diizinkan.");
  await db.task.updateMany({ where: { id, userId, deletedAt: null }, data: { status, completedAt: status === "DONE" ? new Date() : null } }); return true;
}
export async function deleteTask(userId: string, id: string) { return (await db.task.updateMany({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date() } })).count === 1; }
export async function createSubtask(userId: string, taskId: string, title: string) {
  return db.$transaction(async (tx) => { const task = await tx.task.findFirst({ where: { id: taskId, userId, deletedAt: null }, select: { id: true } }); if (!task) return null; const last = await tx.subtask.aggregate({ where: { taskId }, _max: { position: true } }); return tx.subtask.create({ data: { taskId, title, position: (last._max.position ?? -1) + 1 } }); });
}
export async function updateSubtask(userId: string, id: string, title: string) { const r = await db.subtask.updateMany({ where: { id, task: { userId, deletedAt: null } }, data: { title } }); return r.count === 1; }
export async function toggleSubtask(userId: string, id: string) { return db.$transaction(async (tx) => { const s = await tx.subtask.findFirst({ where: { id, task: { userId, deletedAt: null } }, select: { isCompleted: true } }); if (!s) return false; await tx.subtask.updateMany({ where: { id, task: { userId, deletedAt: null } }, data: { isCompleted: !s.isCompleted, completedAt: s.isCompleted ? null : new Date() } }); return true; }); }
export async function deleteSubtask(userId: string, id: string) { return (await db.subtask.deleteMany({ where: { id, task: { userId, deletedAt: null } } })).count === 1; }
