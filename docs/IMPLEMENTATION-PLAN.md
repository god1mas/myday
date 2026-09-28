# MyDay — Implementation Plan

**Version:** 1.1  
**Status:** Aligned Roadmap — BUSINESS-RULES v1.0  
**Approach:** Incremental, testable phases

---

# 1. Development Principles

- jangan membangun semua fitur sekaligus;
- setiap phase harus memiliki acceptance criteria;
- setiap phase harus bisa diuji;
- core data model diselesaikan sebelum visual complexity;
- Today dibangun setelah primitive utama tersedia;
- AI dan post-MVP feature tidak masuk implementation awal.

---

# 2. Phase Overview

```text
Phase 0  — Repository & Foundation
Phase 1  — Database Baseline
Phase 2  — Personal Authentication
Phase 3  — Areas & Projects
Phase 4  — Tasks & Subtasks
Phase 5  — Planner & Time Blocks
Phase 6  — Events & Recurrence
Phase 7  — Calendar
Phase 8  — Smart Today & Today Dashboard
Phase 9  — Daily Review
Phase 10 — Search, Filter, Sort, Trash
Phase 11 — Responsive Polish
Phase 12 — Testing & Hardening
Phase 13 — Deployment
```

---

# 3. Phase 0 — Repository & Foundation

Tasks:

- initialize Next.js App Router + TypeScript;
- configure Tailwind;
- configure lint;
- configure formatter;
- setup folder conventions;
- create environment template;
- connect PostgreSQL;
- setup Prisma;
- create initial README;
- establish branch/commit discipline.

Acceptance:

```text
npm run dev
npm run lint
npm run typecheck
```

all pass.

---

# 4. Phase 1 — Database Baseline

Implement:

- User;
- Area;
- Project;
- Task;
- Subtask;
- TimeBlock;
- Event;
- RecurrenceRule;
- DailyReview;
- DailyReviewItem.

Tasks:

- Prisma schema;
- migration;
- constraints;
- indexes;
- seed;
- reset/reproduce DB test.

Acceptance:

- clean database migration works;
- seed creates personal user;
- schema relations valid.

---

# 5. Phase 2 — Personal Authentication

Implement:

- login page;
- username/password credentials;
- password hashing;
- session;
- route protection;
- logout.

No registration.

Acceptance:

- unauthenticated access redirects to login;
- valid login succeeds;
- invalid login fails;
- session survives refresh;
- logout revokes access.

---

# 6. Phase 3 — Areas & Projects

Implement Area:

- create;
- edit;
- delete;
- ordering optional.

Implement Project:

- create;
- edit;
- target date;
- area relation;
- project detail;
- progress calculation;
- complete project validation;
- delete project without deleting task.

Acceptance:

- Area CRUD works;
- Project CRUD works;
- Project can be without Area;
- progress correct;
- cannot complete with unfinished task.

---

# 7. Phase 4 — Tasks & Subtasks

Implement:

- task create;
- edit;
- priority;
- status;
- deadline;
- estimate;
- project relation;
- task detail;
- complete;
- reopen;
- subtask CRUD;
- progress;
- Quick Add.

Acceptance:

- default Medium;
- default Todo;
- date-only deadline becomes 23:59;
- progress behavior correct;
- task can exist without Project;
- all subtasks complete does not auto-complete Task.

---

# 8. Phase 5 — Planner & Time Blocks

Implement:

- create Time Block;
- edit/delete;
- standalone block;
- linked Task;
- multiple blocks per Task;
- overlap warning;
- 30-minute planner layout;
- pending reschedule detection;
- reschedule/dismiss flow.

Acceptance:

- block requires start/end;
- overlaps allowed with warning;
- exact boundary tidak dianggap overlap;
- past linked unfinished block triggers reschedule offer;
- reschedule mempertahankan block lama dan membuat block baru;
- reschedule tidak mengubah deadline.

---

# 9. Phase 6 — Events & Recurrence

Implement:

- event CRUD;
- location;
- notes;
- weekly recurrence;
- recurrence expansion service.

Acceptance:

- weekly class schedule can be represented;
- generated occurrences appear correctly in requested range;
- edit recurring event mengubah seluruh series;
- delete recurring event menghapus seluruh series;
- per-occurrence exception belum tersedia.

---

# 10. Phase 7 — Calendar

Implement views:

- Month;
- Week;
- Day/Agenda.

Data sources:

- Event;
- Time Block;
- Task Deadline.

Desktop default:

- Week.

Mobile default:

- Agenda.

Acceptance:

- all three item types render;
- deadline appears at deadline time;
- navigation between dates works.

---

# 11. Phase 8 — Smart Today & Today Dashboard

First implement Smart Today business module.

Inputs:

