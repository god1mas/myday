# MyDay — Business Rules

**Version:** 1.0  
**Status:** MVP Baseline  
**Product:** MyDay — Personal Daily Planner & Task Manager  
**Primary User:** Dimas  
**Timezone Baseline:** Asia/Jakarta  
**Source:** PRD v1.0 + Requirement Discovery  
**Purpose:** Menjadi sumber aturan perilaku utama untuk seluruh fitur MVP.

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan aturan bisnis MyDay yang harus dipatuhi oleh:

- UI;
- Server Actions;
- service layer;
- database queries;
- Smart Today engine;
- Calendar;
- Daily Planner;
- Daily Review;
- testing.

Jika ada perbedaan perilaku antara implementasi dan dokumen ini, dokumen ini menjadi acuan sampai direvisi secara eksplisit.

---

# 2. Prinsip Dasar Produk

MyDay menggunakan tiga konsep waktu yang berbeda:

```text
TASK
Apa yang harus saya selesaikan?

TIME BLOCK
Kapan saya berencana mengerjakannya?

EVENT
Aktivitas apa yang terjadi pada waktu tertentu?
```

Aturan utama:

1. Deadline Task tidak sama dengan Time Block.
2. Mengubah Time Block tidak mengubah Deadline.
3. Event tidak memiliki status Done.
4. Time Block tidak memiliki status Done.
5. Penyelesaian pekerjaan selalu ditentukan oleh Task.
6. Calendar hanya menjadi representasi gabungan dari beberapa sumber data.
7. AI tidak digunakan untuk menentukan aturan inti MVP.

---

# 3. Global Time Rules

## BR-TIME-001 — Timezone

Seluruh perhitungan hari MyDay menggunakan:

```text
Asia/Jakarta
```

sebagai timezone baseline MVP.

Timezone dapat menjadi setting pengguna pada versi berikutnya.

---

## BR-TIME-002 — Day Boundary

Hari berganti pada:

```text
00:00
```

waktu lokal aplikasi.

MyDay tidak menggunakan konsep “hari baru setelah tidur”.

---

## BR-TIME-003 — Date-Only Deadline

Jika pengguna memilih tanggal deadline tanpa memilih jam, sistem otomatis menggunakan:

```text
23:59
```

pada tanggal tersebut.

Contoh:

```text
Input:
30 September 2026

Stored meaning:
30 September 2026, 23:59 Asia/Jakarta
```

---

## BR-TIME-004 — Start and End Time

Event dan Time Block wajib memiliki:

```text
startAt
endAt
```

dan:

```text
endAt > startAt
```

Tidak boleh membuat Event atau Time Block dengan durasi nol atau end time lebih awal dari start time.

---

# 4. Task Rules

## BR-TASK-001 — Required Field

Task hanya memiliki satu field wajib dari sisi pengguna:

```text
title
```

Title setelah di-trim tidak boleh kosong.

---

## BR-TASK-002 — Default Values

Task baru menggunakan default:

```text
status   = Todo
priority = Medium
```

---

## BR-TASK-003 — Optional Fields

Task boleh tidak memiliki:

- description;
- deadline;
- project;
- estimated duration;
- subtask.

---

## BR-TASK-004 — Task Status

Status MVP:

```text
Todo
In Progress
Done
```

Transisi yang diperbolehkan:

```text
Todo → In Progress
Todo → Done

In Progress → Todo
In Progress → Done

Done → Reopen → Todo
```

---

## BR-TASK-005 — Reopen

Jika Task berstatus Done dan pengguna memilih `Reopen Task`:

```text
status      = Todo
completedAt = null
```

Subtask tidak diubah.

---

## BR-TASK-006 — Mark as Done

Ketika pengguna menandai Task selesai:

```text
status      = Done
completedAt = current timestamp
```

Jika Task tidak memiliki Subtask:

```text
progress = 100%
```

Jika Task memiliki Subtask, UI tetap boleh menampilkan semua Subtask sebagaimana adanya, tetapi status Task adalah source of truth bahwa pekerjaan sudah selesai.

---

## BR-TASK-007 — Done Tidak Otomatis dari Subtask

Jika seluruh Subtask selesai:

