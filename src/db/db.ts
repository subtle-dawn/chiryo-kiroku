import Dexie, { type Table } from "dexie";
import type { Condition } from "../types/condition";
import type { TreatmentRecord } from "../types/treatmentRecord";

export class TreatmentDatabase extends Dexie {
  conditions!: Table<Condition>;
  records!: Table<TreatmentRecord>;

  constructor() {
    super("treatment-record");
    this.version(1).stores({
      conditions: "id, name, updatedAt",
      records: "id, conditionId, type, date, createdAt"
    });
  }
}

export const db = new TreatmentDatabase();
