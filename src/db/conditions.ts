import { db } from "./db";
import type { Condition } from "../types/condition";
import { nowIso } from "../utils/date";
import { uuid } from "../utils/uuid";

export async function saveCondition(input: Pick<Condition, "name" | "nextConsultationNote">, id?: string) {
  const now = nowIso();
  if (id) {
    const existing = await db.conditions.get(id);
    if (!existing) throw new Error("病気が見つかりません");
    const condition: Condition = { ...existing, ...input, updatedAt: now };
    await db.conditions.put(condition);
    return condition;
  }
  const condition: Condition = { id: uuid(), ...input, createdAt: now, updatedAt: now };
  await db.conditions.add(condition);
  return condition;
}

export async function saveConditionName(name: string, id?: string) {
  if (id) {
    const existing = await db.conditions.get(id);
    return saveCondition({ name, nextConsultationNote: existing?.nextConsultationNote || "" }, id);
  }
  return saveCondition({ name, nextConsultationNote: "" });
}

export async function saveConsultationNote(id: string, nextConsultationNote: string) {
  const existing = await db.conditions.get(id);
  if (!existing) throw new Error("病気が見つかりません");
  return saveCondition({ name: existing.name, nextConsultationNote }, id);
}

export async function deleteCondition(id: string) {
  await db.transaction("rw", db.conditions, db.records, async () => {
    await db.records.where("conditionId").equals(id).delete();
    await db.conditions.delete(id);
  });
}

export async function touchCondition(id: string) {
  await db.conditions.update(id, { updatedAt: nowIso() });
}
