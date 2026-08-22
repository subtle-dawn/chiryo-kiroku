export type RecordType = "symptom" | "visit" | "test";

export interface TreatmentRecord {
  id: string;
  conditionId: string;
  type: RecordType;
  date: string;
  body: string;
  hospitalName?: string;
  details?: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
}
