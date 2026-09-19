import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "react-router-dom";
import { ConsultationNote } from "../components/ConsultationNote";
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
    const sortedRecords = sortRecords(records);
    const primaryHospitalByCondition = new Map<string, string>();
    for (const record of sortedRecords) {
      const name = record.hospitalName?.trim();
      if (name && !primaryHospitalByCondition.has(record.conditionId)) {
        primaryHospitalByCondition.set(record.conditionId, name);
      }
    }
    return {
      conditions,
      primaryHospitalByCondition,
      conditionNames: new Map(conditions.map((condition) => [condition.id, condition.name])),
      records: sortedRecords.filter((record) =>
        (record.type === "visit" || record.type === "test") && record.hospitalName?.trim()
      )
    };
  }, []);
  const hospitalNames = [...new Set(data?.records.map((record) => record.hospitalName!.trim()))];
  const records = data?.records.filter((record) => record.hospitalName?.trim() === hospitalName) || [];
  const hospitalConditions = hospitalName
    ? data?.conditions.filter((condition) => data.primaryHospitalByCondition.get(condition.id) === hospitalName) || []
    : [];

  return (
    <main className="page">
      <Header title={hospitalName || "病院一覧"} backTo={hospitalName ? "/hospitals" : "/"} />
      {!data ? (
        <p className="empty">読み込み中です。</p>
      ) : hospitalName ? (
        <>
          <section aria-labelledby="hospital-consultation-title">
            <div className="section-title-row">
              <h2 id="hospital-consultation-title">次に相談すること</h2>
            </div>
            {hospitalConditions.length ? (
              <div className="stack">
                {hospitalConditions.map((condition) => (
                  <div key={condition.id}>
                    <div className="section-title-row">
                      <Link className="text-button" to={`/condition/${condition.id}`}>{condition.name}</Link>
                    </div>
                    <ConsultationNote note={condition.nextConsultationNote} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">この病院が主にかかっている病院になっている病気はありません。</p>
            )}
          </section>
          <div className="section-title-row">
            <h2>通院・検査記録</h2>
          </div>
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
