import { touchCondition } from "./conditions";
import { db } from "./db";
import type { RecordType, TreatmentRecord } from "../types/treatmentRecord";
import { nowIso } from "../utils/date";
import { uuid } from "../utils/uuid";

export const recordTypeLabels: Record<RecordType, string> = {
  symptom: "症状",
  visit: "通院",
  test: "検査"
};

export const recordTypes: RecordType[] = ["symptom", "visit", "test"];

export function isRecordType(value: string | undefined): value is RecordType {
  return value === "symptom" || value === "visit" || value === "test";
}

export function getRecordTypeLabel(type: string) {
  return recordTypeLabels[type as RecordType] || type;
}

export async function saveRecord(input: Omit<TreatmentRecord, "id" | "createdAt" | "updatedAt">, id?: string) {
  const now = nowIso();
  if (id) {
    const existing = await db.records.get(id);
    if (!existing) throw new Error("記録が見つかりません");
    const record: TreatmentRecord = { ...existing, ...input, updatedAt: now };
    await db.records.put(record);
    await touchCondition(record.conditionId);
    if (existing.conditionId !== record.conditionId) {
      await touchCondition(existing.conditionId);
    }
    return record;
  }
  const record: TreatmentRecord = { id: uuid(), ...input, createdAt: now, updatedAt: now };
  await db.records.add(record);
  await touchCondition(record.conditionId);
  return record;
}

export async function deleteRecord(record: TreatmentRecord) {
  await db.records.delete(record.id);
  await touchCondition(record.conditionId);
}

export function sortRecords(records: TreatmentRecord[]) {
  return [...records].sort((a, b) => {
    const av = `${a.date}|${a.createdAt}`;
    const bv = `${b.date}|${b.createdAt}`;
    return bv.localeCompare(av);
  });
}
