import { db } from "@/lib/db/client";
const include = { project: { select: { id: true, name: true, area: { select: { name: true } } } }, subtasks: { orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }] } };
export function getTasksForUser(userId: string) { return db.task.findMany({ where: { userId, deletedAt: null }, orderBy: [{ status: "asc" }, { deadlineAt: "asc" }, { createdAt: "desc" }], include }); }
export function getTaskByIdForUser(userId: string, id: string) { return db.task.findFirst({ where: { id, userId, deletedAt: null }, include }); }
export function getAssignableProjects(userId: string) { return db.project.findMany({ where: { userId, deletedAt: null, status: { not: "ARCHIVED" } }, orderBy: { name: "asc" }, select: { id: true, name: true } }); }
