import { getRecordTypeLabel } from "../db/records";
import type { RecordType } from "../types/treatmentRecord";

export function RecordTypeBadge({ type }: { type: RecordType }) {
  return <span className={`badge badge-${type}`}>{getRecordTypeLabel(type)}</span>;
}
