import "dotenv/config";

import assert from "node:assert/strict";

import { verify } from "@node-rs/argon2";

import {
  DailyReviewAction,
  RecurrenceFrequency,
  RescheduleState,
  TaskPriority,
  TaskStatus,
} from "../src/generated/prisma/enums";
import { db } from "../src/lib/db/client";

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

async function expectPrismaCode(action: () => Promise<unknown>, code: string) {
  try {
    await action();
    assert.fail(`Expected Prisma error ${code}.`);
  } catch (error) {
    assert.ok(hasPrismaCode(error, code), `Expected Prisma error ${code}.`);
  }
}

async function expectDatabaseRejection(action: () => Promise<unknown>) {
  await assert.rejects(action);
}

async function cleanupUser(userId: string) {
  const recurrenceRules = await db.event.findMany({
    where: { userId, recurrenceRuleId: { not: null } },
    select: { recurrenceRuleId: true },
  });

  await db.dailyReviewItem.deleteMany({ where: { dailyReview: { userId } } });
  await db.dailyReview.deleteMany({ where: { userId } });
  await db.event.deleteMany({ where: { userId } });
  await db.recurrenceRule.deleteMany({
    where: {
      id: { in: recurrenceRules.flatMap(({ recurrenceRuleId }) => (recurrenceRuleId ? [recurrenceRuleId] : [])) },
    },
  });
  await db.timeBlock.deleteMany({ where: { userId } });
  await db.subtask.deleteMany({ where: { task: { userId } } });
  await db.task.deleteMany({ where: { userId } });
  await db.project.deleteMany({ where: { userId } });
  await db.area.deleteMany({ where: { userId } });
  await db.user.delete({ where: { id: userId } }).catch(() => undefined);
}

const suffix = crypto.randomUUID();
const username = `verify-${suffix}`;
let userId: string | undefined;
let secondUserId: string | undefined;

