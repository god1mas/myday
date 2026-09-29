"use client";

import Link from "next/link";
import { useState } from "react";
import type { TaskDiscovery } from "@/lib/validation/task-discovery";

type Option={id:string;name:string};
const select="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm";
const statuses=["TODO","IN_PROGRESS","DONE"] as const;
const priorities=["LOW","MEDIUM","HIGH","URGENT"] as const;

export function TaskDiscoveryForm({filters,projects,areas,count}:{filters:TaskDiscovery;projects:Option[];areas:Option[];count:number}) {
  const [filtersOpen,setFiltersOpen]=useState(false);
  return <form action="/tasks" method="get" className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex flex-col gap-3 sm:flex-row"><input aria-label="Search tasks" name="q" defaultValue={filters.q} placeholder="Search tasks..." className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3"/><select aria-label="Deadline filter" name="deadline" defaultValue={filters.deadline??""} className={select}><option value="">All deadlines</option><option value="TODAY">Today</option><option value="UPCOMING">Upcoming</option><option value="OVERDUE">Overdue</option><option value="NONE">No Deadline</option></select><select aria-label="Sort tasks" name="sort" defaultValue={filters.sort} className={select}><option value="DEFAULT">Default</option><option value="DEADLINE">Deadline</option><option value="PRIORITY">Priority</option><option value="CREATED">Created Date</option><option value="SMART">Smart Priority</option></select><button className="min-h-11 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white">Apply</button></div>
    <div className="mt-4 border-t pt-3"><button aria-expanded={filtersOpen} aria-controls="task-filters" className="flex w-full items-center justify-between text-left font-semibold sm:hidden" onClick={()=>setFiltersOpen(open=>!open)} type="button"><span>Filter lanjutan</span><span className="text-sm text-slate-500">{count?`${count} aktif`:`Opsional`}</span></button><div id="task-filters" className={`${filtersOpen?"grid":"hidden"} gap-4 pt-3 sm:grid sm:grid-cols-2 sm:pt-1 lg:grid-cols-4`}><fieldset><legend className="text-sm font-semibold">Status</legend><div className="mt-2 flex flex-wrap gap-2">{statuses.map(value=><label key={value} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs"><input type="checkbox" name="status" value={value} defaultChecked={filters.statuses.includes(value)}/>{value}</label>)}</div></fieldset><fieldset><legend className="text-sm font-semibold">Priority</legend><div className="mt-2 flex flex-wrap gap-2">{priorities.map(value=><label key={value} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs"><input type="checkbox" name="priority" value={value} defaultChecked={filters.priorities.includes(value)}/>{value}</label>)}</div></fieldset><label className="text-sm font-semibold">Project<select name="project" defaultValue={filters.projectId??""} className={`mt-2 w-full ${select}`}><option value="">All projects</option>{projects.map(project=><option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="text-sm font-semibold">Area<select name="area" defaultValue={filters.areaId??""} className={`mt-2 w-full ${select}`}><option value="">All areas</option>{areas.map(area=><option key={area.id} value={area.id}>{area.name}</option>)}</select></label></div></div>
    {count?<div className="mt-4 flex items-center justify-between border-t pt-3 text-sm"><span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">{count} filter aktif</span><Link href="/tasks" className="font-semibold text-slate-600">Clear filters</Link></div>:null}
  </form>;
}
