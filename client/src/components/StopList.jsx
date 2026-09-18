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
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Stops
      </label>
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
          className="mt-1 rounded border border-dashed border-gray-300 py-1.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add stop
        </button>
      )}
    </div>
  );
}
