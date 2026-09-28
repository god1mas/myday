# MyDay — Wireframe / UI Specification

**Version:** 1.0  
**Status:** Low-Fidelity Wireframe  
**Scope:** MVP

---

# 1. Desktop App Shell

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ MYDAY             │                                                         │
│                   │  Page Content                                           │
│ Today             │                                                         │
│ Tasks             │                                                         │
│ Calendar          │                                                         │
│ Projects          │                                                         │
│                   │                                                         │
│ AREAS             │                                                         │
│ Kuliah            │                                                         │
│ Coding            │                                                         │
│ Organisasi        │                                                         │
│ Personal          │                                                         │
│                   │                                                         │
│ Settings          │                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

Sidebar desktop sekitar 220–240px.

---

# 2. Today — Desktop

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Monday, 29 September 2026                              + Quick Add   │
│ Good morning, Dimas                                                │
│                                                                     │
│ NOW                                                                 │
│ Machine Learning                                                    │
│ 08:00–10:00                                      Ends in 42m        │
│                                                                     │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                     │
│ TODAY'S SCHEDULE                    MUST DO TODAY                    │
│                                                                     │
│ 08:00  Machine Learning             01 Laporan Big Data             │
│ 10:30  Kerjakan Tugas ML               Due tomorrow · High         │
│ 13:00  Praktikum                    02 Machine Learning Assignment   │
│ 19:00  Laporan Big Data                Due in 2 days · Urgent       │
│                                      03 Review TOEFL                 │
│                                                                     │
│ ─────────────────────────────────────────────────────────────────── │
│                                              [ Review Today ]       │
└─────────────────────────────────────────────────────────────────────┘
```

Tidak perlu banyak card. Gunakan section dan whitespace.

---

# 3. Today — Mobile

```text
┌───────────────────────┐
│ Mon, 29 Sep           │
│ Good morning, Dimas   │
│                       │
│ NOW                   │
│ Machine Learning      │
│ 08:00–10:00           │
│ Ends in 42m           │
│                       │
│ MUST DO               │
│ 1 Laporan Big Data    │
│ 2 ML Assignment       │
│ 3 Review TOEFL        │
│                       │
│ TODAY                 │
│ 08:00 Machine Learning│
│ 10:30 Tugas ML        │
│ 13:00 Praktikum       │
│ 19:00 Laporan         │
│                       │
│ [ Review Today ]      │
│                       │
│ Today Tasks Cal Proj  │
└───────────────────────┘
```

Quick Add dapat menjadi floating button kecil atau action di header.

---

# 4. Tasks — Desktop

```text
┌────────────────────────────────────────────────────────────────────┐
│ Tasks                                             [ + New Task ]   │
│                                                                    │
│ Search tasks...                                                    │
│                                                                    │
│ Status ▾  Priority ▾  Project ▾  Area ▾  Deadline ▾   Sort ▾      │
│                                                                    │
│ TODO                                                               │
│ ○ Laporan Big Data                      Big Data · Tomorrow · High │
│ ○ Review TOEFL                          TOEFL · 30 Sep · Medium    │
│                                                                    │
│ IN PROGRESS                                                        │
│ ◐ MyDay Database Design                  MyDay · Today · High      │
│                                                                    │
│ DONE                                                               │
│ ✓ Setup project repo                    MyDay · Done              │
└────────────────────────────────────────────────────────────────────┘
```

---

# 5. Task Detail

```text
┌──────────────────────────────────────────────────────────┐
│ ← Tasks                                                  │
│                                                          │
│ Laporan Big Data                           [ ... ]        │
│ In Progress · High                                      │
│                                                          │
│ Deadline        30 Sep, 23:59                           │
│ Project         Big Data                                │
│ Estimate        3h                                      │
│ Progress        60%                                     │
│                                                          │
│ Description                                              │
│ ...                                                      │
│                                                          │
│ SUBTASKS                                                 │
│ ✓ Praktikum selesai                                     │
│ ✓ Screenshot hasil                                      │
│ ○ Tulis pembahasan                                      │
│ ○ Kesimpulan                                            │
│                                                          │
│ SCHEDULE                                                 │
│ 29 Sep · 19:00–21:00                                   │
│ 30 Sep · 20:00–21:00                                   │
│                                                          │
│ [ Schedule ]  [ Mark as Done ]                          │
└──────────────────────────────────────────────────────────┘
```

---

# 6. Quick Add

Desktop popover / mobile bottom sheet:

```text
┌─────────────────────────────┐
│ Quick Add                   │
│                             │
│ Task title *                │
│ [_______________________]   │
│                             │
│ Deadline                    │
│ [ Tomorrow 23:59       ]    │
│                             │
│ Priority                    │
│ [ Medium               ]    │
│                             │
│ Project                     │
│ [ Select project       ]    │
│                             │
│             [ Add Task ]    │
└─────────────────────────────┘
```

---

# 7. Calendar — Desktop Week

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Calendar                  Month | Week | Day              Sep 28–Oct 4 │
│                                                                        │
│       Mon        Tue        Wed        Thu        Fri                  │
│ 08:00 [ML]                                                          │
│ 09:00 [  ]                                                          │
│ 10:00      [DS]                                                     │
│ 11:00                                                               │
│ 12:00                                                               │
│ 13:00 [Praktikum]                                                   │
│ 14:00                                                               │
│ 15:00                                                               │
│ 16:00                                                               │
│ 17:00                                                               │
│ 18:00                                                               │
│ 19:00 [Laporan Big Data]                                            │
│ 20:00 [               ]                                             │
│ 21:00                                                               │
│ 22:00                                                               │
│ 23:00                                             • Deadline 23:59   │
└────────────────────────────────────────────────────────────────────────┘
```

