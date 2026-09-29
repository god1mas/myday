import { z } from "zod";
export const timeBlockInputSchema = z.object({
  title: z.string().trim().min(1, "Judul jadwal wajib diisi.").max(240),
  taskId: z.string().trim().max(36).transform((v) => v || null),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Waktu mulai wajib diisi."),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Waktu selesai wajib diisi."),
}).refine((v) => v.endTime > v.startTime, { path: ["endTime"], message: "Waktu selesai harus setelah waktu mulai." });
export type TimeBlockInput = z.infer<typeof timeBlockInputSchema>;