```text
Task tetap berada pada status sebelumnya.
```

Sistem tidak otomatis menjalankan `Mark as Done`.

Alasan:

Checklist lengkap belum tentu berarti pekerjaan benar-benar sudah dikumpulkan atau final.

---

## BR-TASK-008 — Estimated Duration

Estimated duration:

- opsional;
- harus lebih dari 0 jika diisi;
- disimpan dalam menit;
- tidak memengaruhi MVP Smart Today scoring v1.0.

Field ini disiapkan untuk scheduling dan AI di masa depan.

---

# 5. Subtask & Progress Rules

## BR-SUBTASK-001 — Subtask Ownership

Subtask wajib terkait tepat dengan satu Task.

Subtask tidak boleh berdiri sendiri.

---

## BR-SUBTASK-002 — Task Progress with Subtasks

Jika Task memiliki satu atau lebih Subtask:

```text
progress =
completed subtasks / total subtasks × 100
```

Contoh:

```text
3 selesai
5 total

progress = 60%
```

Progress dapat dibulatkan ke integer terdekat untuk tampilan.

---

## BR-SUBTASK-003 — Task Progress without Subtasks

Jika Task tidak memiliki Subtask:

```text
Todo        → 0%
In Progress → 0%
Done        → 100%
```

---

## BR-SUBTASK-004 — Subtask Order

Subtask memiliki urutan manual.

Jika user menambahkan Subtask baru:

```text
position = posisi terakhir + 1
```

---

# 6. Deadline & Overdue Rules

## BR-DEADLINE-001 — Deadline Optional

Task tidak wajib memiliki deadline.

Task tanpa deadline tetap valid.

---

## BR-DEADLINE-002 — Overdue Definition

Overdue bukan status.

Task dianggap overdue jika:

```text
deadlineAt != null
AND deadlineAt < now
AND status != Done
AND deletedAt == null
```

---

## BR-DEADLINE-003 — Completed Task

Task berstatus Done tidak dianggap overdue meskipun:

```text
completedAt > deadlineAt
```

MVP tidak memberikan label `Completed Late`.

Fitur tersebut dapat ditambahkan pada analytics post-MVP.

---

## BR-DEADLINE-004 — Deadline Change

Mengubah deadline tidak:

- mengubah Time Block;
- mengubah Event;
- otomatis menjadwalkan ulang Task.

---

# 7. Priority Rules

## BR-PRIORITY-001 — Priority Levels

Urutan priority:

```text
Urgent
High
Medium
Low
```

---

## BR-PRIORITY-002 — Default Priority

Task baru menggunakan:

```text
Medium
```

jika user tidak memilih priority lain.

---

## BR-PRIORITY-003 — Priority Does Not Equal Deadline

Priority dan deadline adalah dua sinyal terpisah.

Contoh:

```text
Urgent tanpa deadline
```

tetap valid.

---

# 8. Project Rules

## BR-PROJECT-001 — Project Optional for Task

Task boleh:

```text
projectId = null
```

---

## BR-PROJECT-002 — One Project per Task

Satu Task maksimal terkait dengan satu Project.

---

## BR-PROJECT-003 — Project Target Date

Target date bersifat opsional.

Target date Project tidak otomatis menjadi deadline Task.

---

## BR-PROJECT-004 — Project Progress

Project progress dihitung berdasarkan Task yang tidak berada di Trash.

Formula:

```text
completed active tasks / total active tasks × 100
```

`Done` dihitung completed.

`Todo` dan `In Progress` dihitung unfinished.

Task soft-deleted tidak masuk perhitungan.

---

## BR-PROJECT-005 — Project without Tasks

Jika Project belum memiliki Task:

```text
progress = 0%
```

---

## BR-PROJECT-006 — Complete Project

Project hanya dapat ditandai Completed jika:

```text
semua Task aktif berstatus Done
```

Jika masih ada Task Todo atau In Progress:

```text
aksi Complete diblokir
```

UI harus menjelaskan alasan.

---

## BR-PROJECT-007 — Reopen Project

Jika Project Completed dibuka kembali:

```text
status = Active
completedAt = null
```

