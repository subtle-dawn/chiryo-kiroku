import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConsultationNote } from "../components/ConsultationNote";
import { Header } from "../components/Header";
import { HospitalSummary } from "../components/HospitalSummary";
import { Timeline } from "../components/Timeline";
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

export function ConditionPage() {
  const { conditionId = "" } = useParams();
  const navigate = useNavigate();
  const condition = useLiveQuery(() => db.conditions.get(conditionId), [conditionId]);
  const records = useLiveQuery(() => db.records.where("conditionId").equals(conditionId).toArray(), [conditionId]);
  const conditionRecords = records || [];
  const hospitalNames = getHospitalNames(conditionRecords);

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
      <Header
        title={condition.name}
        backTo="/"
        action={
          <Link className="small-button" to={`/condition/${conditionId}/edit`}>
            編集
          </Link>
        }
      />
      <div className="section-title-row">
        <h2>主にかかっている病院</h2>
        {hospitalNames.length > 1 && (
          <Link className="small-button" to={`/condition/${conditionId}/hospitals`}>
            もっと見る
          </Link>
        )}
      </div>
      <HospitalSummary hospitalNames={hospitalNames} />
      <div className="section-title-row">
        <h2>次に相談すること</h2>
        <button className="small-button" type="button" onClick={() => navigate(`/condition/${conditionId}/consultation-note/edit`)}>
          編集
        </button>
      </div>
      <ConsultationNote note={condition.nextConsultationNote} />
      <div className="section-title-row">
        <h2>治療経過</h2>
      </div>
      <Timeline records={conditionRecords} />
      <Link className="floating-action" to={`/condition/${conditionId}/record/new`}>
        記録を追加
      </Link>
    </main>
  );
}
