import { redirect } from "next/navigation";
import { DailyReviewForm } from "@/components/daily-review-form";
import { requireUser } from "@/lib/auth/session";
import { addJakartaDays, jakartaDate } from "@/lib/date/jakarta";
import { getDailyReviewByDate } from "@/server/queries/daily-review-queries";
import { getDailyReviewSummary } from "@/server/services/daily-review-service";

const fullDate=new Intl.DateTimeFormat("id-ID",{timeZone:"Asia/Jakarta",weekday:"long",day:"numeric",month:"long",year:"numeric"});
const deadline=new Intl.DateTimeFormat("id-ID",{timeZone:"Asia/Jakarta",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
export default async function ReviewTodayPage(){const user=await requireUser(),date=jakartaDate();const[existing,summary]=await Promise.all([getDailyReviewByDate(user.id,date),getDailyReviewSummary(user.id,date)]);if(existing)redirect(`/reviews/${existing.id}`);return <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><header className="mb-8"><p className="text-sm font-semibold text-emerald-700">CLOSE THE DAY</p><h1 className="mt-2 text-4xl font-semibold">Review Today</h1><p className="mt-2 capitalize text-slate-600">{fullDate.format(new Date())}</p></header><section aria-labelledby="completed-heading" className="mb-8 rounded-2xl bg-emerald-950 p-6 text-white"><h2 id="completed-heading" className="text-xl font-semibold">Completed <span className="text-emerald-300">{summary.completed.length}</span></h2>{summary.completed.length?<ul className="mt-3 space-y-2">{summary.completed.map(task=><li key={task.id}>✓ {task.title}</li>)}</ul>:<p className="mt-2 text-emerald-100">Belum ada task yang selesai hari ini.</p>}</section><DailyReviewForm tomorrow={addJakartaDays(date,1)} tasks={summary.unfinished.map(task=>({id:task.id,title:task.title,priority:task.priority,deadline:task.deadlineAt?deadline.format(task.deadlineAt):null,project:task.project?.name??null,reasons:task.reasons}))}/></main>}