try {
  const seedUsername = process.env.SEED_USERNAME?.trim();
  const seedPassword = process.env.SEED_PASSWORD;
  assert.ok(seedUsername, "SEED_USERNAME must be configured for verification.");
  assert.ok(seedPassword, "SEED_PASSWORD must be configured for verification.");

  const seededUser = await db.user.findUniqueOrThrow({
    where: { username: seedUsername },
    include: { areas: true },
  });
  assert.notEqual(seededUser.passwordHash, seedPassword);
  assert.ok(seededUser.passwordHash.startsWith("$argon2id$"));
  assert.equal(await verify(seededUser.passwordHash, seedPassword), true);
  for (const areaName of ["Kuliah", "Coding", "Organisasi", "Personal"]) {
    assert.equal(seededUser.areas.filter(({ name }) => name === areaName).length, 1);
  }

  const user = await db.user.create({
    data: { username, passwordHash: "$argon2id$verification-only" },
  });
  userId = user.id;

  const area = await db.area.create({
    data: { userId: user.id, name: "Verification Area", position: 0 },
  });
  const project = await db.project.create({
    data: { userId: user.id, areaId: area.id, name: "Verification Project" },
  });
  const task = await db.task.create({
    data: { userId: user.id, projectId: project.id, title: "Verification Task" },
  });

  assert.equal(task.status, TaskStatus.TODO);
  assert.equal(task.priority, TaskPriority.MEDIUM);

  await expectDatabaseRejection(() =>
    db.task.create({
      data: { userId: user.id, title: "Invalid estimate", estimatedMinutes: 0 },
    }),
  );

  const subtask = await db.subtask.create({
    data: { taskId: task.id, title: "Verification Subtask", position: 0 },
  });
  const originalBlock = await db.timeBlock.create({
    data: {
      userId: user.id,
      taskId: task.id,
      title: "Original block",
      startAt: new Date("2030-01-01T01:00:00.000Z"),
      endAt: new Date("2030-01-01T02:00:00.000Z"),
    },
  });
  assert.equal(originalBlock.rescheduleState, RescheduleState.NONE);

  await expectDatabaseRejection(() =>
    db.timeBlock.create({
      data: {
        userId: user.id,
        title: "Invalid range",
        startAt: new Date("2030-01-01T02:00:00.000Z"),
        endAt: new Date("2030-01-01T01:00:00.000Z"),
      },
    }),
  );

  const rescheduledBlock = await db.timeBlock.create({
    data: {
      userId: user.id,
      taskId: task.id,
      title: "Rescheduled block",
      startAt: new Date("2030-01-02T01:00:00.000Z"),
      endAt: new Date("2030-01-02T02:00:00.000Z"),
      rescheduledFromId: originalBlock.id,
    },
    include: { rescheduledFrom: true },
  });
  assert.equal(rescheduledBlock.rescheduledFrom?.id, originalBlock.id);

  const standaloneBlock = await db.timeBlock.create({
    data: {
      userId: user.id,
      title: "Standalone block",
      startAt: new Date("2030-01-03T01:00:00.000Z"),
      endAt: new Date("2030-01-03T02:00:00.000Z"),
    },
  });
  assert.equal(standaloneBlock.taskId, null);

  const recurrenceRule = await db.recurrenceRule.create({
    data: {
      frequency: RecurrenceFrequency.WEEKLY,
      interval: 1,
      daysOfWeek: ["MONDAY", "WEDNESDAY"],
    },
  });
  const event = await db.event.create({
    data: {
      userId: user.id,
      title: "Verification Event",
      startAt: new Date("2030-01-07T01:00:00.000Z"),
      endAt: new Date("2030-01-07T02:00:00.000Z"),
      recurrenceRuleId: recurrenceRule.id,
    },
    include: { recurrenceRule: true },
  });
  assert.deepEqual(event.recurrenceRule?.daysOfWeek, ["MONDAY", "WEDNESDAY"]);

  await expectDatabaseRejection(() =>
    db.recurrenceRule.create({
      data: { frequency: RecurrenceFrequency.WEEKLY, interval: 0, daysOfWeek: ["MONDAY"] },
    }),
  );

  const reviewDate = new Date("2030-01-07T00:00:00.000Z");
  const review = await db.dailyReview.create({
    data: {
      userId: user.id,
      reviewDate,
      completedTaskCount: 0,
      unfinishedTaskCount: 1,
      items: {
        create: {
          taskId: task.id,
          taskTitleSnapshot: task.title,
          action: DailyReviewAction.KEEP,
        },
      },
    },
    include: { items: true },
  });
  assert.equal(review.items[0]?.taskId, task.id);

  await expectPrismaCode(
    () =>
      db.dailyReview.create({
        data: { userId: user.id, reviewDate, completedTaskCount: 0, unfinishedTaskCount: 0 },
      }),
    "P2002",
  );

  const relationalUser = await db.user.findUniqueOrThrow({
    where: { id: user.id },
    include: {
      areas: { include: { projects: { include: { tasks: true } } } },
      timeBlocks: true,
      events: true,
      dailyReviews: true,
    },
  });
  assert.equal(relationalUser.areas[0]?.projects[0]?.tasks[0]?.id, task.id);
  assert.equal(relationalUser.timeBlocks.length, 3);
  assert.equal(relationalUser.events[0]?.id, event.id);
  assert.equal(relationalUser.dailyReviews[0]?.id, review.id);

  const secondUser = await db.user.create({
    data: { username: `verify-owner-${suffix}`, passwordHash: "$argon2id$verification-only" },
  });
  secondUserId = secondUser.id;
  await expectPrismaCode(
    () => db.project.create({ data: { userId: secondUser.id, areaId: area.id, name: "Invalid owner" } }),
    "P2003",
  );

  await db.task.delete({ where: { id: task.id } });

  assert.equal(await db.subtask.count({ where: { id: subtask.id } }), 0);
  assert.equal(await db.timeBlock.count({ where: { taskId: task.id } }), 0);
  assert.equal(await db.timeBlock.count({ where: { id: standaloneBlock.id } }), 1);

  const preservedReviewItem = await db.dailyReviewItem.findFirstOrThrow({
    where: { dailyReviewId: review.id },
  });
  assert.equal(preservedReviewItem.taskId, null);
  assert.equal(preservedReviewItem.taskTitleSnapshot, "Verification Task");

  console.log(
    "Database verification passed: seed hashing/idempotency, models, defaults, constraints, relations, ownership, uniqueness, and delete semantics.",
  );
} finally {
  if (secondUserId) {
    await cleanupUser(secondUserId);
  }
  if (userId) {
    await cleanupUser(userId);
  }
  await db.$disconnect();
}
