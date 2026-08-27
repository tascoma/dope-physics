import { Blueprint } from "../ui/Blueprint";
import { PRINCIPLE_CELLS } from "../../content/landingContent";

export function SolvedFromFirstPrinciples() {
  return (
    <section id="solved" style={{ padding: "24px 0 60px" }}>
      <span
        style={{
          display: "block",
          fontSize: 13,
          lineHeight: "12px",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "var(--color-accent-700)",
          margin: "0 0 12px",
        }}
      >
        02 · Solved from first principles
      </span>
      <hr style={{ height: 1, border: 0, margin: "0 0 32px", background: "var(--color-divider)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "clamp(20px,3vw,48px)" }}>
        {PRINCIPLE_CELLS.map((c) => (
          <Blueprint key={c.title} style={{ position: "relative", padding: 24 }}>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 22,
                lineHeight: "24px",
                letterSpacing: ".02em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {c.title}
            </h2>
            <div
              style={{
                fontFamily: "ui-monospace, Menlo, monospace",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--color-accent-700)",
                margin: "14px 0 0",
              }}
            >
              {c.eq}
            </div>
            <p style={{ fontSize: 15, lineHeight: "24px", margin: "14px 0 0", color: "rgba(29,31,32,.78)" }}>{c.body}</p>
          </Blueprint>
        ))}
      </div>
    </section>
  );
}
