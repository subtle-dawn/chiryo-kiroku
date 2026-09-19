import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { TimelineItem } from "../components/TimelineItem";
import { db } from "../db/db";
import { sortRecords } from "../db/records";

export function HospitalRecordsPage() {
  const location = useLocation();
  // Keep the hospital name out of the URL, as with other medical information.
  const hospitalName = location.pathname === "/hospitals/records" &&
    typeof location.state?.hospitalName === "string"
    ? location.state.hospitalName as string
    : undefined;
  const data = useLiveQuery(async () => {
    const [conditions, records] = await Promise.all([
      db.conditions.toArray(),
      db.records.toArray()
    ]);
    return {
      conditionNames: new Map(conditions.map((condition) => [condition.id, condition.name])),
      records: sortRecords(records.filter((record) =>
        (record.type === "visit" || record.type === "test") && record.hospitalName?.trim()
      ))
    };
  }, []);
  const hospitalNames = [...new Set(data?.records.map((record) => record.hospitalName!.trim()))];
  const records = data?.records.filter((record) => record.hospitalName?.trim() === hospitalName) || [];

  return (
    <main className="page">
      <Header title={hospitalName || "病院一覧"} backTo={hospitalName ? "/hospitals" : "/"} />
      {!data ? (
        <p className="empty">読み込み中です。</p>
      ) : hospitalName ? (
        <>
          {records.length ? (
            <div className="timeline">
              {records.map((record, index) => (
                <TimelineItem
                  key={record.id}
                  record={record}
                  showDate={index === 0 || records[index - 1].date !== record.date}
                  conditionName={data.conditionNames.get(record.conditionId) || "不明な病気"}
                />
              ))}
            </div>
          ) : (
            <p className="empty">この病院の通院・検査記録はありません。</p>
          )}
        </>
      ) : hospitalNames.length ? (
        <section className="card-list" aria-label="病院一覧">
          {hospitalNames.map((name) => (
            <Link key={name} className="condition-card" to="/hospitals/records" state={{ hospitalName: name }}>
              <h2>{name}</h2>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>まだ病院が登録されていません。</h2>
          <p>通院・検査記録に病院名を入力すると、ここに表示されます。</p>
        </section>
      )}
    </main>
  );
}
