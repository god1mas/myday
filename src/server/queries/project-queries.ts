import { db } from "@/lib/db/client";

const projectInclude = { area: { select: { id: true, name: true, icon: true } }, tasks: { where: { deletedAt: null }, select: { status: true } } } as const;

export function getProjects(userId: string) {
  return db.project.findMany({ where: { userId, deletedAt: null }, orderBy: [{ status: "asc" }, { updatedAt: "desc" }], include: projectInclude });
}

export function getProject(userId: string, id: string) {
  return db.project.findFirst({ where: { id, userId, deletedAt: null }, include: projectInclude });
}

export function progressFromTasks(tasks: { status: string }[]) {
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  return { totalTasks: tasks.length, completedTasks, progress: tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100) };
}
