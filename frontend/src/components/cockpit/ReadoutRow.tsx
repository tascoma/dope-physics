interface ReadoutRowProps {
  label: string;
  value: string;
}

export function ReadoutRow({ label, value }: ReadoutRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "6px 0",
        borderBottom: "1px solid rgba(29,31,32,.08)",
      }}
    >
      <span
        style={{
          fontSize: 11.5,
          letterSpacing: ".04em",
          textTransform: "uppercase",
          color: "var(--color-neutral-700)",
        }}
      >
        {label}
      </span>
      <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13, color: "var(--color-text)" }}>
        {value}
      </span>
    </div>
  );
}