Task di dalam Project tidak berubah.

---

## BR-PROJECT-008 — Delete Project

Ketika Project dihapus:

```text
Project → soft deleted
Task.projectId → null
```

Task tidak ikut dihapus.

Jika Project kemudian direstore, Task yang sebelumnya dilepas tidak otomatis terhubung kembali.

---

# 9. Area Rules

## BR-AREA-001 — Area Purpose

Area adalah konteks kehidupan jangka panjang.

Contoh:

```text
Kuliah
Coding
Organisasi
Personal
```

Area bukan Project.

---

## BR-AREA-002 — Area Editable

User dapat:

- create;
- rename;
- change icon;
- delete.

---

## BR-AREA-003 — Project Can Exist without Area

Project valid jika:

```text
areaId = null
```

---

## BR-AREA-004 — Delete Area

Jika Area dihapus:

```text
Area → soft deleted
Project.areaId → null
```

Project dan Task tidak ikut dihapus.

Jika Area direstore, Project tidak otomatis terhubung kembali.

---

# 10. Time Block Rules

## BR-BLOCK-001 — Time Block Purpose

Time Block adalah alokasi waktu.

Time Block bukan Task dan tidak memiliki status Done.

---

## BR-BLOCK-002 — Task Relationship

Time Block boleh:

```text
taskId = null
```

atau terkait dengan satu Task.

---

## BR-BLOCK-003 — Multiple Blocks per Task

Satu Task dapat memiliki banyak Time Block.

Contoh:

```text
Task: Laporan Big Data

Monday 19:00–21:00
Tuesday 20:00–21:00
```

---

## BR-BLOCK-004 — Standalone Time Block

Standalone Time Block valid untuk:

- makan;
- istirahat;
- perjalanan;
- olahraga;
- tidur;
- aktivitas pribadi lain.

---

## BR-BLOCK-005 — Planner Grid

UI Planner menggunakan interval visual utama:

```text
30 menit
```

Namun waktu yang disimpan tidak dibatasi hanya pada kelipatan 30 menit jika date/time picker mendukung waktu lain.

---

# 11. Schedule Conflict Rules

## BR-CONFLICT-001 — Conflict Detection

Saat membuat atau mengedit Event/Time Block, sistem mengecek overlap dengan:

- Event;
- Time Block.

Task Deadline tidak dihitung sebagai schedule conflict.

---

## BR-CONFLICT-002 — Overlap Formula

Dua aktivitas overlap jika:

```text
new.startAt < existing.endAt
AND
new.endAt > existing.startAt
```

---

## BR-CONFLICT-003 — Warning Only

Schedule overlap:

```text
tidak memblokir penyimpanan
```

UI menampilkan warning dan user boleh melanjutkan.

---

## BR-CONFLICT-004 — Exact Boundary

Aktivitas berikut tidak dianggap overlap:

```text
A = 08:00–10:00
B = 10:00–11:00
```

karena satu berakhir tepat saat aktivitas berikutnya dimulai.

---

# 12. Reschedule Rules

## BR-RESCHEDULE-001 — Eligible Time Block

Sebuah Time Block dianggap eligible untuk tawaran reschedule jika:

```text
endAt < now
AND taskId != null
AND linked Task.status != Done
AND linked Task.deletedAt == null
AND rescheduleState == NONE
```

---

## BR-RESCHEDULE-002 — Most Recent Block per Task

Untuk menghindari banyak prompt lama:

```text
hanya Time Block eligible paling baru untuk setiap Task
```

yang ditawarkan pada satu waktu.

Block lama tetap menjadi history.

---

## BR-RESCHEDULE-003 — Prompt Timing

Prompt muncul:

```text
saat user membuka MyDay setelah Time Block berakhir
```

bukan otomatis tepat saat jam selesai.

---

## BR-RESCHEDULE-004 — Reschedule Action

Jika user memilih `Reschedule`:

1. Time Block lama dipertahankan sebagai history.
2. Time Block baru dibuat dengan waktu baru.
3. Time Block lama ditandai:

```text
RESCHEDULED
```

---

## BR-RESCHEDULE-005 — Dismiss

Jika user memilih `Dismiss`:

