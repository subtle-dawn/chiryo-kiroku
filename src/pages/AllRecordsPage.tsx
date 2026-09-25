import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { TimelineItem } from "../components/TimelineItem";
import { db } from "../db/db";
import { recordTypeLabels, recordTypes, sortRecords } from "../db/records";
import type { RecordType } from "../types/treatmentRecord";

export function AllRecordsPage() {
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>(() => [...recordTypes]);
  const conditions = useLiveQuery(() => db.conditions.toArray(), []);
  const records = useLiveQuery(() => db.records.toArray(), []);
  const sortedRecords = sortRecords((records || []).filter((record) => selectedTypes.includes(record.type)));
  const conditionNameById = new Map((conditions || []).map((condition) => [condition.id, condition.name]));

  return (
    <main className="page">
      <Header title="全ての病気の記録" backTo="/" action={
        <Link className="small-button" to="/records/calendar">
          カレンダー
        </Link>
      } />
      <fieldset className="record-type-filter">
        <legend>表示する記録</legend>
        {recordTypes.map((type) => (
          <label key={type}>
            <input type="checkbox" checked={selectedTypes.includes(type)} onChange={(event) => {
              const checked = event.target.checked;
              setSelectedTypes((current) => checked ? [...current, type] : current.filter((item) => item !== type));
            }} />
            <span>{recordTypeLabels[type]}</span>
          </label>
        ))}
      </fieldset>
      {!records ? <p className="empty">読み込み中です。</p> : sortedRecords.length ? (
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
        <p className="empty" role="status">{!selectedTypes.length
          ? "表示する記録の種類を選択してください。"
          : !records.length ? "まだ記録がありません。" : "選択した種類の記録はありません。"}</p>
      )}
    </main>
  );
}
