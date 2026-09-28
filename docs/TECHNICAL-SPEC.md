# MyDay — Technical Specification

**Version:** 1.1  
**Status:** Aligned MVP Architecture — BUSINESS-RULES v1.0

---

# 1. Stack

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS

## Backend

- Next.js Server Actions
- Route Handlers hanya jika dibutuhkan

## Database

- PostgreSQL

## ORM

- Prisma

## Authentication

- Auth.js Credentials atau session-based custom auth yang aman
- Single-user only

Recommended default: **Auth.js Credentials** agar session management tidak perlu dibangun dari nol.

---

# 2. Architecture Principles

- server-first;
- minimize client state;
- business logic terpisah dari UI;
- validation pada server boundary;
- derived state tidak disimpan jika dapat dihitung;
- no premature abstraction;
- single-user simplification dimanfaatkan.

---

# 3. Suggested Project Structure

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── today/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── projects/
│   │   ├── areas/
│   │   ├── reviews/
│   │   ├── trash/
│   │   └── settings/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── task/
│   ├── calendar/
│   ├── project/
│   ├── today/
│   └── review/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── validation/
│   ├── smart-today/
│   ├── calendar/
│   └── date/
│
├── server/
│   ├── actions/
│   ├── queries/
│   └── services/
│
└── types/
```

---

# 4. Rendering Strategy

Server Components untuk:

- page shell;
- data-heavy pages;
- Today data;
- Task list initial render;
- Project data;
- Calendar initial data.

Client Components hanya untuk:

- interactive forms;
- dropdown;
- date/time picker;
- drag/drop;
- optimistic toggles;
- modal/bottom sheet.

---

# 5. Data Access Layer

Gunakan satu Prisma client singleton.

Recommended layers:

```text
Page
 ↓
Server Action / Query
 ↓
Service / Business Logic
 ↓
Prisma
```

UI tidak boleh langsung berisi kompleksitas query.

---

# 6. Validation

Gunakan Zod.

Schemas minimal:

```text
taskSchema
subtaskSchema
projectSchema
areaSchema
timeBlockSchema
eventSchema
dailyReviewSchema
loginSchema
```

Validation dilakukan:

- client untuk UX;
- server untuk trust boundary.

Server validation adalah source of truth.

---

# 7. Authentication

Flow:

```text
username + password
  ↓
verify password hash
  ↓
create secure session
  ↓
protect application routes
```

Password hashing:

- Argon2id preferred;
- bcrypt acceptable jika dependency simplicity diperlukan.

Environment:

```text
DATABASE_URL
AUTH_SECRET
SEED_USERNAME
SEED_PASSWORD
```

Plain password tidak disimpan.

---

# 8. Authorization

Karena single-user:

- semua protected route membutuhkan valid session;
- tidak perlu RBAC;
- data query tetap di-scope ke current user untuk menjaga future safety.

---

# 9. Task Service

Functions:

```text
createTask
updateTask
setTaskStatus
completeTask
reopenTask
trashTask
restoreTask
deleteTaskPermanently
pinTaskToDate
```

---

# 10. Subtask Service

```text
createSubtask
toggleSubtask
updateSubtask
deleteSubtask
reorderSubtasks
```

Task progress dihitung dari query/service.

---

# 11. Project Service

```text
createProject
updateProject
completeProject
deleteProject
getProjectProgress
```

Complete Project memvalidasi tidak ada active task.

---

# 12. Planner Service

```text
createTimeBlock
updateTimeBlock
deleteTimeBlock
findOverlaps
getPendingReschedules
rescheduleTimeBlock
dismissReschedule
```

`rescheduleTimeBlock` harus:

1. mempertahankan block lama;
2. mengubah state lama menjadi `RESCHEDULED`;
3. membuat Time Block baru;
4. menghubungkan history melalui `rescheduledFromId`;
5. tidak mengubah Task deadline.

`dismissReschedule` hanya mengubah state block menjadi `DISMISSED`.

Overlap hanya warning.

---

# 13. Calendar Aggregation

Create unified UI model:

```ts
type CalendarItem =
  | { type: "event"; ... }
  | { type: "timeBlock"; ... }
  | { type: "deadline"; ... }
```

Service:

```text
getCalendarItems(start, end)
```

Query tiga sumber secara parallel lalu normalize dan sort.

---

# 14. Recurring Event Strategy

Untuk MVP, jangan generate semua occurrence ke database.

Recommended:

```text
Event stores base event
RecurrenceRule stores pattern
Application expands occurrences for requested date range
```

Keuntungan:

- database tidak penuh;
- recurrence lebih mudah diedit;
- calendar hanya generate occurrence yang diperlukan.

Pada MVP, edit/delete recurring event berlaku ke seluruh series.

Jika exception/edit single occurrence diperlukan nanti, tambahkan recurrence exception model.

---

# 15. Smart Today Engine

Module:

```text
src/lib/smart-today/
```

Input:

```ts
TaskCandidate {
  priority
  deadlineAt
  progress
  isOverdue
  isScheduledToday
  isPinnedToday
  createdAt
}
```

Output:

```ts
{
  taskId
  score
  reasons[]
}
```

## Score v1.0

```text
SmartScore =
PinScore
+ PriorityScore
+ DeadlineScore
+ ProgressScore
+ ScheduledTodayScore
```

### Pin

```text
Pinned today = 1000
Otherwise    = 0
```

### Priority

```text
Low     = 10
Medium  = 20
High    = 35
Urgent  = 50
```

### Deadline

```text
Overdue = 65 + min(fullDaysOverdue × 3, 30)

