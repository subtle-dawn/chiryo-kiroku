interface Props {
  note: string;
}

export function ConsultationNote({ note }: Props) {
  return (
    <section className="note-panel">
      {note.trim() ? <p className="preline">{note}</p> : <p className="muted">無し</p>}
    </section>
  );
}
