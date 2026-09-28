# MyDay — Product Requirements Document (PRD)

**Product Name:** MyDay  
**Working Title:** MyDay — Personal Daily Planner & Task Manager  
**Document:** Product Requirements Document  
**Version:** 1.0  
**Status:** Approved for MVP Planning  
**Product Type:** Personal productivity web application  
**Primary User:** Dimas  
**Platform:** Responsive Web — Desktop & Mobile  

---

# 1. Product Overview

MyDay adalah aplikasi web personal untuk membantu pengguna mengatur aktivitas harian, tugas, deadline, project, event, dan waktu pengerjaan dalam satu sistem yang terhubung.

Aplikasi ini tidak dirancang sebagai sekadar to-do list. MyDay harus berfungsi sebagai **personal productivity dashboard** yang membantu pengguna menjawab tiga pertanyaan utama:

1. Apa yang harus saya kerjakan hari ini?
2. Kapan saya akan mengerjakannya?
3. Mana yang harus saya prioritaskan?

MyDay menghubungkan konsep:

**Task → Deadline → Priority → Project → Daily Schedule → Progress**

Aplikasi ini hanya digunakan oleh satu pengguna dan tidak dirancang sebagai SaaS, team workspace, atau platform kolaboratif.

---

# 2. Background

Aktivitas pengguna tersebar pada banyak konteks, seperti:

- tugas kuliah;
- deadline akademik;
- jadwal kuliah;
- kegiatan organisasi;
- project coding;
- kegiatan pribadi;
- aktivitas rutin;
- perencanaan harian.

Masalah utama bukan hanya banyaknya aktivitas, tetapi kesulitan menentukan:

- apa yang harus dikerjakan terlebih dahulu;
- kapan waktu pengerjaan dialokasikan;
- deadline mana yang paling mendesak;
- task apa yang belum selesai;
- bagaimana progress project berjalan;
- bagaimana aktivitas hari ini terhubung dengan task dan project yang lebih besar.

MyDay dibuat untuk menyatukan seluruh kebutuhan tersebut dalam satu workflow yang jelas.

---

# 3. Product Vision

MyDay harus menjadi aplikasi yang dapat digunakan setiap hari sebagai pusat pengelolaan aktivitas pribadi.

Aplikasi harus membantu pengguna bergerak dari:

> “Saya punya banyak hal yang harus dikerjakan.”

menjadi:

> “Saya tahu apa yang paling penting hari ini, kapan mengerjakannya, dan apa yang harus saya lakukan selanjutnya.”

Keberhasilan utama MyDay tidak diukur dari banyaknya fitur, tetapi dari seberapa efektif aplikasi membantu pengguna:

- memahami prioritas;
- merencanakan hari;
- mengurangi task yang terlambat;
- menyelesaikan pekerjaan tepat waktu;
- melihat progress secara jelas.

---

# 4. Product Goals

## 4.1 Primary Goals

MyDay harus:

1. Menampilkan aktivitas paling penting hari ini.
2. Membantu pengguna menentukan prioritas task.
3. Memisahkan task dari jadwal pengerjaan.
4. Menghubungkan task dengan project.
5. Memvisualisasikan jadwal melalui planner dan calendar.
6. Memungkinkan perencanaan harian menggunakan time blocking.
7. Membantu pengguna melakukan review terhadap aktivitas harian.
8. Tetap cepat dan nyaman digunakan dari desktop maupun mobile.

## 4.2 Secondary Goals

Setelah MVP stabil, MyDay dapat dikembangkan menjadi personal productivity system yang mendukung:

- recurring task;
- focus session;
- statistik produktivitas;
- notification;
- PWA;
- AI scheduling;
- external calendar integration.

---

# 5. Non-Goals

Pada MVP, MyDay tidak bertujuan untuk menjadi:

- aplikasi kolaborasi;
- team workspace;
- project management untuk organisasi;
- social productivity platform;
- aplikasi publik dengan registrasi bebas;
- SaaS multi-user;
- calendar replacement penuh;
- AI-first productivity app.

