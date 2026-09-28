# MyDay — Database Design

**Version:** 1.1  
**Status:** Aligned MVP Schema — BUSINESS-RULES v1.0  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Architecture:** Single-user personal application

---

# 1. Design Goals

Database MyDay harus:

- sederhana;
- konsisten dengan PRD;
- mendukung single-user;
- tidak mengunci kemungkinan pengembangan post-MVP;
- menjaga Task, Event, dan Time Block sebagai entitas berbeda;
- mendukung soft delete;
- mendukung recurring event;
- mendukung Daily Review history.

---

# 2. Entity Overview

```text
User
 │
 ├── Area
 │    └── Project
 │          └── Task
 │                ├── Subtask
 │                └── TimeBlock
 │
 ├── Event
 │    └── RecurrenceRule
 │
 └── DailyReview
      └── DailyReviewItem
```

---

# 3. Proposed Models

# 3.1 User

Single-user tetap memiliki model User agar authentication bersih.

Fields:

```text
id
username
passwordHash
createdAt
updatedAt
```

Constraints:

- username unique.

---

# 3.2 Area

Fields:

```text
id
userId
name
icon
position
createdAt
updatedAt
deletedAt
```

Relations:

```text
User 1 ─── N Area
Area 1 ─── N Project
```

Notes:

- `icon` opsional;
- `position` untuk manual ordering;
- soft delete disarankan.

---

# 3.3 Project

Fields:

```text
id
userId
areaId?
name
description?
icon?
status
startDate?
targetDate?
completedAt?
createdAt
updatedAt
deletedAt
```

Suggested enum:

```text
ACTIVE
COMPLETED
ARCHIVED
```

Relations:

```text
Area 1 ─── N Project
Project 1 ─── N Task
```

`areaId` nullable agar Project dapat tetap hidup jika Area dilepas/dihapus.

---

# 3.4 Task

Fields:

```text
id
userId
projectId?
title
description?
status
priority
deadlineAt?
estimatedMinutes?
pinnedDate?
completedAt?
createdAt
updatedAt
deletedAt
```

Suggested enums:

```text
TaskStatus:
TODO
IN_PROGRESS
DONE
```

```text
TaskPriority:
LOW
MEDIUM
HIGH
URGENT
```

Notes:

- `deadlineAt` menyimpan tanggal + waktu.
- `estimatedMinutes` lebih fleksibel daripada decimal hours.
- `pinnedDate` digunakan untuk `Pin to Today`.
- Overdue tidak disimpan sebagai status; dihitung dari deadline + status.
- `deletedAt` mendukung Trash.

Relations:

```text
Project 1 ─── N Task
Task 1 ─── N Subtask
Task 1 ─── N TimeBlock
```

---

# 3.5 Subtask

Fields:

```text
id
taskId
title
isCompleted
position
completedAt?
createdAt
updatedAt
```

Constraints:

- taskId required.

Progress Task dihitung dari Subtask.

---

# 3.6 TimeBlock

Fields:

```text
id
userId
taskId?
title
startAt
endAt
rescheduleState
rescheduledFromId?
createdAt
updatedAt
deletedAt
```

Suggested reschedule state:

```text
NONE
RESCHEDULED
DISMISSED
```

Notes:

- taskId nullable;
- Time Block dapat berdiri sendiri;
- tidak memiliki Done status;
- overlap tidak dilarang;
- block lama dipertahankan ketika reschedule;
- block baru dapat menyimpan `rescheduledFromId` yang menunjuk block lama.

Recommended relation:

```text
TimeBlock 1 ─── N rescheduled children
```

Untuk MVP biasanya satu block lama hanya menghasilkan satu reschedule aktif, tetapi schema tidak perlu terlalu membatasi history.

---

# 3.7 Event

Fields:

```text
id
userId
title
startAt
endAt
location?
notes?
recurrenceRuleId?
createdAt
updatedAt
deletedAt
```

Event tidak memiliki status Done.

---

# 3.8 RecurrenceRule

MVP minimal weekly recurrence.

Fields:

```text
id
frequency
interval
daysOfWeek?
until?
createdAt
updatedAt
```

Suggested enum:

```text
DAILY
WEEKLY
MONTHLY
```

Untuk MVP, UI dapat hanya mengekspos `WEEKLY`.

Recommended representation:

```text
frequency = WEEKLY
interval = 1
daysOfWeek = ["MONDAY"]
```

Jika Prisma/PostgreSQL array dianggap kurang ideal, days dapat disimpan melalui child table `RecurrenceDay`.

---

# 3.9 DailyReview

Fields:

```text
id
userId
reviewDate
reflection?
completedTaskCount
unfinishedTaskCount
createdAt
updatedAt
```

Constraint:

```text
unique(userId, reviewDate)
```

---

# 3.10 DailyReviewItem

Fields:

```text
id
dailyReviewId
taskId?
taskTitleSnapshot
action
createdAt
```

Suggested enum:

```text
TOMORROW
RESCHEDULE
KEEP
```

Kenapa menyimpan snapshot title?

Agar history review tetap dapat dibaca meskipun task kemudian diubah atau dihapus.

Business semantics:

- `TOMORROW` → set `Task.pinnedDate` ke hari berikutnya;
- `RESCHEDULE` → membuat Time Block baru;
- `KEEP` → tidak mengubah Task.

Daily Review maksimal satu per `userId + reviewDate`.

---

# 4. Relationship Diagram

