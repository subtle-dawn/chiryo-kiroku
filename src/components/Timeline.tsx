import { TimelineItem } from "./TimelineItem";
import { sortRecords } from "../db/records";
import type { TreatmentRecord } from "../types/treatmentRecord";

export function Timeline({ records }: { records: TreatmentRecord[] }) {
  const sorted = sortRecords(records);

  if (!sorted.length) {
    return <p className="empty">なし</p>;
  }

  return (
    <div className="timeline">
      {sorted.map((record, index) => (
        <TimelineItem key={record.id} record={record} showDate={index === 0 || sorted[index - 1].date !== record.date} />
      ))}
    </div>
  );
}
