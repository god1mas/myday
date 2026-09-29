"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { jakartaDate, jakartaDateTime } from "@/lib/date/jakarta";
import { dailyReviewItemsFromForm, reflectionSchema, reviewItemInputSchema, type ReviewItemInput } from "@/lib/validation/daily-review";
import { findOverlaps } from "@/server/services/time-block-service";
import { DailyReviewRuleError, submitDailyReview } from "@/server/services/daily-review-service";

export type DailyReviewFormState = { error: string | null; warning?: string; confirmOverlap?: boolean };
export async function finishDailyReviewAction(_: DailyReviewFormState, form: FormData): Promise<DailyReviewFormState> {
  const user = await requireUser();
  const date = jakartaDate();
  const parsedItems = dailyReviewItemsFromForm(form).map((item) => reviewItemInputSchema.safeParse(item));
  if (parsedItems.some((item) => !item.success)) return { error: "Pilih satu tindakan yang valid untuk setiap tugas dan lengkapi waktu Reschedule." };
  const parsedReflection = reflectionSchema.safeParse(String(form.get("reflection") ?? ""));
  if (!parsedReflection.success) return { error: parsedReflection.error.issues[0]?.message ?? "Reflection tidak valid." };
  const validItems = parsedItems.map((item) => item.data) as ReviewItemInput[];
  if (!form.get("confirmOverlap")) {
    let conflicts = 0;
    for (const item of validItems) if (item.action === "RESCHEDULE") conflicts += (await findOverlaps(user.id, jakartaDateTime(item.date!, item.startTime!), jakartaDateTime(item.date!, item.endTime!))).length;
    if (conflicts) return { error: null, warning: `Jadwal baru bertabrakan dengan ${conflicts} jadwal lain. Anda tetap dapat menyelesaikan review.`, confirmOverlap: true };
  }
  let reviewId: string;
  try { reviewId = (await submitDailyReview(user.id, date, parsedReflection.data, validItems)).id; }
  catch (error) { return { error: error instanceof DailyReviewRuleError ? error.message : "Daily Review tidak dapat disimpan." }; }
  revalidatePath("/today"); revalidatePath("/reviews"); revalidatePath("/reviews/today"); revalidatePath("/planner"); revalidatePath("/calendar");
  redirect(`/reviews/${reviewId}`);
}
