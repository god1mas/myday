import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm, StatusForm } from "@/components/entity-form";
import { requireUser } from "@/lib/auth/session";
import { changeProjectStatusAction, deleteProjectAction, updateProjectAction } from "@/server/actions/projects";
import { getAreas } from "@/server/queries/area-queries";
import { getProject, progressFromTasks } from "@/server/queries/project-queries";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [project, areas] = await Promise.all([getProject(user.id, id), getAreas(user.id)]);
  if (!project) notFound();
  const progress = progressFromTasks(project.tasks);
  return <main className="mx-auto max-w-4xl px-6 py-12"><Link href="/projects" className="text-sm font-medium text-slate-600">← Projects</Link>
    <div className="mt-8 flex flex-wrap items-start justify-between gap-6"><div><p className="text-sm font-semibold text-emerald-700">{project.status}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{project.icon ? `${project.icon} ` : ""}{project.name}</h1><p className="mt-3 max-w-2xl text-slate-600">{project.description ?? "Tanpa deskripsi."}</p></div><div className="text-right"><p className="text-3xl font-semibold">{progress.progress}%</p><p className="text-sm text-slate-500">{progress.completedTasks} / {progress.totalTasks} tasks</p></div></div>
    <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-emerald-600" style={{ width: `${progress.progress}%` }} /></div>
    <dl className="mt-8 grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-3"><div><dt className="text-sm text-slate-500">Area</dt><dd className="mt-1 font-medium">{project.area?.name ?? "Tanpa area"}</dd></div><div><dt className="text-sm text-slate-500">Start date</dt><dd className="mt-1 font-medium">{project.startDate?.toISOString().slice(0,10) ?? "—"}</dd></div><div><dt className="text-sm text-slate-500">Target date</dt><dd className="mt-1 font-medium">{project.targetDate?.toISOString().slice(0,10) ?? "—"}</dd></div></dl>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-5 text-lg font-semibold">Status</h2><StatusForm action={changeProjectStatusAction} id={project.id} current={project.status} /></section>
    <details className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><summary className="cursor-pointer font-semibold">Edit project</summary><div className="mt-6"><ProjectForm action={updateProjectAction} areas={areas} project={project} /></div></details>
    <section className="mt-8 border-t border-slate-200 pt-6"><form action={deleteProjectAction}><input type="hidden" name="id" value={project.id} /><button className="text-sm font-semibold text-red-700">Hapus project</button></form></section>
  </main>;
}