```text
rescheduleState = DISMISSED
```

Task tetap tidak berubah.

---

## BR-RESCHEDULE-006 — Deadline Preservation

Reschedule Time Block tidak pernah mengubah:

```text
Task.deadlineAt
```

---

# 13. Event Rules

## BR-EVENT-001 — Event Status

Event tidak memiliki:

```text
Todo
In Progress
Done
```

Event hanya merepresentasikan jadwal.

---

## BR-EVENT-002 — Optional Metadata

Event dapat memiliki:

```text
location
notes
recurrence
```

---

# 14. Recurring Event Rules

## BR-RECURRENCE-001 — MVP Recurrence

MVP UI wajib mendukung minimal:

```text
Weekly recurrence
```

contoh:

```text
Every Monday
08:00–10:00
```

---

## BR-RECURRENCE-002 — Base Event

Recurring Event disimpan sebagai:

```text
base Event
+
Recurrence Rule
```

Occurrence tidak perlu disimpan satu per satu.

---

## BR-RECURRENCE-003 — Range Expansion

Occurrence dihasilkan hanya untuk rentang tanggal yang sedang diminta Calendar.

Contoh:

```text
Week View
→ generate occurrences hanya untuk minggu tersebut
```

---

## BR-RECURRENCE-004 — Edit Series

Pada MVP:

```text
Edit recurring event = edit seluruh series
```

Edit satu occurrence belum didukung.

---

## BR-RECURRENCE-005 — Delete Series

Pada MVP:

```text
Delete recurring event = delete seluruh series
```

Delete satu occurrence belum didukung.

---

## BR-RECURRENCE-006 — End Rule

Recurrence dapat:

- tanpa tanggal akhir; atau
- memiliki `until`.

Jika `until` tersedia, occurrence setelah tanggal itu tidak dibuat.

---

# 15. Calendar Rules

## BR-CALENDAR-001 — Calendar Sources

Calendar menampilkan tiga source:

```text
Event
Time Block
Task Deadline
```

---

## BR-CALENDAR-002 — Deadline Position

Task Deadline muncul pada:

```text
deadlineAt
```

bukan sebagai all-day item.

---

## BR-CALENDAR-003 — Desktop Default

Default desktop:

```text
Week View
```

---

## BR-CALENDAR-004 — Mobile Default

Default mobile:

```text
Day / Agenda View
```

---

## BR-CALENDAR-005 — Deleted Data

Calendar tidak menampilkan:

- Event soft-deleted;
- Time Block soft-deleted;
- Deadline Task soft-deleted.

Time Block terkait Task yang berada di Trash juga disembunyikan dari active Calendar.

---

# 16. Smart Today Rules

# 16.1 Candidate Eligibility

## BR-SMART-001 — Candidate Pool

Candidate Smart Today adalah Task yang:

```text
status != Done
AND deletedAt == null
```

Task boleh:

- memiliki deadline;
- tidak memiliki deadline;
- memiliki project;
- tidak memiliki project.

---

## BR-SMART-002 — Maximum Result

Must Do Today menampilkan maksimal:

```text
3 Task
```

---

## BR-SMART-003 — No AI

Ranking Smart Today menggunakan deterministic scoring.

Tidak ada model AI pada MVP.

---

# 16.2 Smart Today Score v1.0

Total score:

```text
SmartScore =
PinScore
+ PriorityScore
+ DeadlineScore
+ ProgressScore
+ ScheduledTodayScore
```

---

## BR-SMART-004 — Pin Score

Jika:

```text
pinnedDate == today
```

maka:

```text
PinScore = 1000
```

Jika tidak:

```text
PinScore = 0
```

Artinya task yang dipin selalu diprioritaskan terhadap task non-pinned.

Jika lebih dari tiga Task dipin pada hari yang sama, hanya tiga teratas berdasarkan score non-pin + tie-breaker yang ditampilkan.

---

## BR-SMART-005 — Priority Score

```text
Low     = 10
Medium  = 20
High    = 35
Urgent  = 50
```

---

## BR-SMART-006 — Deadline Score

### Overdue

Jika Task overdue:

```text
DeadlineScore =
65 + overdueAgeBonus
```

