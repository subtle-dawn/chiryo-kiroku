import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Header } from "../components/Header";
import { db } from "../db/db";
import { deleteRecord, recordTypeLabels, recordTypes, saveRecord } from "../db/records";
import type { RecordPhoto, RecordType } from "../types/treatmentRecord";
import { RecordPhotos } from "../components/RecordPhotos";
import { MAX_PHOTOS, readPhoto } from "../services/photos";
import { todayIsoDate } from "../utils/date";

export function RecordEditPage() {
  const { conditionId = "", recordId } = useParams();
  const navigate = useNavigate();
  const conditions = useLiveQuery(() => db.conditions.orderBy("updatedAt").reverse().toArray(), []);
  const record = useLiveQuery(() => (recordId ? db.records.get(recordId) : undefined), [recordId]);
  const hospitalNameOptions =
    useLiveQuery(async () => {
      const records = await db.records.toArray();
      return [...new Set(records.map((item) => item.hospitalName?.trim()).filter((name): name is string => Boolean(name)))].sort((a, b) =>
        a.localeCompare(b, "ja")
      );
    }, []) || [];
  const [selectedConditionId, setSelectedConditionId] = useState(conditionId);
  const [type, setType] = useState<RecordType>("symptom");
  const needsHospitalName = type === "visit" || type === "test";
  const [date, setDate] = useState(todayIsoDate());
  const [body, setBody] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<RecordPhoto[]>([]);
  const [readingPhotos, setReadingPhotos] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (record) {
      setSelectedConditionId(record.conditionId);
      setType(record.type);
      setDate(record.date);
      setBody(record.body);
      setPhotos(record.photos || []);
      setHospitalName(record.hospitalName || "");
    }
  }, [record]);

  useEffect(() => {
    if (!selectedConditionId && conditions?.[0]) {
      setSelectedConditionId(conditions[0].id);
    }
  }, [conditions, selectedConditionId]);

  async function onPhotosChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || busy.current) return;
    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`写真は1つの記録に${MAX_PHOTOS}枚まで添付できます。`);
      return;
    }
    busy.current = true;
    setReadingPhotos(true);
    setError("");
    try {
      const added: RecordPhoto[] = [];
      for (const file of files) added.push(await readPhoto(file));
      setPhotos((current) => [...current, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "写真を読み込めませんでした。");
    } finally {
      busy.current = false;
      setReadingPhotos(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    if (!selectedConditionId) {
      setError("病気を選択してください。");
      return;
    }
    if (!date || !body.trim()) {
      setError("日付と本文を入力してください。");
      return;
    }
    try {
      busy.current = true;
      setSaving(true);
      setError("");
      await saveRecord(
        {
          conditionId: selectedConditionId,
          type,
          date,
          body: body.trim(),
          photos,
          hospitalName: needsHospitalName ? hospitalName.trim() || undefined : undefined
        },
        recordId
      );
      navigate(`/condition/${selectedConditionId}`);
    } catch (err) {
      setError(err instanceof Error && err.name === "QuotaExceededError"
        ? "端末の保存容量が不足しています。添付写真を減らすか、小さい写真を選択してください。"
        : err instanceof Error ? err.message : "保存できませんでした。");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!record) return;
    await deleteRecord(record);
    navigate(`/condition/${record.conditionId}`);
  }

  return (
    <main className="page">
      <Header title={recordId ? "記録を編集" : "記録を追加"} backTo={`/condition/${selectedConditionId || conditionId}`} />
      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>病気</span>
          <select value={selectedConditionId} onChange={(event) => setSelectedConditionId(event.target.value)}>
            {(conditions || []).map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.name}
              </option>
            ))}
          </select>
        </label>
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
        <label>
          <span>写真（任意・{photos.length}/{MAX_PHOTOS}枚）</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPhotosChange}
            disabled={readingPhotos || saving || photos.length >= MAX_PHOTOS} aria-describedby="photo-help" />
        </label>
        <RecordPhotos photos={photos} disabled={readingPhotos || saving}
          onRemove={(id) => setPhotos((current) => current.filter((photo) => photo.id !== id))} />
        {readingPhotos && <p role="status">写真を読み込み中…</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={readingPhotos || saving}>
          {saving ? "保存中…" : "保存"}
        </button>
      </form>
      {recordId && (
        <button className="danger-button full-width-button record-delete-button" type="button" disabled={readingPhotos || saving} onClick={() => setConfirming(true)}>
          この記録を削除
        </button>
      )}
      {confirming && (
        <ConfirmDialog title="この記録を削除しますか？" body="削除した記録は元に戻せません。" onCancel={() => setConfirming(false)} onConfirm={onDelete} />
      )}
    </main>
  );
}
