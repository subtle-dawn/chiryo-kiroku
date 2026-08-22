import { ChangeEvent, useState } from "react";
import { Header } from "../components/Header";
import { exportBackup } from "../services/backup";
import { restoreBackup } from "../services/restore";

export function BackupPage() {
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    if (mode === "replace" && !window.confirm("現在のデータを置き換えます。続行しますか？")) {
      event.target.value = "";
      return;
    }
    try {
      await restoreBackup(file, mode);
      setMessage("復元しました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "復元できませんでした。");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="page">
      <Header title="バックアップ" backTo="/" />
      <section className="stack">
        <button className="primary-button" type="button" onClick={exportBackup}>
          JSONを書き出す
        </button>
        <div className="panel">
          <h2>JSONから復元</h2>
          <fieldset className="segmented">
            <label>
              <input type="radio" name="restoreMode" checked={mode === "merge"} onChange={() => setMode("merge")} />
              追加する
            </label>
            <label>
              <input type="radio" name="restoreMode" checked={mode === "replace"} onChange={() => setMode("replace")} />
              置き換える
            </label>
          </fieldset>
          <input type="file" accept="application/json,.json" onChange={onImport} />
        </div>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