- overdue;
- deadline;
- priority;
- progress;
- scheduled today;
- pinned today.

Then build Today:

```text
Now/Next
Schedule
Must Do
Pending Reschedule
Review Today
```

Acceptance:

- max 3 Must Do;
- Done tasks excluded;
- Smart Score v1.0 sesuai BUSINESS-RULES.md;
- urgent near-deadline dapat mengalahkan low recent-overdue;
- Pin to Today bekerja dan date-specific;
- current/next activity logic correct;
- overlapping current activities deterministic;
- no schedule message works.

---

# 12. Phase 9 — Daily Review

Implement:

- Review Today;
- summary;
- unfinished tasks;
- Tomorrow;
- Reschedule;
- Keep;
- reflection;
- history.

Acceptance:

- one review per date;
- history persisted;
- task title snapshot available;
- Tomorrow mem-pin Task ke hari berikutnya tanpa mengubah deadline;
- Reschedule membuat Time Block tanpa mengubah deadline;
- Keep tidak mengubah Task.

---

# 13. Phase 10 — Search, Filter, Sort, Trash

Implement Task search.

Filters:

- status;
- priority;
- project;
- area;
- deadline.

Sort:

- deadline;
- priority;
- created;
- smart priority.

Trash:

- move task;
- restore;
- permanent delete.

Acceptance:

- filters combinable;
- Trash excluded from active queries;
- restore works.

---

# 14. Phase 11 — Responsive Polish

Desktop:

- sidebar;
- planning layout;
- weekly calendar.

Mobile:

- bottom nav;
- agenda;
- Quick Add;
- task complete;
- Today optimization.

Acceptance:

- main flows usable at phone width;
- touch targets acceptable;
- no horizontal overflow;
- modal becomes bottom sheet where appropriate.

---

# 15. Phase 12 — Testing & Hardening

Run:

```text
lint
typecheck
unit tests
integration tests
E2E
production build
```

Audit:

- auth;
- session;
- soft delete;
- recurrence;
- timezone;
- edge dates;
- calendar overlap;
- Today logic.

---

# 16. Phase 13 — Deployment

Tasks:

- production PostgreSQL;
- migrations;
- production env;
- seed personal account safely;
- deploy Next.js;
- verify auth;
- test laptop;
- test mobile;
- backup strategy.

Acceptance:

- production login works;
- Today loads;
- create/update task works;
- calendar works;
- DB persists;
- HTTPS active.

---

# 17. Suggested Milestones

## Milestone A — Core Data

Complete:

```text
Phase 0–4
```

Result:

- login;
- areas;
- projects;
- tasks;
- subtasks.

## Milestone B — Planning System

Complete:

```text
Phase 5–7
```

Result:

- planner;
- events;
- recurring events;
- calendar.

## Milestone C — Daily Productivity

Complete:

```text
Phase 8–10
```

Result:

- Smart Today;
- Today;
- Daily Review;
- filters/trash.

## Milestone D — Production Ready

Complete:

```text
Phase 11–13
```

Result:

- responsive;
- tested;
- deployed.

---

# 18. Definition of Done per Phase

Sebuah phase belum dianggap selesai jika hanya UI terlihat bekerja.

Minimum DoD:

- feature functional;
- validation ada;
- error path diuji;
- data persisted;
- lint pass;
- typecheck pass;
- relevant tests pass;
- no known high severity issue;
- acceptance checklist pass.

---

# 19. Git Strategy

Recommended simple flow:

```text
main
└── feature/<phase-or-feature>
```

Commit kecil dan descriptive.

Examples:

```text
feat(tasks): add task creation
feat(planner): add overlap warning
fix(today): exclude completed tasks
test(projects): cover progress calculation
```

---

# 20. MVP Freeze Rule

Saat Phase 0 dimulai, fitur baru tidak dimasukkan ke MVP kecuali:

- memblokir workflow utama;
- memperbaiki data integrity;
- memperbaiki security;
- memperbaiki usability kritis.

Semua ide lain masuk backlog post-MVP.

---

# 21. Post-MVP Backlog

Setelah MVP stabil:

```text
Recurring Tasks
Focus Timer
Productivity Analytics
Notifications
PWA
AI Scheduling
Google Calendar Integration
Attachments
Tags
Dark Mode
```

Urutan ditentukan berdasarkan penggunaan nyata MyDay.

---

# 22. Next Recommended Step

`BUSINESS-RULES.md` v1.0 sudah final untuk baseline MVP.

Sebelum development:

1. lakukan final documentation sanity check;
2. approve wireframe/UI baseline;
3. pastikan repository target sudah siap;
4. mulai Phase 0 — Repository & Foundation.

Dokumen ini sengaja memisahkan requirement, design, dan implementation agar perubahan dapat dilakukan tanpa mencampur semua concern.
