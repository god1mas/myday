# MyDay — User Flow

**Version:** 1.1  
**Status:** Aligned to PRD v1.0 + BUSINESS-RULES v1.0  
**Scope:** MVP  
**Primary User:** Dimas  
**Rule Source:** `BUSINESS-RULES.md` v1.0 menjadi acuan perilaku final untuk flow MVP.

---

# 1. Purpose

Dokumen ini mendefinisikan alur utama pengguna saat menggunakan MyDay. Fokusnya adalah memastikan setiap fitur memiliki flow yang sederhana, konsisten, dan dapat digunakan setiap hari tanpa friction berlebihan.

Prinsip utama:

- Today adalah landing page utama.
- Task, Time Block, dan Event adalah entitas berbeda.
- Quick Add harus selalu mudah dijangkau.
- Mobile dioptimalkan untuk melihat, menambah, dan menyelesaikan task.
- Desktop dioptimalkan untuk planning dan management.

---

# 2. Global Navigation Flow

```text
LOGIN
  ↓
TODAY
  ├── Tasks
  ├── Calendar
  ├── Projects
  ├── Areas
  ├── Daily Review
  └── Settings
```

Quick Add dapat diakses dari hampir semua halaman utama.

---

# 3. Authentication Flow

## 3.1 Login

```text
Open MyDay
   ↓
Authenticated?
   ├── Yes → Today
   └── No
        ↓
   Login Page
        ↓
Enter Username + Password
        ↓
Validate
   ├── Valid → Create Session → Today
   └── Invalid → Show Error
```

### Error States

- username kosong;
- password kosong;
- kredensial salah;
- session expired.

### Success State

Setelah login berhasil, pengguna diarahkan ke `/today`.

---

# 4. Today Flow

```text
Open Today
   ↓
Load today's date
   ↓
Load:
- current/next activity
- today's events
- today's time blocks
- Smart Today tasks
   ↓
Render Today
```

## 4.1 Current / Next Activity

```text
Is there an activity happening now?
   ├── Yes → Show NOW
   │         Jika overlap, pilih activity dengan startAt paling awal
   │         dan sediakan akses ke activity lainnya.
   └── No
        ↓
Is there another activity later today?
   ├── Yes → Show NEXT
   └── No → Show "You're clear for the rest of the day"
```

Sumber activity:

- Event
- Time Block

Task Deadline tidak digunakan sebagai `NOW/NEXT`, tetapi tetap dapat muncul dalam schedule/calendar.

---

# 5. Smart Today Flow

```text
Open Today
   ↓
Collect active tasks
   ↓
Exclude:
- Done
- Deleted
   ↓
Calculate Smart Priority
   ↓
Apply Pin to Today
   ↓
Sort
   ↓
Show maximum 3 tasks
```

### Smart Today Scoring

Smart Today menggunakan scoring deterministic dari `BUSINESS-RULES.md`:

```text
SmartScore =
PinScore
+ PriorityScore
+ DeadlineScore
+ ProgressScore
+ ScheduledTodayScore
```

Aturan penting:

- Pin Today = bonus 1000;
- maksimum 3 Task ditampilkan;
- overdue memiliki bobot tinggi tetapi tidak absolut;
- task Urgent dengan deadline sangat dekat dapat mengalahkan task Low yang baru overdue;
- tie-breaker: pin → deadline lebih awal → priority lebih tinggi → createdAt lebih lama → stable id.

---

# 6. Create Task Flow

## 6.1 Full Create

```text
Tasks
  ↓
New Task
  ↓
Fill:
- Title *
- Description
- Deadline
- Priority
- Project
- Estimated Duration
- Subtasks
  ↓
Save
  ↓
Validation
  ├── Error → Stay + show inline errors
  └── Success → Task created
```

Defaults:

- priority = Medium;
- status = Todo;
- deadline time = 23:59 jika user hanya memilih tanggal.

---

# 7. Quick Add Flow

```text
Any main page
  ↓
Quick Add
  ↓
Enter:
- Title *
- Deadline
- Priority
- Project
  ↓
Add Task
```

Jika hanya title diisi, task tetap valid.

Target UX: task dapat dibuat dalam beberapa detik.

---

# 8. Task Detail Flow

```text
Open Task
  ↓
View:
- title
- description
- status
- priority
- deadline
- progress
- subtasks
- project
- estimated duration
- linked time blocks
```

Possible actions:

```text
Edit
Change Status
Mark as Done
Reopen Task
Add Subtask
Schedule
Pin to Today
Move to Trash
```

---

# 9. Complete Task Flow

```text
Active Task
   ↓
Mark as Done
   ↓
status = Done
   ↓
completedAt = now
   ↓
remove from active Smart Today
```

Task tidak dianggap overdue setelah Done.

Progress tetap mengikuti Business Rules:

- Task tanpa Subtask → 100% ketika Done;
- Task dengan Subtask → progress tetap dihitung dari checklist Subtask.

---

# 10. Reopen Task Flow

```text
Done Task
   ↓
Reopen Task
   ↓
status = Todo
completedAt = null
```

Subtask tidak diubah.

---

# 11. Subtask Flow

```text
Task Detail
  ↓
Add Subtask
  ↓
Enter Title
  ↓
Save
```

Toggle:

```text
Unchecked → Checked
Checked → Unchecked
```

Progress:

```text
completed subtasks / total subtasks
```

Semua subtask selesai tidak otomatis mengubah task menjadi Done.

---

# 12. Trash Flow

## Move to Trash

```text
Task Detail / Task Menu
  ↓
Delete
  ↓
Move to Trash
  ↓
Task disappears from active views
```

## Restore

```text
Trash
  ↓
Select Task
  ↓
Restore
  ↓
Task returns to previous data state
```