dengan:

```text
overdueAgeBonus =
min(fullDaysOverdue × 3, 30)
```

Contoh:

```text
Overdue 1 hari  → 68
Overdue 5 hari  → 80
Overdue 20 hari → 95 (cap)
```

### Upcoming Deadline

Jika tidak overdue:

```text
<= 2 jam       → 80
<= 6 jam       → 70
<= 24 jam      → 60
<= 48 jam      → 45
<= 3 hari      → 30
<= 7 hari      → 15
> 7 hari       → 5
No deadline    → 0
```

---

## BR-SMART-007 — Progress Score

Progress memberi bobot kecil berdasarkan sisa pekerjaan.

```text
0–25%    → 15
26–50%   → 10
51–75%   → 5
76–99%   → 2
100%     → 0
```

Task Done tidak masuk candidate pool.

Tujuannya:

task yang masih banyak belum selesai mendapat sedikit dorongan prioritas tanpa mengalahkan deadline dan priority.

---

## BR-SMART-008 — Scheduled Today Score

Jika Task memiliki minimal satu Time Block pada hari ini:

```text
ScheduledTodayScore = 25
```

Jika tidak:

```text
ScheduledTodayScore = 0
```

---

# 16.3 Smart Today Examples

## Example A

```text
Task A
Low
Overdue 1 day
Progress 50%
Not scheduled
```

Score:

```text
Priority   10
Deadline   68
Progress   10
Scheduled   0
Total      88
```

---

## Example B

```text
Task B
Urgent
Due in 2 hours
Progress 20%
Not scheduled
```

Score:

```text
Priority   50
Deadline   80
Progress   15
Scheduled   0
Total     145
```

Task B dapat mengalahkan Task A.

Ini memenuhi requirement bahwa overdue penting tetapi tidak absolut.

---

## Example C

```text
Task C
Medium
No deadline
Progress 0%
Scheduled today
```

Score:

```text
Priority   20
Deadline    0
Progress   15
Scheduled  25
Total      60
```

Task tanpa deadline tetap dapat masuk Must Do Today.

---

# 16.4 Tie-Breaking

## BR-SMART-009 — Tie Order

Jika dua Task memiliki score sama:

1. pinned today;
2. deadline lebih awal;
3. priority lebih tinggi;
4. createdAt lebih lama;
5. id stable ordering.

Task tanpa deadline dianggap memiliki deadline paling akhir pada tie-break deadline.

---

# 16.5 Smart Today Explainability

## BR-SMART-010 — Reasons

Engine sebaiknya menghasilkan alasan singkat seperti:

```text
Overdue
Due today
Urgent
Scheduled today
Pinned today
```

UI tidak wajib menampilkan score angka mentah.

---

# 17. Pin to Today Rules

## BR-PIN-001 — Pin Behavior

`Pin to Today` mengatur:

```text
pinnedDate = today
```

---

## BR-PIN-002 — Pin Is Date-Specific

Pin tidak permanen.

Ketika hari berubah:

```text
pinnedDate lama tidak dianggap aktif
```

---

## BR-PIN-003 — Pin Does Not Schedule

Pin tidak:

- membuat Time Block;
- mengubah Deadline;
- mengubah Priority.

---

# 18. Today Dashboard Rules

## BR-TODAY-001 — Primary Sections

Today memprioritaskan:

```text
NOW / NEXT
TODAY'S SCHEDULE
MUST DO TODAY
```

---

## BR-TODAY-002 — Current Activity

Current Activity berasal dari Event atau Time Block yang memenuhi:

```text
startAt <= now < endAt
```

Jika lebih dari satu aktivitas overlap, tampilkan aktivitas dengan startAt paling awal dan beri akses melihat aktivitas overlap lainnya.

---

## BR-TODAY-003 — Next Activity

Jika tidak ada Current Activity:

```text
Next Activity =
Event / Time Block berikutnya dengan startAt > now
```

Task Deadline tidak digunakan sebagai Next Activity.

---

## BR-TODAY-004 — No Remaining Activity

Jika tidak ada Event atau Time Block setelah sekarang:

```text
"You're clear for the rest of the day."
```

---

