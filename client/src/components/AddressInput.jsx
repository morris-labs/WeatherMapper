import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ROUTEMAPPER_API = 'https://morrislabs.app/routemapper/api';
let sessionToken = crypto.randomUUID();

export function AddressInput({ value, onChange, placeholder, onRemove, canRemove }) {
  const [query, setQuery] = useState(value || '');
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Keep internal query in sync when value resets externally.
  useEffect(() => {
    if (value === '') setQuery('');
  }, [value]);

  const fetchPredictions = useCallback(async (input) => {
    if (input.length < 3) { setPredictions([]); return; }
    try {
      const res = await fetch(
        `${ROUTEMAPPER_API}/autocomplete?input=${encodeURIComponent(input)}&sessiontoken=${sessionToken}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch {
      // Silently ignore autocomplete failures.
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 250);
  }

  function positionDropdown() {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }

  function handleSelect(prediction) {
    setQuery(prediction.description);
    setPredictions([]);
    setOpen(false);
    sessionToken = crypto.randomUUID(); // New token after selection per Google billing rules.
    onChange(prediction.description);
  }

  function handleBlur() {
    // Delay so click on a prediction fires before blur closes the dropdown.
    setTimeout(() => setOpen(false), 150);
  }

  function handleFocus() {
    positionDropdown();
    if (predictions.length) setOpen(true);
  }

  return (
    <div className="relative flex items-center gap-1">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Remove stop"
        >
          ✕
        </button>
      )}

      {open && predictions.length > 0 &&
        createPortal(
          <ul
            style={dropdownStyle}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {predictions.map((p) => (
              <li
                key={p.placeId}
                onMouseDown={() => handleSelect(p)}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50"
              >
                <span className="font-medium text-gray-900">{p.primaryText}</span>
                <span className="ml-1 text-gray-500">{p.secondaryText}</span>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
