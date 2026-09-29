import { db } from "@/lib/db/client";
import { reviewDateValue } from "@/server/services/daily-review-service";

export function getDailyReviewByDate(userId: string, date: string) { return db.dailyReview.findUnique({ where: { userId_reviewDate: { userId, reviewDate: reviewDateValue(date) } }, select: { id: true } }); }
export function getDailyReviewHistory(userId: string) { return db.dailyReview.findMany({ where: { userId }, orderBy: [{ reviewDate: "desc" }, { id: "desc" }], select: { id: true, reviewDate: true, completedTaskCount: true, unfinishedTaskCount: true, reflection: true } }); }
export function getDailyReviewDetail(userId: string, id: string) { return db.dailyReview.findFirst({ where: { id, userId }, include: { items: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } } }); }
