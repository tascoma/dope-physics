import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section style={{ padding: "96px 0 72px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: "clamp(48px,7vw,96px)",
          lineHeight: 1.04,
          letterSpacing: ".01em",
          textTransform: "uppercase",
          margin: "0 0 0 -.052em",
        }}
      >
        <span style={{ display: "block" }}>A ballistic solver</span>
        <span style={{ display: "block" }}>that shows its work.</span>
      </h1>
      <p style={{ fontSize: 16, lineHeight: "24px", maxWidth: "60ch", margin: "34px 0 0", color: "var(--color-text)" }}>
        Dope integrates a point-mass trajectory against the G7 and G1 standard drag functions and prints the
        equation behind every number it gives you — drop, drift, spin, Coriolis, energy. Every term is named,
        every approximation is labelled, and nothing is hidden behind a dial.
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
        <a
          href="#limits"
          className="btn btn-ghost"
          style={{
            borderRadius: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            padding: "10px 12px",
          }}
        >
          Read the limits first
        </a>
      </div>
    </section>
  );
}
