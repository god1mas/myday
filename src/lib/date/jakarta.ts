const OFFSET_MS = 7 * 60 * 60 * 1000;
export function jakartaDateTime(date: string, time: string) { return new Date(`${date}T${time}:00+07:00`); }
export function jakartaDate(date = new Date()) { return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 10); }
export function jakartaDayRange(date: string) { return { start: jakartaDateTime(date, "00:00"), end: new Date(jakartaDateTime(date, "00:00").getTime() + 24 * 60 * 60 * 1000) }; }
export function jakartaInputParts(date: Date) { const shifted = new Date(date.getTime() + OFFSET_MS).toISOString(); return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) }; }
export function addJakartaDays(date: string, days: number) { const start = jakartaDateTime(date, "00:00"); return jakartaDate(new Date(start.getTime() + days * 86400000)); }
