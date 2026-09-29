import { z } from "zod";
export const reviewActionSchema = z.enum(["TOMORROW", "RESCHEDULE", "KEEP"]);
export const reviewItemInputSchema = z.object({
  taskId: z.string().uuid(),
  action: reviewActionSchema,
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
}).superRefine((value, context) => {
  if (value.action !== "RESCHEDULE") return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date??"")) context.addIssue({code:"custom",path:["date"],message:"Tanggal tidak valid."});
  if (!/^\d{2}:\d{2}$/.test(value.startTime??"")) context.addIssue({code:"custom",path:["startTime"],message:"Waktu mulai wajib diisi."});
  if (!/^\d{2}:\d{2}$/.test(value.endTime??"") || value.endTime!<=value.startTime!) context.addIssue({code:"custom",path:["endTime"],message:"Waktu selesai harus setelah waktu mulai."});
});

export const reflectionSchema = z.string().max(5000, "Reflection terlalu panjang.").transform((value) => value.trim() || null);
export type ReviewItemInput = z.infer<typeof reviewItemInputSchema>;
export function dailyReviewItemsFromForm(form: FormData) { return form.getAll("taskId").map((value) => { const taskId=String(value),optional=(name:string)=>form.get(`${name}:${taskId}`)||undefined; return { taskId, action: form.get(`action:${taskId}`), date: optional("date"), startTime: optional("startTime"), endTime: optional("endTime") }; }); }
