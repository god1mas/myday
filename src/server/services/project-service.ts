import { ProjectStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db/client";
import type { ProjectInput } from "@/lib/validation/project";

export class ProjectRuleError extends Error {}

function dateOnly(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function validArea(userId: string, areaId: string | null) {
  if (!areaId) return true;
  return Boolean(await db.area.findFirst({ where: { id: areaId, userId, deletedAt: null }, select: { id: true } }));
}

export async function createProject(userId: string, input: ProjectInput) {
  if (!(await validArea(userId, input.areaId))) throw new ProjectRuleError("Area tidak valid.");
  return db.project.create({ data: { userId, name: input.name, description: input.description, icon: input.icon, areaId: input.areaId, startDate: dateOnly(input.startDate), targetDate: dateOnly(input.targetDate) } });
}

export async function updateProject(userId: string, projectId: string, input: ProjectInput) {
  if (!(await validArea(userId, input.areaId))) throw new ProjectRuleError("Area tidak valid.");
  const result = await db.project.updateMany({ where: { id: projectId, userId, deletedAt: null }, data: { name: input.name, description: input.description, icon: input.icon, areaId: input.areaId, startDate: dateOnly(input.startDate), targetDate: dateOnly(input.targetDate) } });
  return result.count === 1;
}

export async function getProjectProgress(userId: string, projectId: string) {
  const [totalTasks, completedTasks] = await Promise.all([
    db.task.count({ where: { userId, projectId, deletedAt: null } }),
    db.task.count({ where: { userId, projectId, deletedAt: null, status: "DONE" } }),
  ]);
  return { totalTasks, completedTasks, progress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100) };
}

export async function changeProjectStatus(userId: string, projectId: string, status: ProjectStatus) {
  return db.$transaction(async (tx) => {
    const project = await tx.project.findFirst({ where: { id: projectId, userId, deletedAt: null }, select: { id: true, status: true } });
    if (!project) return false;
    const allowed = project.status === status ||
      (project.status === "ACTIVE" && (status === "COMPLETED" || status === "ARCHIVED")) ||
      (project.status === "COMPLETED" && (status === "ACTIVE" || status === "ARCHIVED")) ||
      (project.status === "ARCHIVED" && status === "ACTIVE");
    if (!allowed) throw new ProjectRuleError("Perubahan status project tidak diizinkan.");
    if (status === "COMPLETED") {
      const unfinished = await tx.task.count({ where: { userId, projectId, deletedAt: null, status: { not: "DONE" } } });
      if (unfinished > 0) throw new ProjectRuleError("Project tidak dapat diselesaikan karena masih memiliki tugas yang belum selesai.");
    }
    await tx.project.updateMany({ where: { id: projectId, userId, deletedAt: null }, data: { status, completedAt: status === "COMPLETED" ? new Date() : null } });
    return true;
  });
}

export async function deleteProject(userId: string, projectId: string) {
  return db.$transaction(async (tx) => {
    const project = await tx.project.updateMany({ where: { id: projectId, userId, deletedAt: null }, data: { deletedAt: new Date() } });
    if (project.count !== 1) return false;
    await tx.task.updateMany({ where: { projectId, userId }, data: { projectId: null } });
    return true;
  });
}

export async function restoreProject(userId: string, projectId: string) {
  const result = await db.project.updateMany({ where: { id: projectId, userId, deletedAt: { not: null } }, data: { deletedAt: null } });
  return result.count === 1;
}