```text
User
├── Area
│   └── Project
│       └── Task
│           ├── Subtask
│           └── TimeBlock
├── Event
│   └── RecurrenceRule
└── DailyReview
    └── DailyReviewItem
```

---

# 5. Progress Calculation

## Task with Subtasks

```text
progress =
completed_subtasks / total_subtasks * 100
```

## Task without Subtasks

```text
TODO        → 0
IN_PROGRESS → 0
DONE        → 100
```

## Project

```text
progress =
completed_tasks / total_tasks * 100
```

Jika project belum memiliki task:

```text
progress = 0
```

---

# 6. Overdue Calculation

Tidak perlu kolom `isOverdue`.

Computed rule:

```text
deadlineAt IS NOT NULL
AND deadlineAt < now()
AND status != DONE
AND deletedAt IS NULL
```

---

# 7. Soft Delete

Soft delete digunakan minimal untuk:

- Task;
- Project;
- Area;
- TimeBlock;
- Event.

Pattern:

```text
deletedAt = null      → active
deletedAt != null     → deleted
```

Default query layer harus mengecualikan record deleted.

---

# 7.1 Project / Area Delete Semantics

## Delete Project

```text
Project.deletedAt = now
Task.projectId = null
```

Task tidak ikut dihapus.

## Delete Area

```text
Area.deletedAt = now
Project.areaId = null
```

Project dan Task tidak ikut dihapus.

Restore Project/Area tidak otomatis menghubungkan kembali relation yang sudah dilepas.

---

# 7.2 Trash Visibility

Jika Task berada di Trash:

- Task dikeluarkan dari query aktif;
- Task tidak masuk Smart Today;
- Task deadline tidak muncul di Calendar;
- linked Time Block disembunyikan dari active Planner/Calendar;
- linked Time Block tetap ada untuk memungkinkan restore.

Permanent delete Task menghapus:

- Task;
- Subtask terkait;
- linked Time Block terkait.

---

# 8. Calendar Data Query

Calendar menggabungkan:

```text
Event.startAt/endAt
TimeBlock.startAt/endAt
Task.deadlineAt
```

Calendar tidak membutuhkan satu tabel gabungan.

UI membangun unified calendar item dari tiga sumber.

---

# 9. Smart Today Query Inputs

Query kandidat:

```text
Task
WHERE
  deletedAt IS NULL
  AND status != DONE
```

Scoring layer menerima:

```text
deadlineAt
priority
progress
pinnedDate
scheduledToday
overdue
```

Formula v1.0:

```text
SmartScore =
PinScore
+ PriorityScore
+ DeadlineScore
+ ProgressScore
+ ScheduledTodayScore
```

Scoring dilakukan di application layer, bukan disimpan di database.

`pinnedDate` bersifat date-specific dan tidak berarti Task memiliki Time Block.

---

# 10. Suggested Prisma Schema Shape

High-level:

```prisma
model User { ... }

model Area {
  id       String @id @default(cuid())
  userId   String
  user     User   @relation(...)
  projects Project[]
}

model Project {
  id      String @id @default(cuid())
  areaId  String?
  area    Area?  @relation(...)
  tasks   Task[]
}

model Task {
  id               String @id @default(cuid())
  projectId        String?
  title            String
  description      String?
  status           TaskStatus @default(TODO)
  priority         TaskPriority @default(MEDIUM)
  deadlineAt       DateTime?
  estimatedMinutes Int?
  pinnedDate       DateTime?
  deletedAt        DateTime?
  subtasks         Subtask[]
  timeBlocks       TimeBlock[]
}
```

Final Prisma schema harus dibuat setelah Business Rules disetujui.

---

# 11. Index Recommendations

Indexes:

```text
Task(userId, status)
Task(userId, deadlineAt)
Task(projectId)
Task(deletedAt)

TimeBlock(userId, startAt)
TimeBlock(taskId)

Event(userId, startAt)

Project(userId, status)
Project(areaId)

DailyReview(userId, reviewDate)
```

---

# 12. Data Integrity Rules

- Task Project harus milik User yang sama.
- Project Area harus milik User yang sama.
- TimeBlock linked Task harus milik User yang sama.
- `endAt > startAt`.
- estimatedMinutes > 0 jika diisi.
- deadlineAt nullable.
- task title tidak boleh kosong.
- project name tidak boleh kosong.
- area name tidak boleh kosong.
- recurring event harus memiliki rule valid;
- `endAt > startAt`;
- Task yang soft-deleted tidak dihitung ke Project progress;
- relation lintas User ditolak;
- Project yang Completed tidak boleh memiliki Task aktif yang unfinished.

---

# 13. Seed Data

Seed awal dapat membuat:

```text
User
username: dimas
password: env-configured
```

Optional Areas:

```text
Kuliah
Coding
Organisasi
Personal
```

Namun Area tetap editable.

---

# 14. Future-Proofing

Schema ini membuka jalan untuk:

- recurring task;
- focus sessions;
- notifications;
- analytics;
- AI planning;
- calendar integration;
- PWA sync.

Tanpa membuat tabel MVP terlalu kompleks.

---

# 15. Database Acceptance Criteria

Schema dianggap siap jika:

1. semua core entity dapat direpresentasikan;
2. task bisa tanpa deadline;
3. task bisa tanpa project;
4. project bisa tanpa area;
5. task bisa memiliki banyak time block;
6. time block bisa tanpa task;
7. recurring event dapat disimpan;
8. soft delete didukung;
9. daily review history dapat disimpan;
10. Smart Today dapat dihitung tanpa schema tambahan.
