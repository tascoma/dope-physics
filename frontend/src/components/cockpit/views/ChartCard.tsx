import type { CSSProperties, ReactNode } from "react";
import { Blueprint } from "../../ui/Blueprint";

interface ChartCardProps {
  title: string;
  note: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** The framed card + title/note header shared by all four SVG chart views. */
export function ChartCard({ title, note, style, children }: ChartCardProps) {
  return (
    <Blueprint style={{ padding: "12px 14px 6px", background: "var(--color-neutral-100)", ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 10, color: "var(--color-neutral-600)" }}>
          {note}
        </span>
      </div>
      {children}
    </Blueprint>
  );
}
