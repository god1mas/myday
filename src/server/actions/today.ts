"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { jakartaDate } from "@/lib/date/jakarta";
import { setTaskPinnedDate } from "@/server/services/today-service";

export async function setTodayPinAction(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  const shouldPin = formData.get("pinned") === "true";
  if (taskId) await setTaskPinnedDate(user.id, taskId, shouldPin ? new Date(`${jakartaDate()}T00:00:00.000Z`) : null);
  revalidatePath("/today");
  revalidatePath("/tasks");
  if (taskId) revalidatePath(`/tasks/${taskId}`);
}
