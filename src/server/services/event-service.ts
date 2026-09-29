import { db } from "@/lib/db/client";
import { jakartaDateTime, jakartaInputParts } from "@/lib/date/jakarta";
import type { EventInput } from "@/lib/validation/event";

export class EventRuleError extends Error {}
const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY = 86_400_000;
export type EventOccurrence = { id:string; eventId:string; title:string; startAt:Date; endAt:Date; location:string|null; notes:string|null; isRecurring:boolean };

function eventData(input:EventInput){return{title:input.title,startAt:jakartaDateTime(input.date,input.startTime),endAt:jakartaDateTime(input.date,input.endTime),location:input.location,notes:input.notes}}
function ruleData(input:EventInput){return{frequency:"WEEKLY" as const,interval:input.interval,daysOfWeek:input.daysOfWeek,until:input.until?new Date(`${input.until}T00:00:00Z`):null}}
export function eventTemporalState(event:{startAt:Date;endAt:Date},now=new Date()){return event.endAt<=now?"past":event.startAt<=now&&now<event.endAt?"current":"future"}

export async function createEvent(userId:string,input:EventInput){return db.$transaction(async(tx)=>{let recurrenceRuleId:string|null=null;if(input.recurring)recurrenceRuleId=(await tx.recurrenceRule.create({data:ruleData(input)})).id;return tx.event.create({data:{userId,...eventData(input),recurrenceRuleId},include:{recurrenceRule:true}})})}
export async function updateEvent(userId:string,id:string,input:EventInput){return db.$transaction(async(tx)=>{const existing=await tx.event.findFirst({where:{id,userId,deletedAt:null},select:{recurrenceRuleId:true}});if(!existing)return null;let recurrenceRuleId=existing.recurrenceRuleId;if(input.recurring&&recurrenceRuleId)await tx.recurrenceRule.update({where:{id:recurrenceRuleId},data:ruleData(input)});else if(input.recurring)recurrenceRuleId=(await tx.recurrenceRule.create({data:ruleData(input)})).id;else recurrenceRuleId=null;const event=await tx.event.update({where:{id},data:{...eventData(input),recurrenceRuleId},include:{recurrenceRule:true}});if(!input.recurring&&existing.recurrenceRuleId)await tx.recurrenceRule.delete({where:{id:existing.recurrenceRuleId}});return event})}
export async function deleteEvent(userId:string,id:string){return(await db.event.updateMany({where:{id,userId,deletedAt:null},data:{deletedAt:new Date()}})).count===1}

export function expandRecurringEvent(event:{id:string;title:string;startAt:Date;endAt:Date;location:string|null;notes:string|null;recurrenceRule:{interval:number;daysOfWeek:string[];until:Date|null}},rangeStart:Date,rangeEnd:Date){
  const result:EventOccurrence[]=[];if(rangeEnd<=rangeStart)return result;const base=jakartaInputParts(event.startAt),duration=event.endAt.getTime()-event.startAt.getTime(),baseOrdinal=new Date(`${base.date}T00:00:00Z`),baseWeekStart=new Date(baseOrdinal.getTime()-((baseOrdinal.getUTCDay()+6)%7)*DAY),until=event.recurrenceRule.until?.toISOString().slice(0,10),firstDate=jakartaInputParts(new Date(rangeStart.getTime()-duration+1)).date;
  for(let cursor=new Date(Math.max(baseOrdinal.getTime(),new Date(`${firstDate}T00:00:00Z`).getTime()));;cursor=new Date(cursor.getTime()+DAY)){
    const localDate=cursor.toISOString().slice(0,10),startAt=jakartaDateTime(localDate,base.time);if(startAt>=rangeEnd)break;if(until&&localDate>until)break;const weeks=Math.floor((cursor.getTime()-baseWeekStart.getTime())/(7*DAY));if(weeks%event.recurrenceRule.interval!==0||!event.recurrenceRule.daysOfWeek.includes(dayNames[cursor.getUTCDay()]))continue;const endAt=new Date(startAt.getTime()+duration);if(endAt>rangeStart)result.push({id:`${event.id}:${startAt.toISOString()}`,eventId:event.id,title:event.title,startAt,endAt,location:event.location,notes:event.notes,isRecurring:true});
  }return result;
}
