"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { jakartaDateTime } from "@/lib/date/jakarta";
import { eventInputSchema } from "@/lib/validation/event";
import { getEventOccurrencesForRange } from "@/server/queries/event-queries";
import { createEvent, deleteEvent, updateEvent } from "@/server/services/event-service";
import { db } from "@/lib/db/client";

type EventFormValues={title:string;date:string;startTime:string;endTime:string;location:string;notes:string;recurring:boolean;interval:string;daysOfWeek:string[];until:string};
export type EventFormState={error:string|null;fieldErrors:Record<string,string[]|undefined>;warning?:string;success?:boolean;values?:EventFormValues};
const raw=(form:FormData)=>({title:form.get("title"),date:form.get("date"),startTime:form.get("startTime"),endTime:form.get("endTime"),location:form.get("location"),notes:form.get("notes"),recurring:form.get("recurring")==="on",interval:form.get("interval")||"1",daysOfWeek:form.getAll("daysOfWeek"),until:form.get("until")});
async function conflicts(userId:string,startAt:Date,endAt:Date,excludeId?:string){const[blocks,events]=await Promise.all([db.timeBlock.count({where:{userId,deletedAt:null,startAt:{lt:endAt},endAt:{gt:startAt},OR:[{taskId:null},{task:{deletedAt:null}}]}}),getEventOccurrencesForRange(userId,startAt,endAt)]);return blocks+events.filter(event=>event.eventId!==excludeId).length}
async function mutate(_:EventFormState,form:FormData,edit:boolean):Promise<EventFormState>{const user=await requireUser(),parsed=eventInputSchema.safeParse(raw(form));if(!parsed.success)return{error:null,fieldErrors:parsed.error.flatten().fieldErrors};const id=String(form.get("id")||""),startAt=jakartaDateTime(parsed.data.date,parsed.data.startTime),endAt=jakartaDateTime(parsed.data.date,parsed.data.endTime),count=await conflicts(user.id,startAt,endAt,edit?id:undefined);if(count&&!form.get("confirmOverlap"))return{error:null,fieldErrors:{},warning:`Acara bertabrakan dengan ${count} jadwal lain. Kirim lagi untuk tetap menyimpan.`,values:{...parsed.data,location:parsed.data.location??"",notes:parsed.data.notes??"",interval:String(parsed.data.interval)}};try{const result=edit?await updateEvent(user.id,id,parsed.data):await createEvent(user.id,parsed.data);if(!result)return{error:"Acara tidak ditemukan.",fieldErrors:{}}}catch{return{error:"Acara tidak dapat disimpan.",fieldErrors:{}}}revalidatePath("/events");return{error:null,fieldErrors:{},success:true}}
export async function createEventAction(state:EventFormState,form:FormData){return mutate(state,form,false)}
export async function updateEventAction(state:EventFormState,form:FormData){return mutate(state,form,true)}
export async function deleteEventAction(form:FormData){const user=await requireUser();await deleteEvent(user.id,String(form.get("id")));revalidatePath("/events")}
