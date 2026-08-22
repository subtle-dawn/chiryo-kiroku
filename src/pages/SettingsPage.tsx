import { ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Header } from "../components/Header";
import { db } from "../db/db";
import { exportBackup } from "../services/backup";
import { restoreBackup } from "../services/restore";

export function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function deleteAll() {
    await db.transaction("rw", db.conditions, db.records, async () => {
      await db.records.clear();
      await db.conditions.clear();
    });
    navigate("/");
  }

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    setError("");

    if (!window.confirm("現在のデータをバックアップデータで置き換えます。続行しますか？")) {
      event.target.value = "";
      return;
    }

    try {
      await restoreBackup(file, "replace");
      setMessage("バックアップデータを取り込みました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "バックアップデータを取り込めませんでした。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="page">
      <Header title="設定" backTo="/" />
      <div className="settings-stack">
        <section className="panel">
          <h2>このアプリについて</h2>
          <p>病気ごとの治療経過を、症状・通院・検査の時系列で振り返るための個人用アプリです。</p>
        </section>
        <section className="panel">
          <h2>データ保存について</h2>
          <p>記録したデータは、この端末のブラウザ内に保存されます。サーバーへ治療記録を送信しません。</p>
          <p>同じ端末を使える人には記録を見られる可能性があります。ブラウザデータを削除すると記録も消える可能性があります。</p>
        </section>
        <button className="primary-button" type="button" onClick={exportBackup}>
          データをバックアップする
        </button>
        <button className="import-button full-width-button" type="button" onClick={() => fileInputRef.current?.click()}>
          バックアップデータを取り込む
        </button>
        <input ref={fileInputRef} className="visually-hidden-file" type="file" accept="application/json,.json" onChange={onImport} />
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <button className="danger-button full-width-button" type="button" onClick={() => setConfirming(true)}>
          全データを削除
        </button>
      </div>
      {confirming && (
        <ConfirmDialog
          title="全データを削除しますか？"
          body="病気と記録がすべて削除されます。必要な場合は先にバックアップしてください。"
          onCancel={() => setConfirming(false)}
          onConfirm={deleteAll}
        />
      )}
    </main>
  );
}
