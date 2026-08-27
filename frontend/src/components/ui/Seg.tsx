interface SegOption<T extends string> {
  value: T;
  label: string;
}

interface SegProps<T extends string> {
  name: string;
  options: SegOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

/** A radio group styled as a segmented control — real inputs, visually hidden. */
export function Seg<T extends string>({ name, options, value, onChange, ariaLabel }: SegProps<T>) {
  return (
    <div className="seg" style={{ borderRadius: 0 }} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <label key={opt.value} className="seg-opt" style={{ borderRadius: 0 }}>
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{ position: "absolute", opacity: 0, width: 0 }}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
