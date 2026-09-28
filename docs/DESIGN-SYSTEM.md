# MyDay — Design System

**Version:** 1.0  
**Status:** MVP Design Direction  
**Product:** MyDay  
**Principle:** Clarity > Decoration

---

# 1. Design Philosophy

MyDay harus terasa seperti aplikasi produktivitas personal modern, bukan admin dashboard.

Karakter visual:

- calm;
- minimal;
- focused;
- premium;
- fast;
- readable;
- low-friction.

Hindari:

- terlalu banyak card;
- gradient berlebihan;
- shadow berat;
- terlalu banyak warna status;
- decorative icons tanpa fungsi;
- animasi yang tidak membantu.

---

# 2. Visual Hierarchy

Urutan prioritas:

1. Current / Next Activity
2. Must Do Today
3. Today's Schedule
4. Deadline information
5. Project context
6. Metadata

Gunakan hierarchy melalui:

- size;
- weight;
- whitespace;
- alignment;
- contrast.

Bukan melalui terlalu banyak warna.

---

# 3. Layout System

## Desktop

Recommended shell:

```text
┌────────────┬───────────────────────────────┐
│ Sidebar    │ Main Content                  │
│ 240px      │                               │
│            │ max-width ~ 1200-1360px       │
└────────────┴───────────────────────────────┘
```

## Mobile

```text
┌──────────────────────┐
│ Header               │
│ Main Content         │
│                      │
│                      │
│ Bottom Navigation    │
└──────────────────────┘
```

Recommended bottom nav:

```text
Today
Tasks
Calendar
Projects
```

Quick Add menggunakan floating / persistent action yang tidak mengganggu.

---

# 4. Spacing

Gunakan 4px base grid.

Recommended scale:

```text
4
8
12
16
20
24
32
40
48
64
```

Default content spacing:

- compact metadata: 4–8px;
- related controls: 8–12px;
- component padding: 12–16px;
- section gap: 24–32px;
- page section gap: 32–48px.

---

# 5. Typography

Gunakan maksimal satu primary UI family + system fallback.

Recommended:

```text
Inter
Geist
system-ui
```

Suggested scale:

```text
12px  Caption
14px  Secondary
16px  Body
18px  Emphasis
20px  Section Title
24px  Page Title
32px  Hero/Today Context
```

Font weight:

```text
400 Regular
500 Medium
600 Semibold
700 Bold — limited
```

Jangan gunakan uppercase berlebihan.

---

# 6. Color System

MVP menggunakan light mode.

Base semantic tokens:

```text
background
surface
surface-muted
text-primary
text-secondary
text-muted
border
accent
danger
warning
success
```

Design recommendation:

- background hampir putih;
- surface sedikit berbeda dari background;
- text utama hampir hitam;
- accent hanya satu warna utama;
- status color digunakan hemat.

Priority tidak harus selalu penuh warna.

Contoh:

```text
Urgent → subtle danger indicator
High   → stronger neutral/accent indicator
Medium → neutral
Low    → muted
```

---

# 7. Border & Radius

Recommended:

```text
Border: 1px subtle neutral
Radius:
6px  compact control
8px  input/button
10-12px larger surface
```

Jangan membuat semua elemen menjadi rounded card.

---

# 8. Shadows

Gunakan sangat terbatas.

Default:

```text
none
```

Gunakan shadow ringan hanya untuk:

- popover;
- modal;
- elevated quick add;
- dropdown.

---

# 9. Buttons

Variants:

```text
Primary
Secondary
Ghost
Danger
```

Primary hanya untuk aksi utama.

Examples:

```text
Add Task
Save
Finish Review
```

Ghost:

```text
Edit
Dismiss
Cancel
```

Danger:

```text
Delete Permanently
```

---

# 10. Inputs

Input harus:

- jelas;
- compact;
- memiliki label;
- memiliki error inline;
- usable via keyboard.

Required field hanya title pada Quick Add.

---

# 11. Cards

Card bukan default layout.

Gunakan card hanya jika content memang perlu grouping kuat.

Today lebih baik menggunakan section + divider daripada banyak floating cards.

---

