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
    // Delay so a click on a prediction fires before blur closes the dropdown.
    setTimeout(() => {
      setOpen(false);
      // Propagate whatever the user typed if they didn't pick a prediction.
      if (query.trim() && query.trim() !== value) {
        onChange(query.trim());
      }
    }, 150);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setOpen(false);
      setPredictions([]);
      if (query.trim()) onChange(query.trim());
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
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
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="ml-input flex-1"
      />
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 rounded p-1 transition-colors"
          style={{ color: 'var(--ml-muted)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--ml-accent-bg)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Remove stop"
        >
          ✕
        </button>
      )}

      {open && predictions.length > 0 &&
        createPortal(
          <ul
            style={dropdownStyle}
            style={{ backgroundColor: 'var(--ml-surface)', border: '1px solid var(--ml-border)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', overflow: 'hidden' }}
            className=""
          >
            {predictions.map((p) => (
              <li
                key={p.placeId}
                onMouseDown={() => handleSelect(p)}
                className="cursor-pointer px-3 py-2 text-sm"
                style={{ color: 'var(--ml-ink)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--ml-accent-bg)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="font-medium">{p.primaryText}</span>
                <span className="ml-1" style={{ color: 'var(--ml-muted)' }}>{p.secondaryText}</span>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
