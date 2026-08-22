import { db } from "../db/db";
import type { Condition } from "../types/condition";
import type { TreatmentRecord } from "../types/treatmentRecord";

interface RestorePayload {
  version: number;
  conditions: Condition[];
  records: TreatmentRecord[];
}

function assertBackupPayload(value: unknown): asserts value is RestorePayload {
  if (!value || typeof value !== "object") throw new Error("JSONの形式が正しくありません。");
  const payload = value as Partial<RestorePayload>;
  if (payload.version !== 1 || !Array.isArray(payload.conditions) || !Array.isArray(payload.records)) {
    throw new Error("バックアップファイルとして読み込めません。");
  }
}

export async function restoreBackup(file: File, mode: "replace" | "merge") {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  assertBackupPayload(parsed);

  await db.transaction("rw", db.conditions, db.records, async () => {
    if (mode === "replace") {
      await db.records.clear();
      await db.conditions.clear();
    }
    await db.conditions.bulkPut(parsed.conditions);
    await db.records.bulkPut(parsed.records);
  });
}
