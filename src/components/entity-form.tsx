"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/server/actions/areas";

type Action = (state: FormState, data: FormData) => Promise<FormState>;
const initialState: FormState = { error: null, fieldErrors: {} };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Menyimpan..." : label}</button>;
}

function ErrorText({ errors }: { errors?: string[] }) { return errors?.[0] ? <p className="mt-1 text-sm text-red-700">{errors[0]}</p> : null; }

export function AreaForm({ action, area }: { action: Action; area?: { id: string; name: string; icon: string | null } }) {
  const [state, formAction] = useActionState(action, initialState);
  return <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
    {area ? <input type="hidden" name="id" value={area.id} /> : null}
    <label className="text-sm font-medium">Nama<input name="name" defaultValue={area?.name} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" required /><ErrorText errors={state.fieldErrors.name} /></label>
    <label className="text-sm font-medium">Icon<input name="icon" defaultValue={area?.icon ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" placeholder="Opsional" /><ErrorText errors={state.fieldErrors.icon} /></label>
    <div className="self-end"><Submit label={area ? "Simpan" : "Tambah area"} /></div>
    {state.error ? <p role="alert" className="text-sm text-red-700 sm:col-span-3">{state.error}</p> : null}
    {state.success ? <p role="status" className="text-sm text-emerald-700 sm:col-span-3">Tersimpan.</p> : null}
  </form>;
}

type ProjectValue = { id: string; name: string; description: string | null; icon: string | null; areaId: string | null; startDate: Date | null; targetDate: Date | null };
function dateValue(date: Date | null | undefined) { return date ? date.toISOString().slice(0, 10) : ""; }

export function ProjectForm({ action, areas, project }: { action: Action; areas: { id: string; name: string }[]; project?: ProjectValue }) {
  const [state, formAction] = useActionState(action, initialState);
  const input = "mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3";
  return <form action={formAction} className="grid gap-4 sm:grid-cols-2">
    {project ? <input type="hidden" name="id" value={project.id} /> : null}
    <label className="text-sm font-medium sm:col-span-2">Nama<input className={input} name="name" defaultValue={project?.name} required /><ErrorText errors={state.fieldErrors.name} /></label>
    <label className="text-sm font-medium sm:col-span-2">Deskripsi<textarea className={`${input} min-h-24 py-2`} name="description" defaultValue={project?.description ?? ""} /></label>
    <label className="text-sm font-medium">Area<select className={input} name="areaId" defaultValue={project?.areaId ?? ""}><option value="">Tanpa area</option>{areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
    <label className="text-sm font-medium">Icon<input className={input} name="icon" defaultValue={project?.icon ?? ""} placeholder="Opsional" /></label>
    <label className="text-sm font-medium">Start date<input className={input} type="date" name="startDate" defaultValue={dateValue(project?.startDate)} /></label>
    <label className="text-sm font-medium">Target date<input className={input} type="date" name="targetDate" defaultValue={dateValue(project?.targetDate)} /><ErrorText errors={state.fieldErrors.targetDate} /></label>
    {state.error ? <p role="alert" className="text-sm text-red-700 sm:col-span-2">{state.error}</p> : null}
    {state.success ? <p role="status" className="text-sm text-emerald-700 sm:col-span-2">Tersimpan.</p> : null}
    <div className="sm:col-span-2"><Submit label={project ? "Simpan perubahan" : "Tambah project"} /></div>
  </form>;
}

export function StatusForm({ action, id, current }: { action: Action; id: string; current: string }) {
  const [state, formAction] = useActionState(action, initialState);
  return <form action={formAction} className="flex flex-wrap items-end gap-3"><input type="hidden" name="id" value={id} /><label className="text-sm font-medium">Status<select name="status" defaultValue={current} className="mt-1 block min-h-11 rounded-lg border border-slate-300 bg-white px-3"><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="ARCHIVED">Archived</option></select></label><Submit label="Ubah status" />{state.error ? <p role="alert" className="w-full text-sm text-red-700">{state.error}</p> : null}</form>;
}
