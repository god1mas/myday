import { z } from "zod";

const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "Judul acara wajib diisi.").max(240),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Waktu mulai wajib diisi."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Waktu selesai wajib diisi."),
  location: z.string().trim().max(240).transform((value) => value || null),
  notes: z.string().trim().transform((value) => value || null),
  recurring: z.boolean(),
  interval: z.coerce.number().int().min(1, "Interval minimal satu minggu."),
  daysOfWeek: z.array(z.enum(weekdays)),
  until: z.string().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Tanggal akhir pengulangan tidak valid."),
}).superRefine((value, context) => {
  if (value.endTime <= value.startTime) context.addIssue({ code: "custom", path: ["endTime"], message: "Waktu selesai harus setelah waktu mulai." });
  if (value.recurring && value.daysOfWeek.length === 0) context.addIssue({ code: "custom", path: ["daysOfWeek"], message: "Pilih minimal satu hari untuk acara mingguan." });
  if (value.recurring && value.until && value.until < value.date) context.addIssue({ code: "custom", path: ["until"], message: "Tanggal akhir tidak boleh sebelum tanggal mulai." });
});

export type EventInput = z.infer<typeof eventInputSchema>;
export const eventWeekdays = weekdays;
