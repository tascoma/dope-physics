import { Link } from "react-router-dom";

export function ClosingCTA() {
  return (
    <section style={{ padding: "24px 0 40px" }}>
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
        04 · Open it
      </span>
      <hr style={{ height: 1, border: 0, margin: "0 0 24px", background: "var(--color-divider)" }} />
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 26,
          lineHeight: "24px",
          letterSpacing: ".02em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Five views over one solution
      </h3>
      <p style={{ fontSize: 15, lineHeight: "24px", margin: "18px 0 0", maxWidth: "60ch", color: "rgba(29,31,32,.78)" }}>
        Side elevation against the line of sight, plan view separating wind from spin and Coriolis, a self-scaling
        reticle with the hold marked, velocity and energy decay through the transonic band, and a range card. Every
        slider re-solves; the fire control flies the shot.
      </p>
      <div style={{ display: "flex", gap: 11, flexWrap: "wrap", marginTop: 24 }}>
        <Link
          to="/solver"
          className="btn btn-primary"
          style={{
            borderRadius: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            padding: "10px 22px",
            color: "var(--color-bg)",
          }}
        >
          Open the solver
        </Link>
      </div>
    </section>
  );
}
