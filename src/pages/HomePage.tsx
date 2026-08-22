import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { ConditionCard } from "../components/ConditionCard";
import { Header } from "../components/Header";
import { db } from "../db/db";

export function HomePage() {
  const navigate = useNavigate();
  const conditions = useLiveQuery(() => db.conditions.orderBy("updatedAt").reverse().toArray(), []);

  return (
    <main className="page">
      <Header
        title="病気一覧"
        showBack={false}
        action={
          <Link className="small-button" to="/settings">
            設定
          </Link>
        }
      />

      {!conditions ? (
        <p className="empty">読み込み中です。</p>
      ) : conditions.length ? (
        <section className="card-list" aria-label="病気一覧">
          {conditions.map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>まだ病気が登録されていません。</h2>
          <p>病気ごとに、症状・通院・検査・相談したいことをまとめられます。</p>
        </section>
      )}

      <button className="floating-action" type="button" onClick={() => navigate("/condition/new")}>
        病気を追加
      </button>
    </main>
  );
}
