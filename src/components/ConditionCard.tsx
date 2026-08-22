import { Link } from "react-router-dom";
import type { Condition } from "../types/condition";

export function ConditionCard({ condition }: { condition: Condition }) {
  return (
    <Link className="condition-card" to={`/condition/${condition.id}`}>
      <div>
        <h2>{condition.name}</h2>
        {condition.nextConsultationNote.trim() ? (
          <p className="line-clamp">{condition.nextConsultationNote}</p>
        ) : (
          <p className="muted">次に相談したいこと無し</p>
        )}
      </div>
    </Link>
  );
}
