interface SliderRowProps {
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  /** Formatted value for screen readers — defaults to `display`. */
  ariaValueText?: string;
}

/** The repeated label / live-value / range-input row used across all five left-rail groups. */
export function SliderRow({
  label,
  display,
  min,
  max,
  step,
  value,
  onChange,
  ariaValueText,
}: SliderRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "1px 8px",
        alignItems: "baseline",
        padding: "6px 0",
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "var(--color-neutral-700)",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>{display}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
        aria-valuetext={ariaValueText ?? display}
        style={{ gridColumn: "1 / -1" }}
      />
    </div>
  );
}
