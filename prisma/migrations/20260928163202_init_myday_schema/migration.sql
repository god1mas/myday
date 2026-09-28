-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RescheduleState" AS ENUM ('NONE', 'RESCHEDULED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "DailyReviewAction" AS ENUM ('TOMORROW', 'RESCHEDULE', 'KEEP');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "icon" VARCHAR(100),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "areaId" UUID,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATE,
    "targetDate" DATE,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "projectId" UUID,
    "title" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "deadlineAt" TIMESTAMPTZ(3),
    "estimatedMinutes" INTEGER,
    "pinnedDate" DATE,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtask" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeBlock" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "taskId" UUID,
    "title" VARCHAR(240) NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "rescheduleState" "RescheduleState" NOT NULL DEFAULT 'NONE',
    "rescheduledFromId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "TimeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "location" VARCHAR(240),
    "notes" TEXT,
    "recurrenceRuleId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrenceRule" (
    "id" UUID NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "daysOfWeek" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "until" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RecurrenceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReview" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "reviewDate" DATE NOT NULL,
    "reflection" TEXT,
    "completedTaskCount" INTEGER NOT NULL DEFAULT 0,
    "unfinishedTaskCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DailyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReviewItem" (
    "id" UUID NOT NULL,
    "dailyReviewId" UUID NOT NULL,
    "taskId" UUID,
    "taskTitleSnapshot" VARCHAR(240) NOT NULL,
    "action" "DailyReviewAction" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Area_userId_position_idx" ON "Area"("userId", "position");

-- CreateIndex
CREATE INDEX "Area_deletedAt_idx" ON "Area"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Area_id_userId_key" ON "Area"("id", "userId");

-- CreateIndex
CREATE INDEX "Project_userId_status_idx" ON "Project"("userId", "status");

-- CreateIndex
CREATE INDEX "Project_areaId_idx" ON "Project"("areaId");

-- CreateIndex
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_id_userId_key" ON "Project"("id", "userId");

-- CreateIndex
CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");

-- CreateIndex
CREATE INDEX "Task_userId_deadlineAt_idx" ON "Task"("userId", "deadlineAt");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_userId_key" ON "Task"("id", "userId");

-- CreateIndex
CREATE INDEX "Subtask_taskId_position_idx" ON "Subtask"("taskId", "position");

-- CreateIndex
CREATE INDEX "TimeBlock_userId_startAt_idx" ON "TimeBlock"("userId", "startAt");

-- CreateIndex
CREATE INDEX "TimeBlock_taskId_idx" ON "TimeBlock"("taskId");

-- CreateIndex
CREATE INDEX "TimeBlock_rescheduledFromId_idx" ON "TimeBlock"("rescheduledFromId");

-- CreateIndex
CREATE INDEX "TimeBlock_deletedAt_idx" ON "TimeBlock"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_recurrenceRuleId_key" ON "Event"("recurrenceRuleId");

-- CreateIndex
CREATE INDEX "Event_userId_startAt_idx" ON "Event"("userId", "startAt");

-- CreateIndex
CREATE INDEX "Event_deletedAt_idx" ON "Event"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReview_userId_reviewDate_key" ON "DailyReview"("userId", "reviewDate");

-- CreateIndex
CREATE INDEX "DailyReviewItem_dailyReviewId_idx" ON "DailyReviewItem"("dailyReviewId");

-- CreateIndex
CREATE INDEX "DailyReviewItem_taskId_idx" ON "DailyReviewItem"("taskId");

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_areaId_userId_fkey" FOREIGN KEY ("areaId", "userId") REFERENCES "Area"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_userId_fkey" FOREIGN KEY ("projectId", "userId") REFERENCES "Project"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_taskId_userId_fkey" FOREIGN KEY ("taskId", "userId") REFERENCES "Task"("id", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeBlock" ADD CONSTRAINT "TimeBlock_rescheduledFromId_fkey" FOREIGN KEY ("rescheduledFromId") REFERENCES "TimeBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_recurrenceRuleId_fkey" FOREIGN KEY ("recurrenceRuleId") REFERENCES "RecurrenceRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReview" ADD CONSTRAINT "DailyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReviewItem" ADD CONSTRAINT "DailyReviewItem_dailyReviewId_fkey" FOREIGN KEY ("dailyReviewId") REFERENCES "DailyReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReviewItem" ADD CONSTRAINT "DailyReviewItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Business-rule checks that Prisma schema syntax cannot express.
ALTER TABLE "User"
  ADD CONSTRAINT "User_username_not_blank" CHECK (length(btrim("username")) > 0),
  ADD CONSTRAINT "User_passwordHash_not_blank" CHECK (length(btrim("passwordHash")) > 0);

ALTER TABLE "Area"
  ADD CONSTRAINT "Area_name_not_blank" CHECK (length(btrim("name")) > 0),
  ADD CONSTRAINT "Area_position_non_negative" CHECK ("position" >= 0);

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_name_not_blank" CHECK (length(btrim("name")) > 0);

ALTER TABLE "Task"
  ADD CONSTRAINT "Task_title_not_blank" CHECK (length(btrim("title")) > 0),
  ADD CONSTRAINT "Task_estimatedMinutes_positive" CHECK ("estimatedMinutes" IS NULL OR "estimatedMinutes" > 0);

ALTER TABLE "Subtask"
  ADD CONSTRAINT "Subtask_title_not_blank" CHECK (length(btrim("title")) > 0),
  ADD CONSTRAINT "Subtask_position_non_negative" CHECK ("position" >= 0);

ALTER TABLE "TimeBlock"
  ADD CONSTRAINT "TimeBlock_title_not_blank" CHECK (length(btrim("title")) > 0),
  ADD CONSTRAINT "TimeBlock_end_after_start" CHECK ("endAt" > "startAt"),
  ADD CONSTRAINT "TimeBlock_not_own_reschedule_source" CHECK ("rescheduledFromId" IS NULL OR "rescheduledFromId" <> "id");

ALTER TABLE "Event"
  ADD CONSTRAINT "Event_title_not_blank" CHECK (length(btrim("title")) > 0),
  ADD CONSTRAINT "Event_end_after_start" CHECK ("endAt" > "startAt");

ALTER TABLE "RecurrenceRule"
  ADD CONSTRAINT "RecurrenceRule_interval_positive" CHECK ("interval" > 0),
  ADD CONSTRAINT "RecurrenceRule_daysOfWeek_valid" CHECK (
    "daysOfWeek" <@ ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']::TEXT[]
  );

ALTER TABLE "DailyReview"
  ADD CONSTRAINT "DailyReview_completed_count_non_negative" CHECK ("completedTaskCount" >= 0),
  ADD CONSTRAINT "DailyReview_unfinished_count_non_negative" CHECK ("unfinishedTaskCount" >= 0);

ALTER TABLE "DailyReviewItem"
  ADD CONSTRAINT "DailyReviewItem_title_snapshot_not_blank" CHECK (length(btrim("taskTitleSnapshot")) > 0);
