import { useLiveQuery } from "dexie-react-hooks";
import { Header } from "../components/Header";
import { TimelineItem } from "../components/TimelineItem";
import { db } from "../db/db";
import { sortRecords } from "../db/records";

export function AllRecordsPage() {
  const conditions = useLiveQuery(() => db.conditions.toArray(), []);
  const records = useLiveQuery(() => db.records.toArray(), []);
  const sortedRecords = sortRecords(records || []);
  const conditionNameById = new Map((conditions || []).map((condition) => [condition.id, condition.name]));

  return (
    <main className="page">
      <Header title="全ての病気の記録" backTo="/" />
      {sortedRecords.length ? (
        <div className="timeline">
          {sortedRecords.map((record, index) => (
            <TimelineItem
              key={record.id}
              record={record}
              showDate={index === 0 || sortedRecords[index - 1].date !== record.date}
              conditionName={conditionNameById.get(record.conditionId) || "不明な病気"}
            />
          ))}
        </div>
      ) : (
        <p className="empty">まだ記録がありません。</p>
      )}
    </main>
  );
}
