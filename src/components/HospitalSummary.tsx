interface Props {
  hospitalNames: string[];
}

export function HospitalSummary({ hospitalNames }: Props) {
  const latestHospitalName = hospitalNames[0];

  return (
    <section className="note-panel hospital-summary">
      {latestHospitalName ? <p className="hospital-latest">{latestHospitalName}</p> : <p className="muted">無し</p>}
    </section>
  );
}
