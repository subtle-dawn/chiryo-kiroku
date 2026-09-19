import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Header } from "../components/Header";
import { TimelineItem } from "../components/TimelineItem";
import { db } from "../db/db";
import { recordTypeLabels, recordTypes, sortRecords } from "../db/records";
import type { TreatmentRecord } from "../types/treatmentRecord";
import { formatDate } from "../utils/date";

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function RecordsCalendarPage() {
  const today = localDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const year = Number(selectedDate.slice(0, 4));
  const month = Number(selectedDate.slice(5, 7)) - 1;
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const data = useLiveQuery(async () => {
    const [conditions, records] = await Promise.all([db.conditions.toArray(), db.records.toArray()]);
    const recordsByDate = new Map<string, TreatmentRecord[]>();
    for (const record of sortRecords(records)) {
      const dayRecords = recordsByDate.get(record.date) || [];
      dayRecords.push(record);
      recordsByDate.set(record.date, dayRecords);
    }
    return {
      recordsByDate,
      conditionNames: new Map(conditions.map((condition) => [condition.id, condition.name]))
    };
  }, []);
  const selectedRecords = data?.recordsByDate.get(selectedDate) || [];

  function changeMonth(offset: number) {
    setSelectedDate(localDate(new Date(year, month + offset, 1)));
  }

  return (
    <main className="page">
      <Header title="記録カレンダー" backTo="/records" />
      <section className="calendar" aria-label="記録カレンダー">
        <div className="calendar-toolbar">
          <button className="icon-button" type="button" onClick={() => changeMonth(-1)} aria-label="前の月">＜</button>
          <h2 aria-live="polite">{year}年{month + 1}月</h2>
          <button className="icon-button" type="button" onClick={() => changeMonth(1)} aria-label="次の月">＞</button>
          <button className="small-button" type="button" onClick={() => setSelectedDate(today)}>今日</button>
        </div>
        <div className="calendar-grid">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="calendar-weekday" aria-hidden="true">{day}</div>
          ))}
          {Array.from({ length: cellCount }, (_, index) => {
            const day = index - firstWeekday + 1;
            if (day < 1 || day > daysInMonth) return <div key={index} aria-hidden="true" />;
            const date = localDate(new Date(year, month, day));
            const dayRecords = data?.recordsByDate.get(date) || [];
            const counts = recordTypes.map((type) => ({
              type,
              count: dayRecords.filter((record) => record.type === type).length
            })).filter(({ count }) => count > 0);
            const summary = counts.map(({ type, count }) => `${recordTypeLabels[type]}${count}件`).join("、");
            return (
              <button
                key={index}
                type="button"
                className="calendar-day"
                aria-label={`${formatDate(date)}${date === today ? " 今日" : ""}${data ? ` ${summary || "記録なし"}` : ""}`}
                aria-pressed={date === selectedDate}
                aria-current={date === today ? "date" : undefined}
                onClick={() => setSelectedDate(date)}
              >
                <span>{day}</span>
                {counts.map(({ type, count }) => (
                  <span key={type} className={`calendar-count badge-${type}`}>
                    <span>{count}件</span>
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </section>
      <section aria-label="選択した日の記録" aria-live="polite">
        {!data ? <p className="empty">読み込み中です。</p> : selectedRecords.length ? (
          <div className="timeline">
            {selectedRecords.map((record, index) => (
              <TimelineItem key={record.id} record={record} showDate={index === 0}
                conditionName={data.conditionNames.get(record.conditionId) || "不明な病気"} />
            ))}
          </div>
        ) : <p className="empty">この日の記録はありません。</p>}
      </section>
    </main>
  );
}
