import { z } from "zod";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isCalendarDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export const requiredDate = z.string().refine(isCalendarDate, "Tanggal tidak valid.");
export const optionalDate = z.string().refine((value) => value === "" || isCalendarDate(value), "Tanggal tidak valid.");
export const requiredTime = z.string().regex(TIME_PATTERN, "Waktu tidak valid.");
export const optionalTime = z.string().refine((value) => value === "" || TIME_PATTERN.test(value), "Waktu tidak valid.");