Legend tidak perlu selalu tampil jika visual type sudah cukup jelas.

---

# 8. Calendar — Mobile Agenda

```text
┌──────────────────────┐
│ Monday, 29 Sep       │
│                      │
│ 08:00                │
│ Machine Learning     │
│ Event                │
│                      │
│ 10:30                │
│ Tugas ML             │
│ Time Block           │
│                      │
│ 13:00                │
│ Praktikum            │
│ Event                │
│                      │
│ 19:00                │
│ Laporan Big Data     │
│ Time Block           │
│                      │
│ 23:59                │
│ Submit Assignment    │
│ Deadline             │
└──────────────────────┘
```

---

# 9. Planner

```text
┌────────────────────────────────────────┐
│ Monday, 29 September                   │
│                                        │
│ 07:00                                  │
│ 07:30                                  │
│ 08:00 ┌──────────────────────────────┐ │
│       │ Machine Learning             │ │
│ 09:00 │ 08:00–10:00                 │ │
│       └──────────────────────────────┘ │
│ 10:00                                  │
│ 10:30 ┌──────────────────────────────┐ │
│       │ Tugas ML                    │ │
│ 12:00 └──────────────────────────────┘ │
│ ...                                    │
│ 19:00 ┌──────────────────────────────┐ │
│       │ Laporan Big Data             │ │
│ 21:00 └──────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

# 10. Projects

```text
┌──────────────────────────────────────────────────────────┐
│ Projects                                  [ + Project ]  │
│                                                          │
│ MyDay                                                    │
│ █████████████░░░ 72%                                    │
│ 8 / 11 tasks done                                       │
│                                                          │
│ Sungairujing Marketplace                                 │
│ ███████████░░░░░ 64%                                    │
│ 16 / 25 tasks done                                      │
└──────────────────────────────────────────────────────────┘
```

---

# 11. Project Detail

```text
┌──────────────────────────────────────────────────────────┐
│ ← Projects                                               │
│                                                          │
│ MyDay                                                    │
│ Personal Daily Planner                                   │
│                                                          │
│ Progress                                                 │
│ █████████████░░░ 72%                                    │
│                                                          │
│ IN PROGRESS                                              │
│ ◐ Database Design                                       │
│ ◐ User Flow                                             │
│                                                          │
│ TODO                                                     │
│ ○ Technical Spec                                        │
│ ○ Implementation Plan                                   │
│                                                          │
│ DONE                                                     │
│ ✓ PRD                                                   │
└──────────────────────────────────────────────────────────┘
```

---

# 12. Daily Review

```text
┌──────────────────────────────────────────────────────────┐
│ Review Today                                             │
│ Monday, 29 September                                     │
│                                                          │
│ Completed                                                │
│ 5 / 7 tasks                                              │
│                                                          │
│ Unfinished                                               │
│                                                          │
│ Laporan Big Data                                         │
│ [ Tomorrow ] [ Reschedule ] [ Keep ]                    │
│                                                          │
│ Review TOEFL                                             │
│ [ Tomorrow ] [ Reschedule ] [ Keep ]                    │
│                                                          │
│ Reflection                                               │
│ [ Hari ini terlalu banyak waktu habis...              ] │
│                                                          │
│                                      [ Finish Review ]   │
└──────────────────────────────────────────────────────────┘
```

---

# 13. Trash

```text
┌──────────────────────────────────────────────────┐
│ Trash                                            │
│                                                  │
│ Laporan Lama                         [ Restore ] │
│ Old Task                            [ Restore ]  │
│                                                  │
│                  [ Empty Trash ]                 │
└──────────────────────────────────────────────────┘
```

Permanent delete harus confirmation.

---

# 14. Suggested Desktop Routes

```text
/today
/tasks
/tasks/[id]
/calendar
/projects
/projects/[id]
/areas
/reviews
/settings
/trash
```

---

# 15. Suggested Mobile Navigation

Bottom navigation:

```text
Today
Tasks
Calendar
Projects
```

Secondary pages melalui header/menu:

```text
Areas
Daily Review History
Trash
Settings
```

---

# 16. UI Acceptance

Wireframe siap naik ke high-fidelity bila:

- Today hierarchy terasa jelas;
- Task list tidak padat berlebihan;
- Quick Add dapat dilakukan cepat;
- Calendar desktop readable;
- agenda mobile nyaman;
- Daily Review hanya memerlukan keputusan penting;
- tidak ada halaman yang bergantung pada dekorasi untuk dipahami.