Fitur berikut tidak menjadi bagian dari MVP:

- recurring task;
- focus timer;
- productivity analytics;
- notification/reminder;
- PWA;
- AI scheduling;
- Google Calendar integration;
- file attachment;
- tagging;
- dark mode;
- public registration;
- team collaboration.

---

# 6. Target User

## 6.1 Primary User

MyDay memiliki satu pengguna utama:

**Dimas**

Karakteristik penggunaan:

- mahasiswa;
- memiliki tugas kuliah dan deadline;
- memiliki project coding;
- mengikuti kegiatan organisasi;
- memiliki jadwal rutin;
- sering menggunakan laptop untuk planning;
- sering menggunakan HP untuk melihat jadwal dan menambahkan task cepat.

## 6.2 Usage Context

### Desktop

Desktop digunakan terutama untuk:

- planning;
- melihat calendar;
- mengelola project;
- membuat dan mengedit task;
- menyusun time block;
- melakukan daily review.

### Mobile

Mobile digunakan terutama untuk:

- melihat Today;
- melihat Next Activity;
- menambahkan task cepat;
- menandai task selesai;
- melihat deadline;
- melihat jadwal harian.

---

# 7. Core Product Principles

## 7.1 Clarity Over Decoration

Informasi harus lebih penting daripada dekorasi visual.

UI harus:

- bersih;
- modern;
- minimal;
- cepat dipahami;
- tidak terasa seperti admin dashboard.

## 7.2 Task Is Not Schedule

Task dan schedule harus menjadi konsep berbeda.

### Task

Menjawab:

> Apa yang harus saya selesaikan?

### Time Block

Menjawab:

> Kapan saya akan mengerjakannya?

### Event

Menjawab:

> Aktivitas apa yang terjadi pada waktu tertentu?

Contoh:

**Task**

Laporan Big Data  
Deadline: 30 September 2026, 23:59  
Priority: High  

**Time Block**

29 September 2026  
19:00–21:00  
Kerjakan Laporan Big Data  

**Event**

29 September 2026  
08:00–10:00  
Kuliah Machine Learning  

## 7.3 Single Source of Daily Focus

Halaman Today harus menjadi pusat aktivitas harian.

Pengguna tidak seharusnya membuka banyak halaman untuk mengetahui apa yang harus dilakukan hari ini.

---

# 8. Core Domain Model

Secara konseptual, MyDay memiliki hubungan berikut:

```text
AREA
  ↓
PROJECT
  ↓
TASK ─────── SUBTASK
  │
  └───────── TIME BLOCK

EVENT ────── RECURRENCE

DAILY REVIEW
```

Catatan:

- Ini adalah model domain produk.
- Detail tabel database belum ditentukan pada tahap PRD.
- Implementasi relasi akan ditentukan pada dokumen database design.

---

# 9. Functional Requirements

# 9.1 Personal Authentication

Karena aplikasi dapat di-deploy ke internet, MyDay harus memiliki autentikasi pribadi.

## Requirements

- Sistem hanya memiliki satu akun utama.
- Tidak tersedia public registration.
- Tidak ada role admin/user.
- Tidak ada team account.
- Login menggunakan username dan password.
- Akun utama dapat dibuat melalui seed atau konfigurasi awal.

## Out of Scope

- OAuth;
- login Google;
- magic link;
- multi-user permission;
- role-based access control kompleks.

---

# 9.2 Today Dashboard

Halaman Today merupakan halaman utama MyDay.

Tujuan utamanya adalah menampilkan informasi paling relevan untuk hari berjalan.

## Informasi Utama

Today harus memprioritaskan:

1. Next Activity / Current Activity
2. Today's Schedule
3. Must Do Today

Contoh:

