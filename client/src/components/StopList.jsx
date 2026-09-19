import { AddressInput } from './AddressInput';

export function StopList({ stops, onChange }) {
  function update(index, value) {
    const next = stops.map((s, i) => (i === index ? value : s));
    onChange(next);
  }

  function add() {
    if (stops.length < 25) onChange([...stops, '']);
  }

  function remove(index) {
    onChange(stops.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="ml-label">Stops</label>
      {stops.map((stop, i) => (
        <AddressInput
          key={i}
          value={stop}
          onChange={(val) => update(i, val)}
          placeholder={i === 0 ? 'Starting point' : i === stops.length - 1 ? 'Destination' : `Stop ${i + 1}`}
          canRemove={stops.length > 2}
          onRemove={() => remove(i)}
        />
      ))}
      {stops.length < 25 && (
        <button
          type="button"
          onClick={add}
          className="mt-1 rounded py-1.5 text-sm transition-colors"
          style={{ border: '1px dashed var(--ml-border)', color: 'var(--ml-muted)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--ml-accent-fg)'; e.currentTarget.style.color = 'var(--ml-accent-fg)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ml-border)'; e.currentTarget.style.color = 'var(--ml-muted)'; }}
        >
          + Add stop
        </button>
      )}
    </div>
  );
}
