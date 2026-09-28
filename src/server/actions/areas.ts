"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { areaInputSchema } from "@/lib/validation/area";
import { createArea, deleteArea, updateArea } from "@/server/services/area-service";

export type FormState = { error: string | null; fieldErrors: Record<string, string[] | undefined>; success?: boolean };

function values(formData: FormData) { return { name: formData.get("name"), icon: formData.get("icon") }; }

export async function createAreaAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = areaInputSchema.safeParse(values(formData));
  if (!parsed.success) return { error: null, fieldErrors: parsed.error.flatten().fieldErrors };
  await createArea(user.id, parsed.data);
  revalidatePath("/areas");
  return { error: null, fieldErrors: {}, success: true };
}

export async function updateAreaAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = areaInputSchema.safeParse(values(formData));
  if (!parsed.success) return { error: null, fieldErrors: parsed.error.flatten().fieldErrors };
  const updated = await updateArea(user.id, String(formData.get("id")), parsed.data);
  if (!updated) return { error: "Area tidak ditemukan.", fieldErrors: {} };
  revalidatePath("/areas"); revalidatePath("/projects");
  return { error: null, fieldErrors: {}, success: true };
}

export async function deleteAreaAction(formData: FormData) {
  const user = await requireUser();
  await deleteArea(user.id, String(formData.get("id")));
  revalidatePath("/areas"); revalidatePath("/projects");
}
