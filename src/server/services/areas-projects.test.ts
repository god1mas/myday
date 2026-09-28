import "dotenv/config";

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db/client";
import { areaInputSchema } from "@/lib/validation/area";
import { getProject } from "@/server/queries/project-queries";
import { createArea, deleteArea, restoreArea, updateArea } from "./area-service";
import { changeProjectStatus, createProject, deleteProject, getProjectProgress, ProjectRuleError, restoreProject, updateProject } from "./project-service";

const suffix = randomUUID();
let userA: string;
let userB: string;

const projectInput = (areaId: string | null = null) => ({ name: "Project test", description: null, icon: null, areaId, startDate: "2026-09-01", targetDate: "2026-09-30" });

async function cleanupTestUsers(ids?: string[]) {
  const users = ids ?? (await db.user.findMany({ where: { username: { startsWith: "phase3-" } }, select: { id: true } })).map(({ id }) => id);
  if (users.length === 0) return;
  await db.$transaction([
    db.task.deleteMany({ where: { userId: { in: users } } }),
    db.project.deleteMany({ where: { userId: { in: users } } }),
    db.area.deleteMany({ where: { userId: { in: users } } }),
    db.user.deleteMany({ where: { id: { in: users } } }),
  ]);
}

beforeAll(async () => {
  await cleanupTestUsers();
  const [a, b] = await Promise.all([
    db.user.create({ data: { username: `phase3-a-${suffix}`, passwordHash: "$argon2id$test" } }),
    db.user.create({ data: { username: `phase3-b-${suffix}`, passwordHash: "$argon2id$test" } }),
  ]);
  userA = a.id; userB = b.id;
});

afterAll(async () => {
  const ids = [userA, userB].filter(Boolean);
  await cleanupTestUsers(ids);
  await db.$disconnect();
});

describe("Area ownership and lifecycle", () => {
  it("rejects an empty area name", () => {
    expect(areaInputSchema.safeParse({ name: "   ", icon: "   " }).success).toBe(false);
  });

  it("creates an owned area and rejects cross-user update/delete", async () => {
    const area = await createArea(userA, { name: "Area A", icon: null });
    expect(area.userId).toBe(userA);
    expect(await updateArea(userB, area.id, { name: "Stolen", icon: null })).toBe(false);
    expect(await deleteArea(userB, area.id)).toBe(false);
    expect((await db.area.findUniqueOrThrow({ where: { id: area.id } })).name).toBe("Area A");
  });

  it("validates input and atomically unassigns surviving projects", async () => {
    const area = await createArea(userA, { name: "Delete me", icon: null });
    const project = await createProject(userA, projectInput(area.id));
    expect(await deleteArea(userA, area.id)).toBe(true);
    expect((await db.area.findUniqueOrThrow({ where: { id: area.id } })).deletedAt).not.toBeNull();
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).areaId).toBeNull();
    expect(await restoreArea(userA, area.id)).toBe(true);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).areaId).toBeNull();
  });
});

describe("Project rules, progress, and ownership", () => {
  it("creates ACTIVE projects and rejects a foreign area", async () => {
    const foreignArea = await createArea(userB, { name: "Foreign", icon: null });
    const project = await createProject(userA, projectInput());
    expect(project).toMatchObject({ userId: userA, status: "ACTIVE" });
    await expect(createProject(userA, projectInput(foreignArea.id))).rejects.toBeInstanceOf(ProjectRuleError);
  });

  it("derives progress from active tasks only with consistent rounding", async () => {
    const project = await createProject(userA, projectInput());
    expect(await getProjectProgress(userA, project.id)).toEqual({ totalTasks: 0, completedTasks: 0, progress: 0 });
    await db.task.createMany({ data: [
      { userId: userA, projectId: project.id, title: "Done 1", status: "DONE" },
      { userId: userA, projectId: project.id, title: "Done 2", status: "DONE" },
      { userId: userA, projectId: project.id, title: "Todo", status: "TODO" },
      { userId: userA, projectId: project.id, title: "Trashed", status: "DONE", deletedAt: new Date() },
    ] });
    expect(await getProjectProgress(userA, project.id)).toEqual({ totalTasks: 3, completedTasks: 2, progress: 67 });
  });

  it("guards completion, sets completedAt, reopens, and archives", async () => {
    const project = await createProject(userA, projectInput());
    const task = await db.task.create({ data: { userId: userA, projectId: project.id, title: "Work" } });
    await expect(changeProjectStatus(userA, project.id, "COMPLETED")).rejects.toThrow("belum selesai");
    await db.task.update({ where: { id: task.id }, data: { status: "DONE" } });
    await changeProjectStatus(userA, project.id, "COMPLETED");
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).completedAt).not.toBeNull();
    await changeProjectStatus(userA, project.id, "ACTIVE");
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).completedAt).toBeNull();
    await changeProjectStatus(userA, project.id, "ARCHIVED");
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).deletedAt).toBeNull();
  });

  it("blocks cross-user read/edit/status/delete", async () => {
    const project = await createProject(userA, projectInput());
    expect(await getProject(userB, project.id)).toBeNull();
    expect(await updateProject(userB, project.id, projectInput())).toBe(false);
    expect(await changeProjectStatus(userB, project.id, "ARCHIVED")).toBe(false);
    expect(await deleteProject(userB, project.id)).toBe(false);
  });

  it("soft-deletes a project, unassigns tasks, and restore does not relink", async () => {
    const project = await createProject(userA, projectInput());
    const task = await db.task.create({ data: { userId: userA, projectId: project.id, title: "Survives" } });
    expect(await deleteProject(userA, project.id)).toBe(true);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).deletedAt).not.toBeNull();
    expect((await db.task.findUniqueOrThrow({ where: { id: task.id } })).projectId).toBeNull();
    expect(await restoreProject(userA, project.id)).toBe(true);
    expect((await db.task.findUniqueOrThrow({ where: { id: task.id } })).projectId).toBeNull();
  });
});
