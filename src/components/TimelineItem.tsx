import { Link } from "react-router-dom";
import { RecordTypeBadge } from "./RecordTypeBadge";
import type { TreatmentRecord } from "../types/treatmentRecord";
import { formatDate } from "../utils/date";

interface Props {
  record: TreatmentRecord;
  showDate: boolean;
}

export function TimelineItem({ record, showDate }: Props) {
  return (
    <article className={`timeline-item timeline-item-${record.type}`}>
      <div className="timeline-date" aria-hidden={!showDate}>
        {showDate && <strong>{formatDate(record.date)}</strong>}
      </div>
      <div className="timeline-body">
        <div className="timeline-heading">
          <RecordTypeBadge type={record.type} />
          <Link className="text-button" to={`/condition/${record.conditionId}/record/${record.id}/edit`}>
            編集
          </Link>
        </div>
        {record.hospitalName && <p className="timeline-hospital">{record.hospitalName}</p>}
        <p className="preline">{record.body}</p>
      </div>
    </article>
  );
}
