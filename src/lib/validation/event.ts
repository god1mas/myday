import { z } from "zod";
import { optionalDate, requiredDate, requiredTime } from "./date-time";

const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "Judul acara wajib diisi.").max(240),
  date: requiredDate,
  startTime: requiredTime,
  endTime: requiredTime,
  location: z.string().trim().max(240).transform((value) => value || null),
  notes: z.string().trim().transform((value) => value || null),
  recurring: z.boolean(),
  interval: z.coerce.number().int().min(1, "Interval minimal satu minggu."),
  daysOfWeek: z.array(z.enum(weekdays)),
  until: optionalDate,
}).superRefine((value, context) => {
  if (value.endTime <= value.startTime) context.addIssue({ code: "custom", path: ["endTime"], message: "Waktu selesai harus setelah waktu mulai." });
  if (value.recurring && value.daysOfWeek.length === 0) context.addIssue({ code: "custom", path: ["daysOfWeek"], message: "Pilih minimal satu hari untuk acara mingguan." });
  if (value.recurring && value.until && value.until < value.date) context.addIssue({ code: "custom", path: ["until"], message: "Tanggal akhir tidak boleh sebelum tanggal mulai." });
});

export type EventInput = z.infer<typeof eventInputSchema>;
export const eventWeekdays = weekdays;
