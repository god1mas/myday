import Link from "next/link";

import { ProjectForm } from "@/components/entity-form";
import { requireUser } from "@/lib/auth/session";
import { createProjectAction } from "@/server/actions/projects";
import { getAreas } from "@/server/queries/area-queries";
import { getProjects, progressFromTasks } from "@/server/queries/project-queries";

export default async function ProjectsPage() {
  const user = await requireUser();
  const [areas, projects] = await Promise.all([getAreas(user.id), getProjects(user.id)]);
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <div className="mb-10"><p className="text-sm font-semibold text-emerald-700">FOCUS</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Projects</h1><p className="mt-2 text-slate-600">Kelola tujuan dengan hasil akhir yang jelas.</p></div>
    <details className="rounded-2xl border border-slate-200 bg-white p-6"><summary className="cursor-pointer font-semibold">+ Project baru</summary><div className="mt-6"><ProjectForm action={createProjectAction} areas={areas} /></div></details>
    <section className="mt-10 space-y-3">{projects.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"><p className="font-medium">Belum ada project.</p><p className="mt-1 text-sm text-slate-600">Buat project untuk mulai mengubah tujuan menjadi langkah nyata.</p></div> : projects.map((project) => { const progress = progressFromTasks(project.tasks); return <Link href={`/projects/${project.id}`} key={project.id} className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">{project.icon ? `${project.icon} ` : ""}{project.name}</h2><p className="mt-1 text-sm text-slate-500">{project.area?.name ?? "Tanpa area"} · {project.status}</p></div><span className="font-semibold">{progress.progress}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-600" style={{ width: `${progress.progress}%` }} /></div><div className="mt-2 flex justify-between text-sm text-slate-500"><span>{progress.completedTasks} / {progress.totalTasks} tasks done</span><span>{project.targetDate ? `Target ${project.targetDate.toISOString().slice(0, 10)}` : "Tanpa target"}</span></div></Link>; })}</section>
  </main>;
}
