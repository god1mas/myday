import { TaskPriority, TaskStatus } from "@/generated/prisma/enums";
import { z } from "zod";
import { optionalDate, optionalTime } from "./date-time";

const optionalText = (max: number) => z.string().trim().max(max).transform((v) => v || null);
export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Judul tugas wajib diisi.").max(240),
  description: optionalText(5000), projectId: optionalText(36),
  deadlineDate: optionalDate,
  deadlineTime: optionalTime,
  priority: z.enum(TaskPriority).default("MEDIUM"),
  estimatedMinutes: z.string().trim().transform((v) => v ? Number(v) : null).refine((v) => v === null || (Number.isInteger(v) && v > 0), "Durasi harus lebih dari 0 menit."),
});
export const taskStatusSchema = z.enum(TaskStatus);
export const subtaskSchema = z.object({ title: z.string().trim().min(1, "Judul subtask wajib diisi.").max(240) });
export type TaskInput = z.infer<typeof taskInputSchema>;
