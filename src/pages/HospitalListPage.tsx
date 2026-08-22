import { useLiveQuery } from "dexie-react-hooks";
import { useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { db } from "../db/db";
import { sortRecords } from "../db/records";
import type { TreatmentRecord } from "../types/treatmentRecord";

function getHospitalNames(records: TreatmentRecord[]) {
  return [
    ...new Set(
      sortRecords(records)
        .map((record) => record.hospitalName?.trim())
        .filter((name): name is string => Boolean(name))
    )
  ];
}

export function HospitalListPage() {
  const { conditionId = "" } = useParams();
  const condition = useLiveQuery(() => db.conditions.get(conditionId), [conditionId]);
  const records = useLiveQuery(() => db.records.where("conditionId").equals(conditionId).toArray(), [conditionId]);
  const hospitalNames = getHospitalNames(records || []);

  if (!condition) {
    return (
      <main className="page">
        <Header title="治療記録" backTo="/" />
        <p className="empty">病気が見つかりません。</p>
      </main>
    );
  }

  return (
    <main className="page">
      <Header title={`${condition.name}でかかっている病院`} backTo={`/condition/${conditionId}`} />
      {hospitalNames.length ? (
        <section className="panel">
          <ul className="hospital-list hospital-list-page">
            {hospitalNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="empty">無し</p>
      )}
    </main>
  );
}