Upcoming:
<= 2h   = 80
<= 6h   = 70
<= 24h  = 60
<= 48h  = 45
<= 3d   = 30
<= 7d   = 15
> 7d    = 5
none    = 0
```

### Progress

```text
0–25%   = 15
26–50%  = 10
51–75%  = 5
76–99%  = 2
100%    = 0
```

### Scheduled Today

```text
true  = 25
false = 0
```

Tie-break:

```text
pin
→ earlier deadline
→ higher priority
→ older createdAt
→ stable id
```

Engine mengembalikan maksimal 3 result untuk Must Do Today.

Reasons:

```text
"Pinned today"
"Overdue"
"Due today"
"Urgent"
"Scheduled today"
```

Score mentah tidak wajib ditampilkan ke user.

---

# 16. Today Query

`getTodayDashboard(date)` returns:

```text
date
currentActivity?
nextActivity?
schedule[]
mustDo[]
pendingReschedules[]
```

Ini menjaga halaman Today hanya membutuhkan satu orchestrated query.

---

# 17. Daily Review

Service:

```text
getReviewSummary(date)
submitDailyReview(...)
getDailyReviewHistory(...)
```

Rules:

- satu review per tanggal;
- `Tomorrow` → `Task.pinnedDate = next day`;
- `Reschedule` → create linked Time Block;
- `Keep` → no Task mutation;
- deadline tidak berubah karena action review.

DailyReviewItem menyimpan action + task title snapshot.

---

# 17.1 Trash Semantics

Default query aktif harus mengecualikan `deletedAt != null`.

Task dalam Trash:

- tidak tampil di Today/Tasks/Search;
- deadline tidak tampil di Calendar;
- linked Time Block disembunyikan dari active Planner/Calendar.

Restore Task mengaktifkan kembali linked Time Block yang belum dihapus.

Permanent delete Task menghapus Subtask dan linked Time Block terkait.

Delete Project/Area adalah soft delete dan relation anak dilepas sesuai Business Rules.

---

# 18. Date & Time Strategy

Gunakan timezone aplikasi eksplisit.

Recommended initial timezone:

```text
Asia/Jakarta
```

Storage strategy:

- simpan timestamp normalized;
- tampilkan dalam configured timezone;
- jangan bergantung pada timezone browser sebagai satu-satunya source.

Karena aplikasi personal, timezone dapat disimpan di Settings kemudian.

---

# 18.1 Derived Data

Jangan menyimpan sebagai source of truth:

```text
isOverdue
taskProgress
projectProgress
SmartScore
```

Nilai tersebut dihitung dari data canonical.

Task dengan Subtask menggunakan progress checklist meskipun Task telah ditandai Done. Task tanpa Subtask menjadi 100% saat Done.

---

# 19. Caching

MVP jangan agresif menggunakan cache.

Untuk mutable productivity data:

- prefer fresh server reads;
- gunakan `revalidatePath` atau tag-based revalidation setelah mutation.

Avoid stale Today/Task data.

---

# 20. Optimistic UI

Boleh untuk:

- toggle subtask;
- mark task done;
- restore task.

Jangan gunakan optimistic behavior untuk operasi kompleks sebelum backend stabil.

---

# 21. Error Handling

User-facing errors:

- validation;
- authentication;
- database failure;
- conflict warning;
- action not allowed.

Pattern:

```text
inline field error
toast for action result
error boundary for unexpected page failure
```

---

# 22. Security

Minimal requirements:

- hashed password;
- secure session cookie;
- CSRF-safe framework defaults;
- no exposed secrets;
- server-side validation;
- protected routes;
- no raw SQL unless needed;
- sanitize unsafe rich text if introduced later.

---

# 23. Performance

MVP target:

- Today render cepat;
- avoid unnecessary client JS;
- database query scoped/indexed;
- calendar query by date range;
- task list paginated only if data volume eventually requires.

Single-user berarti skala bukan masalah utama; responsiveness adalah.

---

# 24. Testing

## Unit

Test:

- overdue calculation;
- project progress;
- task progress;
- Smart Today scoring;
- recurrence expansion;
- overlap detection.

## Integration

Test:

- create task;
- complete task;
- trash/restore;
- create project;
- create time block;
- recurring event;
- daily review.

## E2E

Critical flows:

```text
login
quick add
complete task
schedule task
view calendar
daily review
```

Recommended: Playwright.

---

# 25. Deployment

Recommended:

- Vercel for Next.js;
- managed PostgreSQL;
- Prisma migrations.

Potential DB:

- Neon;
- Supabase Postgres;
- Railway Postgres;
- other PostgreSQL provider.

Final provider dipilih saat deployment phase.

---

# 26. Environment Separation

```text
development
preview
production
```

Jangan gunakan production database untuk local development.

---

# 27. Logging

Minimal structured logging untuk:

- auth failures;
- server errors;
- database errors;
- unexpected Smart Today failures.

Tidak perlu analytics SDK pada MVP.

---

# 28. Technical Acceptance Criteria

- build production pass;
- typecheck pass;
- lint pass;
- test core rules pass;
- migrations reproducible;
- seed reproducible;
- auth protected;
- no public registration;
- responsive routes functional;
- Today tidak bergantung pada AI;
- Calendar dapat menggabungkan 3 source types.