## BR-TODAY-005 — Today's Schedule

Schedule hari ini menggabungkan:

- Event;
- Time Block.

Deadline dapat ditampilkan sebagai secondary deadline marker, tetapi bukan schedule block.

---

# 19. Quick Add Rules

## BR-QUICK-001 — Required Input

Quick Add hanya mewajibkan:

```text
title
```

---

## BR-QUICK-002 — Optional Inputs

Quick Add menyediakan:

```text
deadline
priority
project
```

---

## BR-QUICK-003 — Defaults

Jika tidak dipilih:

```text
priority = Medium
status   = Todo
project  = null
deadline = null
```

---

# 20. Daily Review Rules

## BR-REVIEW-001 — Manual Trigger

Daily Review tidak otomatis muncul pada jam tertentu.

User membukanya melalui:

```text
Review Today
```

---

## BR-REVIEW-002 — One Review per Date

Maksimum satu Daily Review untuk:

```text
user + reviewDate
```

---

## BR-REVIEW-003 — Completed Count

Completed count adalah Task dengan:

```text
completedAt berada pada reviewDate
```

dalam timezone aplikasi.

---

## BR-REVIEW-004 — Unfinished Candidate

Task masuk bagian Unfinished jika belum Done dan minimal salah satu benar:

```text
1. memiliki Time Block pada reviewDate
2. pinnedDate == reviewDate
3. deadline berada pada reviewDate
```

Task yang tidak berhubungan dengan hari tersebut tidak dipaksa masuk Daily Review.

---

# 20.1 Unfinished Actions

## BR-REVIEW-005 — Tomorrow

`Tomorrow`:

```text
pinnedDate = reviewDate + 1 day
```

Tomorrow tidak:

- mengubah deadline;
- membuat Time Block otomatis.

Tujuannya adalah menaruh Task ke fokus esok hari tanpa menyamakan planning dengan deadline.

---

## BR-REVIEW-006 — Reschedule

`Reschedule` membuka pemilihan:

```text
date
start time
end time
```

Kemudian membuat Time Block baru terkait Task.

Deadline Task tidak berubah.

---

## BR-REVIEW-007 — Keep

`Keep` tidak mengubah:

- deadline;
- priority;
- project;
- pin;
- schedule.

Task tetap aktif seperti sebelumnya.

---

## BR-REVIEW-008 — Reflection

Reflection:

- opsional;
- plain text;
- dapat kosong.

---

## BR-REVIEW-009 — Finish Review

Saat `Finish Review`:

1. DailyReview disimpan.
2. Summary count disimpan sebagai snapshot.
3. Setiap keputusan unfinished disimpan sebagai DailyReviewItem.
4. Task title disimpan sebagai snapshot pada item.

---

## BR-REVIEW-010 — Review History

Review yang sudah selesai:

```text
read-only pada MVP
```

Past review tidak digunakan untuk mengubah kembali Task secara otomatis.

---

# 21. Search Rules

## BR-SEARCH-001 — MVP Search

Search minimal mencari berdasarkan:

```text
Task.title
```

Matching:

- case-insensitive;
- partial text.

---

## BR-SEARCH-002 — Deleted Task

Task di Trash tidak muncul pada Search utama.

Trash dapat memiliki search sendiri pada versi berikutnya.

---

# 22. Filter Rules

## BR-FILTER-001 — Available Filters

MVP:

```text
Status
Priority
Project
Area
Deadline
```

---

## BR-FILTER-002 — Combined Filter

Filter berbeda menggunakan logika:

```text
AND
```

Contoh:

```text
Priority = High
AND
Project = MyDay
```

Jika satu filter mendukung multi-select, pilihan di dalam filter yang sama dapat menggunakan `OR`.

---

# 23. Sorting Rules

## BR-SORT-001 — Deadline

Ascending deadline:

```text
earliest deadline first
null deadline last
```

---

## BR-SORT-002 — Priority

Descending priority:

```text
Urgent
High
Medium
Low
```

---

## BR-SORT-003 — Created Date

Default created sort:

```text
newest first
```

---

## BR-SORT-004 — Smart Priority

Menggunakan Smart Today scoring v1.0.

