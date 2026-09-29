import { db } from "@/lib/db/client";
import { jakartaInputParts } from "@/lib/date/jakarta";
import { expandRecurringEvent, type EventOccurrence } from "@/server/services/event-service";

export async function getEvents(userId:string){return db.event.findMany({where:{userId,deletedAt:null},include:{recurrenceRule:true},orderBy:[{startAt:"asc"},{id:"asc"}]})}
export async function getEvent(userId:string,id:string){return db.event.findFirst({where:{id,userId,deletedAt:null},include:{recurrenceRule:true}})}
export async function getEventOccurrencesForRange(userId:string,rangeStart:Date,rangeEnd:Date){
  if(rangeEnd<=rangeStart)return[];const rangeDate=new Date(`${jakartaInputParts(rangeStart).date}T00:00:00Z`);const events=await db.event.findMany({where:{userId,deletedAt:null,startAt:{lt:rangeEnd},OR:[{recurrenceRuleId:null,endAt:{gt:rangeStart}},{recurrenceRule:{is:{frequency:"WEEKLY",OR:[{until:null},{until:{gte:rangeDate}}]}}}]},include:{recurrenceRule:true}});const occurrences:EventOccurrence[]=[];
  for(const event of events){if(event.recurrenceRule)occurrences.push(...expandRecurringEvent({...event,recurrenceRule:event.recurrenceRule},rangeStart,rangeEnd));else occurrences.push({id:event.id,eventId:event.id,title:event.title,startAt:event.startAt,endAt:event.endAt,location:event.location,notes:event.notes,isRecurring:false})}
  return occurrences.sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()||a.eventId.localeCompare(b.eventId));
}
