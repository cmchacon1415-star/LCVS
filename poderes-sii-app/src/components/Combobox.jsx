import { useState } from 'react';
import { normalize } from '../utils/text';

export default function Combobox({ items, getLabel, getSub, onSelect, placeholder, initialLabel }) {
  const [value, setValue] = useState(initialLabel || '');
  const [open, setOpen] = useState(false);

  const filtered = items
    .filter((it) => normalize(getLabel(it) + ' ' + (getSub ? getSub(it) : '')).includes(normalize(value)))
    .slice(0, 60);

  function handleSelect(item) {
    setValue(getLabel(item));
    setOpen(false);
    onSelect(item);
  }

  return (
    <div className="combobox">
      <input
        type="text"
        className="combobox-input"
        placeholder={placeholder || 'Buscar...'}
        autoComplete="off"
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="combobox-list">
          {filtered.length === 0 && <div className="combobox-empty">Sin resultados</div>}
          {filtered.map((it, i) => (
            <div
              key={i}
              className="combobox-item"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(it); }}
            >
              <span>{getLabel(it)}</span>
              {getSub && <span className="combobox-sub">{getSub(it)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
