export function FilterPanel({ filters, params, onChange, onClear }) {
  return (
    <aside className="filters">
      <div className="filters-head">
        <h2>ფილტრები</h2>
        <button className="link-btn" onClick={onClear}>
          გასუფთავება
        </button>
      </div>

      {filters.map((filter) => (
        <fieldset className="filter" key={filter.key}>
          <legend>{filter.label}</legend>

          {(filter.type === "checkbox" || filter.type === "color") && (
            <CheckboxGroup
              filter={filter}
              params={params}
              onChange={onChange}
            />
          )}

          {filter.type === "radio" && (
            <RadioGroup filter={filter} params={params} onChange={onChange} />
          )}

          {filter.type === "range" && (
            <RangeFilter filter={filter} params={params} onChange={onChange} />
          )}
        </fieldset>
      ))}
    </aside>
  );
}

// checkbox: რამდენიმე მნიშვნელობა მძიმით (?material=oak,metal)
function CheckboxGroup({ filter, params, onChange }) {
  const selected = params.get(filter.key)
    ? params.get(filter.key).split(",")
    : [];

  function toggle(value) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(filter.key, next.join(","));
  }

  return filter.options.map((option) => (
    <label className="filter-option" key={option.value}>
      <input
        type="checkbox"
        checked={selected.includes(option.value)}
        onChange={() => toggle(option.value)}
      />
      {option.label}
    </label>
  ));
}

// radio: ერთი არჩევა
function RadioGroup({ filter, params, onChange }) {
  const selected = params.get(filter.key) || "";

  return filter.options.map((option) => (
    <label className="filter-option" key={option.value}>
      <input
        type="radio"
        name={filter.key}
        checked={selected === option.value}
        onChange={() => onChange(filter.key, option.value)}
        onClick={() => {
          if (selected === option.value) onChange(filter.key, "");
        }}
      />
      {option.label}
    </label>
  ));
}

// range: price min/max — the API expects two separate parameters
function RangeFilter({ filter, params, onChange }) {
  const minValue = params.get("minPrice") || "";
  const maxValue = params.get("maxPrice") || "";
  return (
    <div className="filter-range">
      <input
        className="input"
        type="number"
        placeholder={filter.min}
        aria-label={filter.label + " მინიმუმი"}
        value={minValue}
        onChange={(e) => onChange("minPrice", e.target.value)}
      />
      <span>–</span>
      <input
        className="input"
        type="number"
        placeholder={filter.max}
        aria-label={filter.label + " მაქსიმუმი"}
        value={maxValue}
        onChange={(e) => onChange("maxPrice", e.target.value)}
      />
    </div>
  );
}