Task dengan score tertinggi tampil lebih dahulu.

---

# 24. Trash Rules

## BR-TRASH-001 — Task Delete

Delete Task dari active UI berarti:

```text
soft delete
```

Task tidak langsung dihapus permanen.

---

## BR-TRASH-002 — Active Query Exclusion

Task dengan:

```text
deletedAt != null
```

tidak tampil pada:

- Today;
- Tasks;
- Project progress;
- Smart Today;
- Search utama;
- Calendar deadline.

---

## BR-TRASH-003 — Linked Time Blocks

Jika Task berada di Trash:

- linked Time Block tidak dihapus otomatis;
- linked Time Block disembunyikan dari active Calendar/Planner;
- restore Task membuat linked Time Block kembali terlihat jika Time Block sendiri tidak deleted.

---

## BR-TRASH-004 — Restore Task

Restore:

```text
deletedAt = null
```

Jika Project asal sudah dihapus:

```text
projectId = null
```

---

## BR-TRASH-005 — Permanent Delete

Permanent Delete:

- hanya dari Trash;
- wajib confirmation;
- menghapus Task secara permanen;
- menghapus Subtask terkait;
- menghapus linked Time Block terkait.

---

## BR-TRASH-006 — Auto Purge

MVP tidak memiliki auto purge.

Trash tetap disimpan sampai user menghapus permanen.

---

# 25. Authentication Rules

## BR-AUTH-001 — Single User

MVP hanya mendukung satu akun pribadi.

---

## BR-AUTH-002 — No Registration

Tidak ada:

```text
Sign Up
Create Account
Public Registration
```

---

## BR-AUTH-003 — Credentials

Login menggunakan:

```text
username
password
```

---

## BR-AUTH-004 — Protected Data

Semua route aplikasi selain login wajib membutuhkan session valid.

---

## BR-AUTH-005 — Generic Login Error

Kredensial salah menampilkan pesan generik.

Contoh:

```text
Username atau password salah.
```

Jangan mengungkap apakah username tertentu ada.

---

# 26. Validation Rules

## BR-VALIDATION-001 — Server Is Source of Truth

Semua business validation wajib dilakukan server-side.

Client validation hanya meningkatkan UX.

---

## BR-VALIDATION-002 — Ownership

Semua relation harus dimiliki user yang sama:

```text
Project.userId == Task.userId
Area.userId == Project.userId
Task.userId == TimeBlock.userId
```

---

## BR-VALIDATION-003 — Empty String

String optional yang hanya berisi whitespace dinormalisasi menjadi:

```text
null
```

jika field mengizinkan null.

---

# 27. Empty State Rules

## BR-EMPTY-001 — Actionable Empty State

Empty state harus menjelaskan:

1. kondisi saat ini;
2. aksi utama berikutnya.

Contoh:

```text
No tasks today.
Add a task when something comes up.
```

---

# 28. Mobile Rules

## BR-MOBILE-001 — Primary Navigation

Mobile primary navigation:

```text
Today
Tasks
Calendar
Projects
```

---

## BR-MOBILE-002 — Default Calendar

Mobile membuka Calendar pada:

```text
Agenda / Day
```

---

## BR-MOBILE-003 — Primary Actions

Action yang harus mudah dijangkau:

- Quick Add;
- Mark as Done;
- View Today;
- View Schedule.

---

# 29. Desktop Rules

## BR-DESKTOP-001 — Sidebar

Desktop menggunakan persistent sidebar jika viewport mencukupi.

---

## BR-DESKTOP-002 — Default Calendar

Desktop Calendar membuka:

```text
Week
```

---

# 30. Data Snapshot Rules

## BR-SNAPSHOT-001 — Daily Review Snapshot

Daily Review menyimpan:

- completedTaskCount;
- unfinishedTaskCount;
- Task title snapshot pada DailyReviewItem.

Tujuan:

history tidak berubah hanya karena Task kemudian diedit.

---

# 31. Derived Data Rules

## BR-DERIVED-001 — Do Not Store Overdue

Overdue dihitung.

Jangan menyimpan boolean `isOverdue` sebagai source of truth.

---

