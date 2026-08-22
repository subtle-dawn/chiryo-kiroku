import { db } from "../db/db";

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  conditions: unknown[];
  records: unknown[];
}

export async function exportBackup() {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    conditions: await db.conditions.toArray(),
    records: await db.records.toArray()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `治療記録_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