```text
Good Morning, Dimas
Monday, 29 September 2026

NOW
Machine Learning
08:00–10:00
Ends in 42m

TODAY
08:00  Machine Learning
10:30  Tugas ML
13:00  Praktikum
19:00  Laporan Big Data

MUST DO TODAY
1. Laporan Big Data
2. Machine Learning Assignment
3. Review TOEFL
```

## Current Activity

Jika event atau time block sedang berlangsung:

```text
NOW

Machine Learning
08:00–10:00

Ends in 42m
```

## Next Activity

Jika belum ada aktivitas yang sedang berlangsung, tampilkan aktivitas berikutnya.

Sumber Next Activity:

- Event
- Time Block

Contoh:

```text
NEXT

Praktikum
13:00–15:00

Starts in 1h 20m
```

Jika tidak ada aktivitas lagi hari tersebut:

```text
You're clear for the rest of the day.
```

---

# 9.3 Smart Today

Smart Today membantu menentukan task yang paling relevan untuk dikerjakan.

Smart Today tidak menggunakan AI pada MVP.

## Input Prioritas

Ranking mempertimbangkan:

- overdue;
- jarak deadline;
- priority;
- progress;
- scheduled today.

## Requirements

- Maksimum tiga task muncul sebagai Must Do Today.
- Task tanpa deadline tetap dapat masuk jika priority tinggi atau dijadwalkan hari ini.
- Task overdue mendapat bobot prioritas tinggi.
- Overdue bukan faktor absolut.
- Task Urgent dengan deadline sangat dekat dapat memiliki ranking lebih tinggi daripada task Low yang overdue.
- Pengguna dapat menggunakan fitur `Pin to Today`.

## Important

Bobot scoring belum ditentukan di PRD.

Detail scoring akan ditentukan dalam `BUSINESS-RULES.md`.

---

# 9.4 Task Management

Task merupakan unit pekerjaan utama.

## Required Field

- title

## Optional Fields

- description;
- deadline;
- project;
- estimated duration;
- subtasks.

## Automatically Assigned Fields

- created date;
- default priority;
- initial status.

## Priority

Task memiliki empat level:

- Low
- Medium
- High
- Urgent

Default priority:

**Medium**

## Status

Task memiliki tiga status:

- Todo
- In Progress
- Done

Default status:

**Todo**

## Deadline

Task boleh tidak memiliki deadline.

Jika pengguna memilih tanggal tanpa menentukan jam, sistem menggunakan:

**23:59**

## Overdue

Overdue bukan status task.

Task dianggap overdue apabila:

```text
deadline < current time
AND
status != Done
```

Task yang sudah Done tidak dianggap overdue.

## Reopen

Task Done dapat dibuka kembali menggunakan:

`Reopen Task`

## Delete

Task menggunakan soft delete / Trash.

Task yang dihapus tidak langsung hilang secara permanen.

---

# 9.5 Subtasks

Task dapat memiliki subtask/checklist.

Contoh:

```text
Laporan Big Data

✓ Praktikum selesai
✓ Screenshot hasil
○ Tulis pembahasan
○ Kesimpulan
○ Export PDF
○ Upload LMS
```

## Progress

Jika task memiliki subtask:

```text
completed subtasks / total subtasks × 100%
```

Contoh:

```text
3 / 5 subtask selesai
Progress = 60%
```

Jika task tidak memiliki subtask:

```text
Todo        = 0%
In Progress = 0%
Done        = 100%
```

Jika seluruh subtask selesai, task tidak otomatis berubah menjadi Done.

Pengguna tetap harus melakukan `Mark as Done`.

---

# 9.6 Areas

Area merepresentasikan area kehidupan yang berlangsung terus-menerus.

Contoh:

- Kuliah
- Coding
- Organisasi
- Personal

Area bukan project.

## Requirements

Pengguna dapat:

- membuat Area;
- mengedit Area;
- menghapus Area.

Area dapat memiliki beberapa Project.

---

# 9.7 Projects

Project merupakan kumpulan task dengan tujuan tertentu.

Contoh:

