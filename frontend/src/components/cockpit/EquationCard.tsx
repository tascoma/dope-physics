import type { EquationCard as EquationCardData } from "../../lib/equations";

export function EquationCard({ title, eq, sub, note }: EquationCardData) {
  return (
    <div style={{ border: "1px solid var(--color-divider)", padding: "9px 10px" }}>
      <div
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 9.5,
          letterSpacing: ".11em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginBottom: 5,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 12,
          lineHeight: 1.6,
          color: "var(--color-text)",
          whiteSpace: "pre-wrap",
        }}
      >
        {eq}
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "var(--color-accent-700)",
          marginTop: 5,
          whiteSpace: "pre-wrap",
        }}
      >
        {sub}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 11.5, lineHeight: 1.5, color: "var(--color-neutral-700)" }}>
        {note}
      </p>
    </div>
  );
}