# 12. Task Row

Suggested anatomy:

```text
○  Task Title
   Project · Deadline · Priority
```

Optional right side:

```text
60%
⋯
```

Completed:

```text
✓ Task Title
```

Gunakan strike-through dengan hati-hati agar masih readable.

---

# 13. Priority Indicator

Jangan gunakan empat warna besar.

Recommended:

```text
Urgent → small alert mark
High   → strong dot/label
Medium → plain label
Low    → muted label
```

---

# 14. Status Indicator

Suggested:

```text
Todo        ○
In Progress ◐
Done        ✓
```

Icon harus mendukung, bukan menggantikan label pada tempat penting.

---

# 15. Today Components

## Current Activity

Visual paling kuat di halaman.

```text
NOW
Machine Learning
08:00–10:00
Ends in 42m
```

## Must Do

Maximum 3 items.

Gunakan ranking 01, 02, 03 atau simple list.

## Schedule

Timeline sederhana:

```text
08:00  Machine Learning
10:30  Tugas ML
13:00  Praktikum
```

---

# 16. Calendar Design

Desktop:

- Week view utama;
- jam vertikal;
- event dan time block dibedakan secara halus;
- deadline tampil sebagai marker pada jam deadline.

Mobile:

- agenda/day list;
- hindari grid sempit.

---

# 17. Planner Design

Timeline 30 menit.

Time block:

```text
19:00
┌─────────────────────┐
│ Laporan Big Data    │
│ 19:00–21:00         │
└─────────────────────┘
21:00
```

Overlapping item mendapat warning visual subtle.

---

# 18. Project Design

Project page:

```text
Project Name
Description

Progress 72%

IN PROGRESS
...

TODO
...

DONE
...
```

Tidak perlu Kanban pada MVP kecuali benar-benar membantu.

---

# 19. Daily Review Design

Harus terasa tenang, bukan dashboard analytics.

Flow:

```text
Review Today
Completed
Unfinished
Reflection
Finish Review
```

Fokus pada keputusan, bukan statistik.

---

# 20. Empty States

Empty state singkat dan actionable.

Bad:

```text
There is currently no data available.
```

Better:

```text
No tasks today.
Add a task when something comes up.
```

---

# 21. Responsive Behavior

Desktop:
- sidebar persistent;
- content lebih lebar;
- weekly calendar;
- multi-column jika berguna.

Mobile:
- bottom navigation;
- single-column;
- compact headers;
- agenda view;
- sticky quick add bila perlu.

---

# 22. Accessibility

Minimal target:

- keyboard navigation;
- visible focus state;
- semantic HTML;
- text contrast layak;
- input labels;
- button target mobile >= 44px;
- jangan mengandalkan warna saja untuk status.

---

# 23. Motion

Motion optional dan minimal.

Gunakan untuk:

- open/close;
- task completion;
- modal transition.

Durasi pendek:

```text
150–220ms
```

Tidak ada decorative looping animation.

---

# 24. Component Inventory

MVP components:

```text
AppShell
Sidebar
MobileBottomNav
TopBar
PageHeader
SectionHeader

Button
IconButton
Input
Textarea
Select
DatePicker
TimePicker
Checkbox
Dropdown
Popover
Modal
Toast

TaskRow
TaskStatusControl
PriorityBadge
ProgressBar
SubtaskItem

NowNextCard
ScheduleTimeline
SmartTodayList

ProjectRow
ProjectProgress

CalendarWeek
CalendarAgenda
CalendarItem

TimeBlock
EventItem
DeadlineItem

QuickAdd
DailyReviewPanel
EmptyState
ConfirmDialog
```

---

# 25. Design Acceptance Criteria

Design system dianggap berhasil jika:

1. Today dapat dipahami dalam beberapa detik;
2. mobile tidak terasa seperti desktop yang diperkecil;
3. Quick Add mudah dijangkau;
4. hierarchy jelas tanpa banyak warna;
5. calendar readable;
6. task metadata tidak membuat row penuh sesak;
7. dark mode tidak dibutuhkan untuk MVP;
8. design konsisten dengan prinsip clarity > decoration.
