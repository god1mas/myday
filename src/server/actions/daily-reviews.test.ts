import { describe,expect,it } from "vitest";
import { dailyReviewItemsFromForm, reviewItemInputSchema } from "@/lib/validation/daily-review";
describe("Daily Review form parsing",()=>{it("normalizes absent Reschedule fields for Tomorrow and Keep",()=>{const id="11111111-1111-4111-8111-111111111111",form=new FormData();form.append("taskId",id);form.set(`action:${id}`,"KEEP");const [item]=dailyReviewItemsFromForm(form);expect(item).toEqual({taskId:id,action:"KEEP",date:undefined,startTime:undefined,endTime:undefined});expect(reviewItemInputSchema.safeParse(item).success).toBe(true)})});
