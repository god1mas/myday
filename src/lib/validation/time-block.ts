import { z } from "zod";
import { requiredDate, requiredTime } from "./date-time";
export const timeBlockInputSchema = z.object({
  title: z.string().trim().min(1, "Judul jadwal wajib diisi.").max(240),
  taskId: z.string().trim().max(36).transform((v) => v || null),
  date: requiredDate,
  startTime: requiredTime,
  endTime: requiredTime,
}).refine((v) => v.endTime > v.startTime, { path: ["endTime"], message: "Waktu selesai harus setelah waktu mulai." });
export type TimeBlockInput = z.infer<typeof timeBlockInputSchema>;