## BR-DERIVED-002 — Do Not Store Task Progress

Task progress sebaiknya dihitung dari Subtask/status.

Tidak perlu menyimpan progress integer sebagai source of truth.

---

## BR-DERIVED-003 — Do Not Store Project Progress

Project progress dihitung dari Task aktif.

---

# 32. Error & Conflict Behavior

## BR-ERROR-001 — Blocking Error

Contoh blocking:

- title kosong;
- endAt <= startAt;
- complete Project dengan unfinished Task;
- invalid relation ownership.

Action tidak disimpan.

---

## BR-ERROR-002 — Non-Blocking Warning

Contoh warning:

- schedule overlap.

User boleh tetap menyimpan.

---

# 33. Business Rule Test Matrix

Minimum unit/integration coverage:

```text
TASK
✓ default status Todo
✓ default priority Medium
✓ date-only deadline → 23:59
✓ Done no longer overdue
✓ Reopen → Todo

PROGRESS
✓ with subtasks
✓ without subtasks
✓ project excludes deleted task

OVERDUE
✓ overdue before now
✓ deadline future not overdue
✓ Done excluded

SMART TODAY
✓ priority weights
✓ overdue weights
✓ urgent near deadline beats low recent overdue
✓ scheduled today bonus
✓ pinned task prioritized
✓ maximum three
✓ tie-breaker deterministic

PLANNER
✓ overlap warning
✓ exact boundary not overlap
✓ reschedule keeps old block
✓ reschedule does not change deadline

REVIEW
✓ one review per date
✓ Tomorrow pins next day
✓ Reschedule creates Time Block
✓ Keep changes nothing

TRASH
✓ deleted task excluded from active views
✓ restore works
✓ permanent delete cascades owned children

PROJECT
✓ completion blocked if unfinished task
✓ delete project preserves tasks

AREA
✓ delete area preserves projects

RECURRENCE
✓ weekly occurrence generated
✓ occurrence stops after until
```

---

# 34. Rule Priority

Jika dua aturan tampak bertentangan, gunakan prioritas berikut:

```text
1. Data integrity
2. User-explicit action
3. Deadline semantics
4. Scheduling semantics
5. Smart Today recommendation
6. Presentation/UI convenience
```

Contoh:

Smart Today tidak boleh mengubah Deadline hanya untuk memperbaiki ranking.

---

# 35. Post-MVP Rules Not Yet Defined

Belum ditentukan pada MVP:

- recurring Task;
- focus timer;
- productivity analytics;
- notifications;
- reminder escalation;
- PWA offline behavior;
- AI scheduling;
- Google Calendar sync conflict;
- file attachment;
- tags;
- dark mode;
- recurring Event exception per occurrence.

Fitur tersebut harus memiliki Business Rules sendiri sebelum diimplementasikan.

---

# 36. Final Rule Summary

Core behavior MyDay v1.0:

```text
Task menentukan pekerjaan.
Deadline menentukan batas waktu.
Priority menentukan tingkat kepentingan.
Time Block menentukan rencana waktu.
Event menentukan jadwal.
Project mengelompokkan hasil kerja.
Smart Today menentukan fokus.
Daily Review menutup hari.
```

Smart Today hanya memberikan rekomendasi.

User tetap memegang keputusan akhir terhadap:

- apa yang diprioritaskan;
- kapan Task dikerjakan;
- apakah Task selesai;
- apakah Time Block dijadwalkan ulang.

---

# 37. Document Dependency

Dokumen ini menjadi acuan untuk menyelaraskan:

```text
PRD.md
USER-FLOW.md
DATABASE.md
DESIGN-SYSTEM.md
WIREFRAME-UI.md
TECHNICAL-SPEC.md
IMPLEMENTATION-PLAN.md
```

Setelah Business Rules v1.0 disetujui, label `provisional` pada dokumen lain dapat dianggap resolved sesuai aturan di dokumen ini.

---

**Document Status:** Ready for Cross-Document Alignment  
**Next Recommended Step:** Sinkronisasi `DATABASE.md`, `USER-FLOW.md`, dan `TECHNICAL-SPEC.md` terhadap Business Rules v1.0 sebelum Development Phase 0.
