import { db } from "@/lib/db/client";

export function getAreas(userId: string) {
  return db.area.findMany({ where: { userId, deletedAt: null }, orderBy: [{ position: "asc" }, { name: "asc" }], include: { _count: { select: { projects: { where: { deletedAt: null } } } } } });
}