```text
Area: Coding

Projects:
- MyDay
- Sungairujing Marketplace
```

## Project Fields

Project minimal dapat memiliki:

- name;
- description;
- icon;
- status;
- start date;
- target date;
- area.

Target date bersifat opsional.

## Task Relationship

- Satu task maksimal berada pada satu Project.
- Task boleh tidak memiliki Project.

## Project Progress

Project progress dihitung berdasarkan jumlah task selesai.

Formula:

```text
completed tasks / total tasks × 100%
```

Contoh:

```text
7 task Done
10 total task

Progress = 70%
```

## Project Completion

Project tidak boleh ditandai selesai apabila masih memiliki task aktif yang belum selesai.

## Project Deletion

Jika Project dihapus:

- Project dihapus;
- task tidak ikut dihapus;
- task menjadi tidak memiliki Project.

---

# 9.8 Daily Planner

Daily Planner digunakan untuk mengatur waktu menggunakan konsep time blocking.

Contoh:

```text
MONDAY

07:00  Bangun & persiapan
08:00  Kuliah
10:00  Machine Learning
12:00  Istirahat
13:00  Praktikum
16:00  Free time
19:00  Laporan Big Data
21:00  Coding
23:00  Tidur
```

## Time Block

Time Block memiliki:

- start time;
- end time;
- date;
- title;
- optional related task.

Start dan end time wajib tersedia.

## Task Relationship

Satu Task dapat memiliki beberapa Time Block.

Contoh:

```text
Task:
Laporan Big Data

Time Block 1:
Monday 19:00–21:00

Time Block 2:
Tuesday 20:00–21:00
```

## Standalone Time Block

Time Block tidak wajib terkait Task.

Contoh:

- istirahat;
- makan;
- perjalanan;
- olahraga;
- tidur.

## Planner Interval

Planner menggunakan interval utama:

**30 menit**

## Conflict

Time Block boleh bertabrakan.

Jika terjadi overlap, MyDay menampilkan warning.

Contoh:

```text
19:00–21:00 Laporan
20:00–22:00 Coding

Warning: Schedule overlap
```

## Time Block Status

Time Block tidak memiliki status Done.

Penyelesaian pekerjaan tetap ditentukan oleh Task.

## Reschedule

Jika Time Block telah selesai tetapi Task terkait belum selesai, ketika pengguna membuka MyDay berikutnya sistem dapat menawarkan:

- Reschedule
- Dismiss

## Desktop

Drag-and-drop merupakan fitur desirable, tetapi bukan blocker MVP.

## Mobile

Planner menggunakan layout timeline vertikal.

---

# 9.9 Events

Event merepresentasikan aktivitas yang terjadi pada waktu tertentu.

Contoh:

```text
Machine Learning
Monday
08:00–10:00
Location: Lab Komputer
```

## Event Fields

Event dapat memiliki:

- title;
- date;
- start time;
- end time;
- location;
- notes;
- recurrence.

Location dan notes bersifat opsional.

## Event Status

Event tidak memiliki status Done.

---

# 9.10 Recurring Events

Recurring Event termasuk dalam MVP.

Use case utama:

- jadwal kuliah;
- kegiatan rutin terjadwal.

Minimal pola recurrence harus mendukung kebutuhan seperti:

```text
Every Monday
08:00–10:00
```

Detail recurrence engine akan dibahas pada Business Rules dan Database Design.

Recurring Task tidak termasuk MVP.

---

# 9.11 Calendar

Calendar merupakan representasi jadwal gabungan.

Calendar menampilkan:

- Event;
- Time Block;
- Task Deadline.

Contoh:

```text
Monday, 29 September

08:00–10:00  Machine Learning       EVENT
19:00–21:00  Laporan Big Data       TIME BLOCK
23:59        Submit Assignment       DEADLINE
```

## Views

Calendar harus mendukung:

- Monthly;
- Weekly;
- Daily / Agenda.

## Default Desktop View

