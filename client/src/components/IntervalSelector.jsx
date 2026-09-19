const OPTIONS = [
  { value: 5,   label: 'Every 5 min' },
  { value: 15,  label: 'Every 15 min' },
  { value: 30,  label: 'Every 30 min' },
  { value: 60,  label: 'Every 1 hour' },
  { value: 90,  label: 'Every 90 min' },
  { value: 120, label: 'Every 2 hours' },
];

export function IntervalSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="ml-label">Auto waypoints</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ml-input"
        style={{ cursor: 'pointer' }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
