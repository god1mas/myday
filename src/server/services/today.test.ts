import "dotenv/config";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { getSmartTodayTasks } from "@/server/queries/today-queries";
import { setTaskPinnedDate } from "./today-service";

const token=randomUUID(); let owner:string,other:string; const start=new Date("2026-09-28T17:00:00Z"),end=new Date("2026-09-29T17:00:00Z"),now=new Date("2026-09-29T05:00:00Z");
describe("Today ownership and persistence",()=>{
  beforeAll(async()=>{const users=await Promise.all(["owner","other"].map(name=>db.user.create({data:{username:`today-${name}-${token}`,passwordHash:"$argon2id$test"}})));owner=users[0].id;other=users[1].id;});
  afterAll(async()=>{await db.timeBlock.deleteMany({where:{userId:{in:[owner,other]}}});await db.task.deleteMany({where:{userId:{in:[owner,other]}}});await db.user.deleteMany({where:{id:{in:[owner,other]}}});});
  it("returns only owned active unfinished tasks and detects overlap scheduling",async()=>{
    const [scheduled,plain,done,deleted,foreign]=await Promise.all([
      db.task.create({data:{userId:owner,title:"Scheduled",priority:"LOW"}}),
      db.task.create({data:{userId:owner,title:"No deadline",priority:"MEDIUM"}}),
      db.task.create({data:{userId:owner,title:"Done",status:"DONE"}}),
      db.task.create({data:{userId:owner,title:"Deleted",deletedAt:now}}),
      db.task.create({data:{userId:other,title:"Foreign"}}),
    ]);
    await db.timeBlock.create({data:{userId:owner,taskId:scheduled.id,title:"Cross boundary",startAt:new Date(start.getTime()-3_600_000),endAt:new Date(start.getTime()+3_600_000)}});
    await db.timeBlock.createMany({data:[
      {userId:owner,taskId:scheduled.id,title:"Second active",startAt:new Date(start.getTime()+2*3_600_000),endAt:new Date(start.getTime()+3*3_600_000)},
      {userId:owner,taskId:plain.id,title:"Yesterday",startAt:new Date(start.getTime()-4*3_600_000),endAt:new Date(start.getTime()-3*3_600_000)},
      {userId:owner,taskId:plain.id,title:"Deleted today",startAt:new Date(start.getTime()+4*3_600_000),endAt:new Date(start.getTime()+5*3_600_000),deletedAt:now},
    ]});
    const found=await getSmartTodayTasks(owner,now,start,end,"2026-09-29");
    expect(found.map(task=>task.id)).toEqual(expect.arrayContaining([scheduled.id,plain.id]));
    expect(found.map(task=>task.id)).not.toEqual(expect.arrayContaining([done.id,deleted.id,foreign.id]));
    expect(found.find(task=>task.id===scheduled.id)?.scheduledToday).toBe(true);
    expect(found.find(task=>task.id===scheduled.id)?.reasons).toContain("Scheduled today +25");
    expect(found.find(task=>task.id===plain.id)?.scheduledToday).toBe(false);
  });
  it("pin/unpin is ownership-scoped and changes no task planning fields",async()=>{
    const task=await db.task.create({data:{userId:owner,title:"Invariant",priority:"HIGH",deadlineAt:new Date("2026-10-01Z"),estimatedMinutes:45}}),pin=new Date("2026-09-29Z");
    expect(await setTaskPinnedDate(other,task.id,pin)).toBe(false);
    expect(await setTaskPinnedDate(owner,task.id,pin)).toBe(true);
    let stored=await db.task.findUniqueOrThrow({where:{id:task.id}});
    expect(stored).toMatchObject({priority:"HIGH",status:"TODO",estimatedMinutes:45});expect(stored.deadlineAt?.toISOString()).toBe("2026-10-01T00:00:00.000Z");expect(stored.pinnedDate?.toISOString()).toBe("2026-09-29T00:00:00.000Z");
    expect(await setTaskPinnedDate(owner,task.id,null)).toBe(true);stored=await db.task.findUniqueOrThrow({where:{id:task.id}});expect(stored.pinnedDate).toBeNull();
  });
});