**Weekly**

## Default Mobile View

**Day / Agenda**

## Task Deadline

Task Deadline tampil pada jam deadline.

---

# 9.12 Quick Add

Quick Add harus tersedia dari hampir seluruh halaman utama.

Tujuannya adalah meminimalkan friction saat menambahkan task.

## Fields

```text
Task title *
Deadline
Priority
Project

[ Add Task ]
```

Hanya title yang wajib.

Field lainnya opsional.

## Shortcut

Shortcut seperti:

`N → New Task`

dapat ditambahkan apabila implementasinya sederhana.

---

# 9.13 Search

MVP harus menyediakan pencarian Task.

Search minimal harus dapat menemukan Task berdasarkan title.

Pencarian description dapat ditambahkan jika implementasinya sederhana.

---

# 9.14 Filters

Tasks page minimal memiliki filter:

- Status;
- Priority;
- Project;
- Area;
- Deadline.

Filter dapat digunakan bersamaan apabila memungkinkan.

---

# 9.15 Sorting

Tasks page minimal mendukung sorting:

- Deadline;
- Priority;
- Created Date;
- Smart Priority.

Smart Priority menggunakan mekanisme scoring yang sama atau sejalan dengan Smart Today.

---

# 9.16 Daily Review

Daily Review digunakan untuk mengevaluasi aktivitas di akhir hari.

Daily Review termasuk MVP.

## Trigger

Review tidak muncul secara paksa.

Pengguna membukanya melalui:

`Review Today`

## Information

Review dapat menampilkan:

- jumlah task selesai;
- jumlah task belum selesai;
- aktivitas yang direncanakan;
- unfinished task.

Contoh:

```text
REVIEW TODAY
Monday, 29 September

Completed
5 / 7 tasks

Unfinished

Laporan Big Data
[ Tomorrow ] [ Reschedule ] [ Keep ]

Machine Learning Assignment
[ Tomorrow ] [ Reschedule ] [ Keep ]
```

## Unfinished Task Actions

Task yang belum selesai dapat diberikan pilihan:

- Tomorrow
- Reschedule
- Keep

## Reflection

Pengguna dapat menulis catatan/refleksi singkat.

Contoh:

```text
Hari ini terlalu banyak waktu habis untuk laporan.
```

Reflection bersifat opsional.

## History

Riwayat Daily Review disimpan.

Data ini nantinya dapat digunakan untuk:

- analytics;
- personal insights;
- AI scheduling.

## Day Boundary

Pergantian hari mengikuti waktu kalender normal:

**00:00**

---

# 10. Navigation

Konsep desktop navigation:

```text
MYDAY

⌂ Today
✓ Tasks
▣ Calendar
◉ Projects

────────────

AREAS / PROJECTS

🎓 Kuliah
💻 Coding
👥 Organisasi
👤 Personal

────────────

⚙ Settings
```

Focus tidak termasuk navigasi utama MVP karena Focus Mode belum masuk scope.

Navigasi harus sederhana dan tidak terasa seperti dashboard enterprise.

---

# 11. UX Requirements

## 11.1 General

UI harus:

- modern;
- minimal;
- clean;
- premium;
- productivity-oriented;
- responsive;
- cepat dipahami.

## 11.2 Visual Priorities

Prioritas desain:

**clarity > decoration**

Hindari penggunaan berlebihan terhadap:

- card;
- gradient;
- icon;
- warna;
- animation;
- visual decoration tanpa fungsi.

## 11.3 Information Hierarchy

Informasi paling penting harus memiliki hierarchy paling kuat.

Pada Today, contohnya:

1. Now / Next
2. Today Schedule
3. Must Do Today

## 11.4 Mobile First Actions

Di mobile, aksi yang paling mudah dijangkau harus mencakup:

- Quick Add;
- Complete Task;
- View Today;
- View Schedule;
- View Deadline.

---

# 12. Responsive Requirements

MyDay wajib nyaman digunakan di:

