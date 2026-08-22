import { FormEvent, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Header } from "../components/Header";
import { db } from "../db/db";
import { deleteRecord, recordTypeLabels, recordTypes, saveRecord } from "../db/records";
import type { RecordType } from "../types/treatmentRecord";
import { todayIsoDate } from "../utils/date";

export function RecordEditPage() {
  const { conditionId = "", recordId } = useParams();
  const navigate = useNavigate();
  const record = useLiveQuery(() => (recordId ? db.records.get(recordId) : undefined), [recordId]);
  const hospitalNameOptions =
    useLiveQuery(async () => {
      const records = await db.records.toArray();
      return [...new Set(records.map((item) => item.hospitalName?.trim()).filter((name): name is string => Boolean(name)))].sort((a, b) =>
        a.localeCompare(b, "ja")
      );
    }, []) || [];
  const [type, setType] = useState<RecordType>("symptom");
  const needsHospitalName = type === "visit" || type === "test";
  const [date, setDate] = useState(todayIsoDate());
  const [body, setBody] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (record) {
      setType(record.type);
      setDate(record.date);
      setBody(record.body);
      setHospitalName(record.hospitalName || "");
    }
  }, [record]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date || !body.trim()) {
      setError("日付と本文を入力してください。");
      return;
    }
    try {
      setError("");
      await saveRecord(
        {
          conditionId,
          type,
          date,
          body: body.trim(),
          hospitalName: needsHospitalName ? hospitalName.trim() || undefined : undefined
        },
        recordId
      );
      navigate(`/condition/${conditionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存できませんでした。");
    }
  }

  async function onDelete() {
    if (!record) return;
    await deleteRecord(record);
    navigate(`/condition/${conditionId}`);
  }

  return (
    <main className="page">
      <Header title={recordId ? "記録を編集" : "記録を追加"} backTo={`/condition/${conditionId}`} />
      <form className="form" onSubmit={onSubmit}>
        <fieldset className="radio-group">
          <legend>種類</legend>
          {recordTypes.map((recordType) => (
            <label key={recordType}>
              <input type="radio" name="recordType" value={recordType} checked={type === recordType} onChange={() => setType(recordType)} />
              <span>{recordTypeLabels[recordType]}</span>
            </label>
          ))}
        </fieldset>
        <label>
          <span>日付</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        {needsHospitalName && (
          <label>
            <span>病院名</span>
            <input list="hospital-name-options" value={hospitalName} onChange={(event) => setHospitalName(event.target.value)} />
            <datalist id="hospital-name-options">
              {hospitalNameOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
        )}
        <label>
          <span>本文</span>
          <textarea rows={9} value={body} onChange={(event) => setBody(event.target.value)} autoFocus />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-button" type="submit">
          保存
        </button>
      </form>
      {recordId && (
        <button className="danger-button full-width-button record-delete-button" type="button" onClick={() => setConfirming(true)}>
          この記録を削除
        </button>
      )}
      {confirming && (
        <ConfirmDialog title="この記録を削除しますか？" body="削除した記録は元に戻せません。" onCancel={() => setConfirming(false)} onConfirm={onDelete} />
      )}
    </main>
  );
}
