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
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Auto waypoints
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
