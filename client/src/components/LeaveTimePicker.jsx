export function LeaveTimePicker({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="ml-label">Leave at</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-input"
      />
    </div>
  );
}
