import { useRef, useState } from "react";
import type { RecordPhoto } from "../types/treatmentRecord";

export function RecordPhotos({ photos = [], onRemove, disabled = false }: {
  photos?: RecordPhoto[];
  onRemove?: (id: string) => void;
  disabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<RecordPhoto>();
  if (!photos.length) return null;
  return (
    <>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <div className="photo-item" key={photo.id}>
            <button type="button" className="photo-thumbnail" aria-label={`写真${index + 1}を拡大：${photo.name}`}
              onClick={() => { setSelected(photo); dialog.current?.showModal(); }}>
              <img src={photo.dataUrl} alt={photo.name} loading="lazy" />
            </button>
            {onRemove && <button type="button" className="secondary-button" disabled={disabled}
              aria-label={`写真${index + 1}を削除：${photo.name}`} onClick={() => onRemove(photo.id)}>削除</button>}
          </div>
        ))}
      </div>
      <dialog ref={dialog} className="photo-dialog" aria-label="添付写真">
        <button type="button" className="secondary-button" autoFocus onClick={() => dialog.current?.close()}>閉じる</button>
        {selected && <img src={selected.dataUrl} alt={selected.name} />}
      </dialog>
    </>
  );
}
