import { FormEvent, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Header } from "../components/Header";
import { deleteCondition, saveConditionName } from "../db/conditions";
import { db } from "../db/db";

export function ConditionEditPage() {
  const { conditionId } = useParams();
  const navigate = useNavigate();
  const condition = useLiveQuery(() => (conditionId ? db.conditions.get(conditionId) : undefined), [conditionId]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (condition) {
      setName(condition.name);
    }
  }, [condition]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("病気の名前を入力してください。");
      return;
    }
    try {
      setError("");
      const saved = await saveConditionName(name.trim(), conditionId);
      navigate(`/condition/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存できませんでした。");
    }
  }

  async function onDelete() {
    if (!conditionId) return;
    await deleteCondition(conditionId);
    navigate("/");
  }

  return (
    <main className="page">
      <Header title={conditionId ? "病気を編集" : "病気を追加"} backTo={conditionId ? `/condition/${conditionId}` : "/"} />
      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>病気の名前</span>
          <input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary-button" type="submit">
          保存
        </button>
        {conditionId && (
          <button className="danger-button full-width-button" type="button" onClick={() => setConfirming(true)}>
            病気を削除
          </button>
        )}
      </form>
      {confirming && condition && (
        <ConfirmDialog
          title={`「${condition.name}」を削除します。`}
          body="この病気に登録されているすべての記録も削除されます。この操作は元に戻せません。"
          onCancel={() => setConfirming(false)}
          onConfirm={onDelete}
        />
      )}
    </main>
  );
}
