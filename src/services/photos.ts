import type { RecordPhoto } from "../types/treatmentRecord";
import { uuid } from "../utils/uuid";

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const photoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function readPhoto(file: File): Promise<RecordPhoto> {
  if (!photoTypes.has(file.type)) throw new Error("写真はJPEG・PNG・WebP形式を選択してください。");
  if (!file.size || file.size > MAX_PHOTO_BYTES) throw new Error("写真は1枚10MB以内にしてください。");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("写真を読み込めませんでした。再度選択してください。"));
    reader.readAsDataURL(file);
  });
  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("写真を表示できません。別の画像を選択してください。"));
    image.src = dataUrl;
  });
  return { id: uuid(), name: file.name, dataUrl };
}

export function assertPhotos(value: unknown): asserts value is RecordPhoto[] | undefined {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > MAX_PHOTOS) throw new Error("写真データの形式が正しくありません。");
  const ids = new Set<string>();
  for (const photo of value) {
    if (!photo || typeof photo.id !== "string" || !photo.id || ids.has(photo.id) ||
        typeof photo.name !== "string" || typeof photo.dataUrl !== "string" ||
        photo.dataUrl.length > 4 * Math.ceil(MAX_PHOTO_BYTES / 3) + 32 ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(photo.dataUrl) ||
        photo.dataUrl.slice(photo.dataUrl.indexOf(",") + 1).length % 4 !== 0) {
      throw new Error("写真データの形式が正しくありません。");
    }
    ids.add(photo.id);
  }
}
