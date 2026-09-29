import { describe, expect, it } from "vitest";

import { reviewItemInputSchema } from "./daily-review";
import { eventInputSchema } from "./event";
import { projectInputSchema } from "./project";
import { taskInputSchema } from "./task";
import { timeBlockInputSchema } from "./time-block";

describe("server date and time validation", () => {
  it("rejects impossible calendar dates across mutation schemas", () => {
    expect(projectInputSchema.safeParse({ name: "P", description: "", icon: "", areaId: "", startDate: "2026-02-30", targetDate: "" }).success).toBe(false);
    expect(taskInputSchema.safeParse({ title: "T", description: "", projectId: "", deadlineDate: "2026-13-01", deadlineTime: "", priority: "MEDIUM", estimatedMinutes: "" }).success).toBe(false);
    expect(timeBlockInputSchema.safeParse({ title: "B", taskId: "", date: "2026-02-30", startTime: "09:00", endTime: "10:00" }).success).toBe(false);
  });

  it("rejects out-of-range wall-clock times", () => {
    expect(taskInputSchema.safeParse({ title: "T", description: "", projectId: "", deadlineDate: "2026-10-01", deadlineTime: "24:00", priority: "MEDIUM", estimatedMinutes: "" }).success).toBe(false);
    expect(eventInputSchema.safeParse({ title: "E", date: "2026-10-01", startTime: "09:99", endTime: "10:00", location: "", notes: "", recurring: false, interval: 1, daysOfWeek: [], until: "" }).success).toBe(false);
    expect(reviewItemInputSchema.safeParse({ taskId: "11111111-1111-4111-8111-111111111111", action: "RESCHEDULE", date: "2026-10-01", startTime: "25:00", endTime: "26:00" }).success).toBe(false);
  });
});
