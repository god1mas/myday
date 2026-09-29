"use client";
import { useActionState, useState } from "react";
import type { TaskPriority } from "@/generated/prisma/enums";
import { finishDailyReviewAction, type DailyReviewFormState } from "@/server/actions/daily-reviews";

type Task = { id:string; title:string; priority:TaskPriority; deadline:string|null; project:string|null; reasons:string[] };
const initial:DailyReviewFormState={error:null};
const input="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3";

export function DailyReviewForm({tasks,tomorrow}:{tasks:Task[];tomorrow:string}) {
  const[state,action,pending]=useActionState(finishDailyReviewAction,initial);
  const[choices,setChoices]=useState<Record<string,string>>({});
  return <form action={action} className="space-y-6">
    <section aria-labelledby="unfinished-heading"><h2 id="unfinished-heading" className="text-xl font-semibold">Unfinished <span className="text-slate-400">{tasks.length}</span></h2>
      {tasks.length?<div className="mt-3 space-y-4">{tasks.map(task=><article key={task.id} className="rounded-xl border border-slate-200 bg-white p-4"><input type="hidden" name="taskId" value={task.id}/><div><h3 className="font-semibold text-slate-950">{task.title}</h3><p className="mt-1 text-sm text-slate-500">{task.project??"Tanpa project"} · {task.priority}{task.deadline?` · Deadline ${task.deadline}`:""}</p><p className="mt-1 text-xs text-slate-500">{task.reasons.join(" · ")}</p></div>
        <fieldset className="mt-4"><legend className="sr-only">Tindakan untuk {task.title}</legend><div className="grid gap-2 sm:grid-cols-3">{[["TOMORROW","Tomorrow"],["RESCHEDULE","Reschedule"],["KEEP","Keep"]].map(([value,label])=><label key={value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${choices[task.id]===value?"border-emerald-600 bg-emerald-50 text-emerald-900":"border-slate-300"}`}><input className="sr-only" type="radio" required name={`action:${task.id}`} value={value} onChange={()=>setChoices(current=>({...current,[task.id]:value}))}/>{label}</label>)}</div></fieldset>
        {choices[task.id]==="RESCHEDULE"?<div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-3"><label className="text-sm font-medium">Tanggal<input className={input} type="date" required name={`date:${task.id}`} defaultValue={tomorrow}/></label><label className="text-sm font-medium">Mulai<input className={input} type="time" required name={`startTime:${task.id}`} defaultValue="09:00"/></label><label className="text-sm font-medium">Selesai<input className={input} type="time" required name={`endTime:${task.id}`} defaultValue="10:00"/></label><p className="text-xs text-slate-500 sm:col-span-3">Jadwal lama dan deadline tetap dipertahankan.</p></div>:null}
      </article>)}</div>:<p className="mt-3 rounded-xl border border-dashed p-6 text-slate-500">Tidak ada tugas unfinished untuk ditinjau.</p>}
    </section>
    <label className="block text-sm font-semibold">Reflection <span className="font-normal text-slate-500">(opsional)</span><textarea name="reflection" maxLength={5000} className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 bg-white p-3 font-normal" placeholder="Apa yang berjalan baik hari ini?"/></label>
    {state.confirmOverlap?<input type="hidden" name="confirmOverlap" value="true"/>:null}
    {state.warning?<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{state.warning}</p>:null}
    {state.error?<p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{state.error}</p>:null}
    <div className="flex justify-end"><button disabled={pending} type="submit" className="min-h-12 rounded-xl bg-slate-950 px-6 font-semibold text-white disabled:opacity-60">{pending?"Menyimpan…":state.confirmOverlap?"Tetap Finish Review":"Finish Review"}</button></div>
  </form>;
}