## Permanent Delete

Permanent Delete:

- hanya tersedia dari Trash;
- wajib confirmation;
- menghapus Task permanen;
- menghapus Subtask terkait;
- menghapus linked Time Block terkait.

---

# 13. Area Flow

```text
Areas
  ↓
New Area
  ↓
Name + optional icon
  ↓
Save
```

Actions:

- rename;
- change icon;
- delete.

Jika Area memiliki Project:

```text
Delete Area
  ↓
Area → soft deleted
  ↓
Project.areaId → null
```

Project dan Task tidak ikut dihapus.

---

# 14. Project Flow

## 14.1 Create Project

```text
Projects
  ↓
New Project
  ↓
Fill:
- Name *
- Description
- Icon
- Area
- Start Date
- Target Date
  ↓
Save
```

## 14.2 Project Detail

```text
Project Detail
  ↓
Show:
- progress
- active tasks
- completed tasks
- project metadata
```

## 14.3 Complete Project

```text
Mark Project Completed
   ↓
Any unfinished task?
   ├── Yes → Block action + explain
   └── No → Complete project
```

## 14.4 Delete Project

```text
Delete Project
   ↓
Confirm
   ↓
Project → soft deleted
   ↓
Related Task.projectId → null
```

Task tidak ikut dihapus.

---

# 15. Daily Planner Flow

```text
Planner / Calendar Day View
   ↓
Choose time slot
   ↓
Create Time Block
   ↓
Fill:
- Title *
- Date *
- Start *
- End *
- Related Task (optional)
   ↓
Check overlap
   ├── No overlap → Save
   └── Overlap → Warning → user may continue
```

---

# 16. Schedule Task Flow

```text
Task Detail
   ↓
Schedule
   ↓
Choose date + start + end
   ↓
Create linked Time Block
```

Satu task dapat memiliki beberapa Time Block.

---

# 17. Time Block Reschedule Flow

Saat MyDay dibuka:

```text
Find past Time Blocks linked to unfinished tasks
   ↓
Any unresolved?
   ├── No → continue
   └── Yes → offer:
          [Reschedule]
          [Dismiss]
```

## Reschedule

```text
Reschedule
   ↓
Choose new date/time
   ↓
Keep old Time Block as history
   ↓
old block.rescheduleState = RESCHEDULED
   ↓
Create new linked Time Block
```

Deadline Task tidak berubah.

Jika user memilih `Dismiss`:

```text
old block.rescheduleState = DISMISSED
```

---

# 18. Event Flow

## Create Event

```text
Calendar
   ↓
New Event
   ↓
Fill:
- Title *
- Date *
- Start *
- End *
- Location
- Notes
- Recurrence
   ↓
Save
```

Event tidak memiliki status Done.

---

# 19. Recurring Event Flow

```text
Create/Edit Event
   ↓
Recurrence
   ↓
Choose pattern
   ↓
Example:
Every Monday
   ↓
Save
```

MVP minimal harus mendukung weekly recurring event.

Pada MVP:

```text
Edit recurring event   → edit seluruh series
Delete recurring event → delete seluruh series
```

Edit/delete satu occurrence belum didukung.

---

# 20. Calendar Flow

## Desktop

Default:

```text
Calendar
  ↓
Week View
```

User dapat berpindah:

```text
Month ↔ Week ↔ Day
```

## Mobile

Default:

```text
Agenda / Day View
```

Calendar menampilkan:

- Event;
- Time Block;
- Task Deadline.

---

# 21. Daily Review Flow

```text
Today
  ↓
Review Today
  ↓
Load:
- completed tasks
- unfinished tasks
- today's planned activity
  ↓
For each unfinished task:
[Tomorrow] [Reschedule] [Keep]
  ↓
Optional reflection
  ↓
Finish Review
  ↓
Save Daily Review History
```

### Tomorrow

```text
pinnedDate = reviewDate + 1 day
```

Tomorrow tidak mengubah deadline dan tidak membuat Time Block otomatis.

### Reschedule

User memilih:

```text
date
start time
end time
```

lalu sistem membuat Time Block baru terkait Task. Deadline tetap.

### Keep

Task tidak diubah.

---

# 22. Search Flow

```text
Tasks
  ↓
Search
  ↓
Type keyword
  ↓
Filter by task title
  ↓
Show matching results
```

Optional future enhancement: search description.

---

# 23. Filter Flow

Task filters:

```text
Status
Priority
Project
Area
Deadline
```

Multiple filters dapat dikombinasikan.

---

# 24. Sort Flow

Sort options:

```text
Deadline
Priority
Created Date
Smart Priority
```

---

# 25. Mobile Core Flow

Primary mobile usage:

```text
Open App
   ↓
Today
   ├── See Now/Next
   ├── See Must Do
   ├── Complete Task
   └── Quick Add
```

Mobile navigation harus meminimalkan jumlah tap.

---

# 26. Empty States

Examples:

### No Tasks

```text
No tasks yet.
Add your first task.
```

### No Schedule

```text
Nothing scheduled today.
```

### No Project

```text
No projects yet.
Create one when a task grows into something bigger.
```

### No Daily Review History

```text
No reviews yet.
Your completed reviews will appear here.
```

---

# 27. MVP Flow Acceptance

User Flow dianggap siap jika pengguna dapat:

1. login;
2. membuka Today;
3. membuat task;
4. mengubah status;
5. menambahkan subtask;
6. membuat project;
7. membuat time block;
8. menghubungkan task ke time block;
9. membuat event;
10. membuat recurring event;
11. melihat semuanya di Calendar;
12. melakukan Daily Review;
13. mencari, filter, sort task;
14. menggunakan flow inti dari mobile maupun desktop.
