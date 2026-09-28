import { db } from "@/lib/db/client";
import type { AreaInput } from "@/lib/validation/area";

export async function createArea(userId: string, input: AreaInput) {
  const last = await db.area.aggregate({ where: { userId, deletedAt: null }, _max: { position: true } });
  return db.area.create({ data: { userId, name: input.name, icon: input.icon, position: (last._max.position ?? -1) + 1 } });
}

export async function updateArea(userId: string, areaId: string, input: AreaInput) {
  const result = await db.area.updateMany({
    where: { id: areaId, userId, deletedAt: null },
    data: { name: input.name, icon: input.icon },
  });
  return result.count === 1;
}

export async function deleteArea(userId: string, areaId: string) {
  return db.$transaction(async (tx) => {
    const area = await tx.area.updateMany({ where: { id: areaId, userId, deletedAt: null }, data: { deletedAt: new Date() } });
    if (area.count !== 1) return false;
    await tx.project.updateMany({ where: { areaId, userId }, data: { areaId: null } });
    return true;
  });
}

export async function restoreArea(userId: string, areaId: string) {
  const result = await db.area.updateMany({ where: { id: areaId, userId, deletedAt: { not: null } }, data: { deletedAt: null } });
  return result.count === 1;
}
