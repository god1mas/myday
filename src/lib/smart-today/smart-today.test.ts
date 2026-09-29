import { describe, expect, it } from "vitest";
import type { CalendarItem } from "@/server/queries/calendar-queries";
import { deadlineScore, priorityScore, progressScore, rankSmartToday, scoreTask } from "./scoring";
import { selectNowOrNext } from "./activity";

const now = new Date("2026-09-29T05:00:00.000Z");
const base = { id: "a", priority: "MEDIUM" as const, deadlineAt: null, pinnedDate: null, createdAt: new Date("2026-01-01Z"), progress: 0, scheduledToday: false };
const item = (id: string, type: CalendarItem["type"], start: string, end: string | null): CalendarItem => ({ id, sourceId: id, type, title: id, startAt: new Date(start), endAt: end ? new Date(end) : null, href: "/", context: null, isRecurring: false });

describe("Smart Today scoring", () => {
  it("maps priority weights exactly",()=>expect(["LOW","MEDIUM","HIGH","URGENT"].map(priority=>priorityScore(priority as "LOW"|"MEDIUM"|"HIGH"|"URGENT"))).toEqual([10,20,35,50]));
  it("applies every deadline boundary exactly", () => {
    const at = (ms: number) => deadlineScore(new Date(now.getTime() + ms), now);
    expect([at(2*3_600_000),at(2*3_600_000+1),at(6*3_600_000),at(6*3_600_000+1),at(24*3_600_000),at(24*3_600_000+1),at(48*3_600_000),at(48*3_600_000+1),at(72*3_600_000),at(72*3_600_000+1),at(168*3_600_000),at(168*3_600_000+1)]).toEqual([80,70,70,60,60,45,45,30,30,15,15,5]);
    expect(deadlineScore(null, now)).toBe(0);
  });
  it("uses full elapsed overdue days and caps the bonus", () => {
    expect(deadlineScore(new Date(now.getTime()-1),now)).toBe(65);
    expect(deadlineScore(new Date(now.getTime()-86_400_000),now)).toBe(68);
    expect(deadlineScore(new Date(now.getTime()-20*86_400_000),now)).toBe(95);
  });
  it("applies progress buckets and explains the exact additive score", () => {
    expect([0,25,26,50,51,75,76,99,100].map(progressScore)).toEqual([15,15,10,10,5,5,2,2,0]);
    const result=scoreTask({...base,priority:"URGENT",deadlineAt:new Date(now.getTime()+3_600_000),pinnedDate:new Date("2026-09-29Z"),progress:50,scheduledToday:true},now,"2026-09-29");
    expect(result.score).toBe(1165);
    expect(result.reasons).toEqual(["Pinned today +1000","URGENT priority +50","Due today +80","Progress 50% +10","Scheduled today +25"]);
  });
  it("pins only the Jakarta date and ranks deterministically with a limit of three", () => {
    const tasks=[
      {...base,id:"old",pinnedDate:new Date("2026-09-28Z")},
      {...base,id:"pinned",pinnedDate:new Date("2026-09-29Z")},
      {...base,id:"later",deadlineAt:new Date("2026-10-01Z")},
      {...base,id:"earlier",deadlineAt:new Date("2026-09-30Z")},
      {...base,id:"none",createdAt:new Date("2025-01-01Z")},
    ];
    expect(rankSmartToday(tasks,now,"2026-09-29").map(task=>task.id)).toEqual(["pinned","earlier","later"]);
  });
  it("returns only the best three of five tasks pinned today",()=>{
    const tasks=[1,2,3,4,5].map(index=>({...base,id:`p${index}`,pinnedDate:new Date("2026-09-29Z"),priority:index>3?"LOW" as const:"HIGH" as const,createdAt:new Date(`2026-01-0${index}Z`)}));
    expect(rankSmartToday(tasks,now,"2026-09-29").map(task=>task.id)).toEqual(["p1","p2","p3"]);
  });
});

describe("NOW / NEXT selection", () => {
  it("chooses the earliest overlapping activity at inclusive-start/exclusive-end boundaries", () => {
    const items=[item("later-current","EVENT","2026-09-29T04:30Z","2026-09-29T06:00Z"),item("earliest-current","TIME_BLOCK","2026-09-29T04:00Z","2026-09-29T05:30Z")];
    expect(selectNowOrNext(items,now)).toMatchObject({label:"NOW",item:{id:"earliest-current"}});
    expect(selectNowOrNext([item("ended","EVENT","2026-09-29T04:00Z","2026-09-29T05:00Z"),item("starts","EVENT","2026-09-29T05:00Z","2026-09-29T06:00Z")],now)).toMatchObject({label:"NOW",item:{id:"starts"}});
    const meeting=item("meeting","EVENT","2026-09-29T02:00Z","2026-09-29T03:00Z");
    expect(selectNowOrNext([meeting],new Date("2026-09-29T01:59:59Z"))?.label).toBe("NEXT");
    expect(selectNowOrNext([meeting],new Date("2026-09-29T02:00:00Z"))?.label).toBe("NOW");
    expect(selectNowOrNext([meeting],new Date("2026-09-29T02:59:59Z"))?.label).toBe("NOW");
    expect(selectNowOrNext([meeting],new Date("2026-09-29T03:00:00Z"))).toBeNull();
  });
  it("ignores task deadlines, chooses the next future activity, and clears when none remains", () => {
    expect(selectNowOrNext([item("deadline","TASK_DEADLINE","2026-09-29T05:01Z",null),item("next","EVENT","2026-09-29T06:00Z","2026-09-29T07:00Z")],now)).toMatchObject({label:"NEXT",item:{id:"next"}});
    expect(selectNowOrNext([item("past","EVENT","2026-09-29T03:00Z","2026-09-29T04:00Z")],now)).toBeNull();
  });
});
