import { ProjectStatus } from "@/generated/prisma/enums";
import { z } from "zod";
import { optionalDate } from "./date-time";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null);

const dateField = optionalDate;

export const projectInputSchema = z
  .object({
    name: z.string().trim().min(1, "Nama project wajib diisi.").max(160, "Nama project terlalu panjang."),
    description: optionalText(5000),
    icon: optionalText(100),
    areaId: optionalText(36),
    startDate: dateField,
    targetDate: dateField,
  })
  .refine(({ startDate, targetDate }) => !startDate || !targetDate || targetDate >= startDate, {
    message: "Target date tidak boleh lebih awal dari start date.",
    path: ["targetDate"],
  });

export const projectStatusSchema = z.enum(ProjectStatus);
export type ProjectInput = z.infer<typeof projectInputSchema>;
