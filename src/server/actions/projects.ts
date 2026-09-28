"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { projectInputSchema, projectStatusSchema } from "@/lib/validation/project";
import type { FormState } from "@/server/actions/areas";
import { changeProjectStatus, createProject, deleteProject, ProjectRuleError, updateProject } from "@/server/services/project-service";

function values(formData: FormData) { return { name: formData.get("name"), description: formData.get("description"), icon: formData.get("icon"), areaId: formData.get("areaId"), startDate: formData.get("startDate"), targetDate: formData.get("targetDate") }; }

export async function createProjectAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = projectInputSchema.safeParse(values(formData));
  if (!parsed.success) return { error: null, fieldErrors: parsed.error.flatten().fieldErrors };
  try { await createProject(user.id, parsed.data); }
  catch (error) { return { error: error instanceof ProjectRuleError ? error.message : "Project tidak dapat disimpan.", fieldErrors: {} }; }
  revalidatePath("/projects");
  return { error: null, fieldErrors: {}, success: true };
}

export async function updateProjectAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const parsed = projectInputSchema.safeParse(values(formData));
  if (!parsed.success) return { error: null, fieldErrors: parsed.error.flatten().fieldErrors };
  try { if (!(await updateProject(user.id, id, parsed.data))) return { error: "Project tidak ditemukan.", fieldErrors: {} }; }
  catch (error) { return { error: error instanceof ProjectRuleError ? error.message : "Project tidak dapat disimpan.", fieldErrors: {} }; }
  revalidatePath("/projects"); revalidatePath(`/projects/${id}`);
  return { error: null, fieldErrors: {}, success: true };
}

export async function changeProjectStatusAction(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const status = projectStatusSchema.safeParse(formData.get("status"));
  if (!status.success) return { error: "Status tidak valid.", fieldErrors: {} };
  try { if (!(await changeProjectStatus(user.id, id, status.data))) return { error: "Project tidak ditemukan.", fieldErrors: {} }; }
  catch (error) { return { error: error instanceof ProjectRuleError ? error.message : "Status tidak dapat diubah.", fieldErrors: {} }; }
  revalidatePath("/projects"); revalidatePath(`/projects/${id}`);
  return { error: null, fieldErrors: {}, success: true };
}

export async function deleteProjectAction(formData: FormData) {
  const user = await requireUser();
  await deleteProject(user.id, String(formData.get("id")));
  revalidatePath("/projects");
  redirect("/projects");
}
