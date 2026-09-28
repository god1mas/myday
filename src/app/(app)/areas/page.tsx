import { AreaForm } from "@/components/entity-form";
import { requireUser } from "@/lib/auth/session";
import { createAreaAction, deleteAreaAction, updateAreaAction } from "@/server/actions/areas";
import { getAreas } from "@/server/queries/area-queries";

export default async function AreasPage() {
  const user = await requireUser();
  const areas = await getAreas(user.id);
  return <main className="mx-auto max-w-5xl px-6 py-12">
    <div className="mb-10"><p className="text-sm font-semibold text-emerald-700">ORGANIZE</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Areas</h1><p className="mt-2 text-slate-600">Kelompokkan bagian penting dalam hidupmu.</p></div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-5 text-lg font-semibold">Buat area</h2><AreaForm action={createAreaAction} /></section>
    <section className="mt-10"><h2 className="mb-4 text-sm font-semibold tracking-wide text-slate-500">AREA AKTIF</h2>
      {areas.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center"><p className="font-medium">Belum ada area.</p><p className="mt-1 text-sm text-slate-600">Buat area untuk mengelompokkan bagian penting dalam hidupmu.</p></div> :
        <div className="space-y-3">{areas.map((area) => <details key={area.id} className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer list-none"><div className="flex items-center justify-between"><div><h3 className="font-semibold">{area.icon ? `${area.icon} ` : ""}{area.name}</h3><p className="mt-1 text-sm text-slate-500">{area._count.projects} project aktif</p></div><span className="text-sm text-slate-500">Edit</span></div></summary><div className="mt-5 border-t border-slate-100 pt-5"><AreaForm action={updateAreaAction} area={area} /><form action={deleteAreaAction} className="mt-4"><input type="hidden" name="id" value={area.id} /><button className="text-sm font-medium text-red-700">Hapus area</button></form></div></details>)}</div>}
    </section>
  </main>;
}