- desktop;
- laptop;
- mobile phone.

## Desktop Priorities

- planning;
- weekly calendar;
- task management;
- project management;
- daily review.

## Mobile Priorities

- Today dashboard;
- task quick add;
- task completion;
- agenda;
- deadline monitoring.

Layout desktop tidak boleh hanya diperkecil menjadi mobile.

Mobile harus memiliki layout yang disesuaikan dengan konteks penggunaan.

---

# 13. MVP Scope

## 13.1 Included in MVP

MVP mencakup:

- Personal Authentication;
- Today Dashboard;
- Smart Today;
- Tasks CRUD;
- Task Priority;
- Task Deadline;
- Task Status;
- Task Estimated Duration;
- Task Reopen;
- Trash / Soft Delete;
- Subtasks;
- Areas;
- Projects;
- Project Progress;
- Daily Planner;
- Time Blocks;
- Schedule Conflict Warning;
- Task Rescheduling;
- Events;
- Recurring Events;
- Calendar;
- Quick Add;
- Daily Review;
- Daily Review History;
- Search;
- Filters;
- Sorting;
- Responsive Desktop;
- Responsive Mobile.

---

# 14. Post-MVP Scope

Fitur berikut ditunda sampai core workflow stabil:

- Recurring Tasks;
- Focus Timer;
- Productivity Analytics;
- Notifications;
- Reminders;
- PWA;
- AI Scheduling;
- Google Calendar Integration;
- File Attachments;
- Tags;
- Dark Mode.

---

# 15. Future AI Direction

AI bukan fondasi MyDay.

AI hanya dapat ditambahkan setelah sistem task, scheduling, dan history stabil.

Potential future capabilities:

```text
"Susunkan jadwal saya hari ini."

"Saya punya waktu kosong 3 jam.
Apa yang sebaiknya saya kerjakan?"

"Tugas mana yang paling mendesak?"

"Atur ulang jadwal karena tugas ini belum selesai."
```

AI harus menggunakan data terstruktur dari MyDay.

AI tidak boleh menjadi requirement untuk workflow dasar aplikasi.

---

# 16. Success Metrics

Karena aplikasi digunakan secara pribadi, keberhasilan tidak diukur dengan metrik SaaS seperti acquisition atau revenue.

Success metrics berfokus pada utility.

## Primary Success Criteria

MyDay dianggap berhasil jika pengguna dapat membuka halaman Today dan dalam beberapa detik mengetahui:

1. aktivitas berikutnya;
2. task paling penting;
3. jadwal hari tersebut.

## Behavioral Indicators

Indikator penggunaan yang dapat digunakan setelah MVP stabil:

- task selesai sebelum deadline;
- jumlah task overdue;
- persentase task selesai;
- penggunaan Daily Planner;
- penggunaan Daily Review;
- frekuensi membuka Today;
- konsistensi menggunakan aplikasi setiap hari.

Metrics ini belum wajib ditampilkan pada MVP.

---

# 17. Product Constraints

## 17.1 Single User

Arsitektur tidak perlu mendukung multi-user.

## 17.2 Simple Authentication

Authentication hanya digunakan untuk melindungi aplikasi personal.

## 17.3 No Premature AI

Tidak ada AI dependency pada core workflow.

## 17.4 No Feature Overload

MVP harus fokus pada:

```text
Today
Tasks
Planner
Calendar
Projects
Review
```

Fitur tambahan tidak boleh menghambat penyelesaian core product.

---

# 18. Assumptions

PRD ini menggunakan asumsi:

1. Pengguna memiliki satu timezone utama.
2. Pengguna hanya memiliki satu akun MyDay.
3. Sebagian besar task bersifat personal.
4. Event dan Time Block memiliki start dan end time.
5. Task deadline memiliki tanggal dan waktu.
6. Tidak semua task harus memiliki deadline.
7. Tidak semua task harus berada dalam Project.
8. Tidak semua Time Block harus terkait Task.
9. Daily Review dilakukan secara manual.
10. Calendar adalah representasi dari beberapa sumber data internal.

