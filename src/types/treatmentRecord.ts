export type RecordType = "symptom" | "visit" | "test";

export interface RecordPhoto {
  id: string;
  name: string;
  dataUrl: string;
}

export interface TreatmentRecord {
  id: string;
  conditionId: string;
  type: RecordType;
  date: string;
  body: string;
  photos?: RecordPhoto[];
  hospitalName?: string;
  details?: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
}
