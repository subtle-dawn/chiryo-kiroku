export function nowIso() {
  return new Date().toISOString();
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(date: string) {
  if (!date) return "";
  return date.replaceAll("-", "/");
}

export function formatDateTime(date?: string) {
  if (!date) return "未更新";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}
