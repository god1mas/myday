# MyDay — Cross-Document Alignment Notes

**Alignment Version:** 1.1  
**Source of Truth:** `BUSINESS-RULES.md` v1.0

Dokumen yang diselaraskan:

- `USER-FLOW.md` → v1.1
- `DATABASE.md` → v1.1
- `TECHNICAL-SPEC.md` → v1.1
- `IMPLEMENTATION-PLAN.md` → v1.1

Perubahan utama:

1. Reopen Task selalu kembali ke `Todo`.
2. Task dengan Subtask tetap menggunakan checklist-derived progress; Task tanpa Subtask menjadi 100% saat Done.
3. Delete Area dan Project menggunakan soft delete dan tidak menghapus turunannya.
4. Reschedule mempertahankan Time Block lama, menandainya `RESCHEDULED`, lalu membuat block baru.
5. Recurring Event pada MVP hanya mendukung edit/delete seluruh series.
6. Daily Review `Tomorrow` mengubah `pinnedDate` ke hari berikutnya tanpa mengubah deadline.
7. Daily Review `Reschedule` membuat Time Block baru dan tidak mengubah deadline.
8. Trash menyembunyikan Task dan linked Time Block dari active views; permanent delete menghapus Subtask dan linked Time Block.
9. Smart Today menggunakan scoring deterministic v1.0 yang sama di User Flow, Technical Spec, dan Implementation Plan.
10. Business Rules sekarang menjadi acuan final untuk seluruh perilaku MVP.

Tidak ada perubahan pada tujuan produk atau MVP scope.
