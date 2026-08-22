import { FormEvent, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { saveConsultationNote } from "../db/conditions";
import { db } from "../db/db";

export function ConsultationNoteEditPage() {
  const { conditionId = "" } = useParams();
  const navigate = useNavigate();
  const condition = useLiveQuery(() => db.conditions.get(conditionId), [conditionId]);
  const [nextConsultationNote, setNextConsultationNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (condition) {
      setNextConsultationNote(condition.nextConsultationNote);
    }
  }, [condition]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await saveConsultationNote(conditionId, nextConsultationNote.trim());
      navigate(`/condition/${conditionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存できませんでした。");
    }
  }

  return (
    <main className="page">
      <Header title="次に相談すること" backTo={`/condition/${conditionId}`} />
      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>次に相談すること</span>
          <textarea
            rows={10}
            value={nextConsultationNote}
            onChange={(event) => setNextConsultationNote(event.target.value)}
            placeholder="例: 漢方を飲んだら悪化した"
            autoFocus
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-button" type="submit">
          保存
        </button>
      </form>
    </main>
  );
}