---

# 19. Open Decisions for Next Documents

Beberapa detail sengaja tidak diputuskan di PRD.

Detail berikut harus ditentukan pada tahap berikutnya.

## BUSINESS-RULES.md

- Smart Today scoring;
- priority weight;
- overdue weight;
- deadline proximity rules;
- scheduled today weight;
- Pin to Today behavior;
- reschedule behavior;
- Daily Review unfinished actions;
- recurrence rules;
- project completion rules;
- trash behavior.

## USER-FLOW.md

- login flow;
- Today flow;
- create task;
- complete task;
- reschedule task;
- create project;
- create time block;
- create recurring event;
- daily review;
- trash/restore.

## DATABASE.md

- data model;
- table structure;
- relationships;
- recurrence representation;
- soft delete;
- daily review storage;
- ordering;
- indexes.

## DESIGN-SYSTEM.md

- typography;
- color;
- spacing;
- layout;
- component rules;
- responsive behavior.

## TECHNICAL-SPEC.md

- Next.js architecture;
- Prisma;
- PostgreSQL;
- auth implementation;
- validation;
- server actions;
- API boundaries;
- security.

---

# 20. Development Sequence

Development tidak dimulai sebelum dokumen inti diselesaikan.

Urutan:

```text
Requirement Discovery
        ↓
PRD
        ↓
Business Rules
        ↓
User Flow
        ↓
Database Design
        ↓
Design System
        ↓
Wireframe / UI
        ↓
Technical Specification
        ↓
Implementation Plan
        ↓
Development
        ↓
Testing
        ↓
Deployment
```

Setiap tahap diperiksa sebelum melanjutkan ke tahap berikutnya.

---

# 21. MVP Acceptance Criteria

MVP dianggap memenuhi Product Requirement apabila:

1. Pengguna dapat login ke aplikasi personal.
2. Pengguna dapat membuat, mengedit, menyelesaikan, membuka kembali, dan menghapus Task.
3. Task dapat memiliki deadline, priority, estimated duration, Project, dan Subtask.
4. Progress Task dapat dihitung dari Subtask.
5. Pengguna dapat membuat Area dan Project.
6. Project memiliki progress berdasarkan Task.
7. Pengguna dapat membuat Time Block.
8. Task dapat memiliki beberapa Time Block.
9. Time Block dapat dibuat tanpa Task.
10. Conflict Time Block menghasilkan warning.
11. Pengguna dapat membuat Event.
12. Event dapat memiliki recurrence.
13. Calendar menampilkan Event, Time Block, dan Deadline.
14. Today menampilkan Current/Next Activity.
15. Today menampilkan Schedule hari berjalan.
16. Today menampilkan maksimal tiga Must Do Today.
17. Smart Today menggunakan deterministic scoring.
18. Pengguna dapat Pin Task ke Today.
19. Pengguna dapat melakukan Quick Add.
20. Pengguna dapat Search, Filter, dan Sort Task.
21. Pengguna dapat melakukan Daily Review.
22. Unfinished Task dapat dipindahkan atau dijadwalkan ulang.
23. Daily Review history tersimpan.
24. Aplikasi dapat digunakan dengan nyaman di desktop.
25. Aplikasi dapat digunakan dengan nyaman di mobile.
26. Core workflow tidak bergantung pada AI.

---

# 22. Final Product Statement

**MyDay adalah personal daily planner dan task manager yang membantu pengguna memahami apa yang harus dikerjakan, kapan harus mengerjakannya, dan mana yang paling penting melalui kombinasi task management, time blocking, calendar, project tracking, dan smart daily prioritization.**

Fokus utama produk adalah:

> **Know what matters. Plan when to do it. Finish it on time.**

---

**Document Status:** Ready for Business Rules Definition  
**Next Document:** `BUSINESS-RULES.md`
