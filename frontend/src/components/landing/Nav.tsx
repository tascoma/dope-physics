import { Link } from "react-router-dom";

export function Nav() {
  return (
    <nav
      className="nav"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "14px clamp(20px,5vw,72px)",
        borderBottom: "1px solid var(--color-divider)",
      }}
    >
      <span style={{ display: "flex", alignItems: "baseline", gap: 9, marginRight: "auto" }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: 21,
            letterSpacing: ".06em",
            textTransform: "uppercase",
          }}
        >
          Dope
        </span>
        <span
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 10,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--color-neutral-600)",
          }}
        >
          physics engine
        </span>
      </span>
      <a href="#model" style={{ fontSize: 14, color: "var(--color-text)" }}>
        Model
      </a>
      <a href="#solved" style={{ fontSize: 14, color: "var(--color-text)" }}>
        Solved
      </a>
      <a href="#limits" style={{ fontSize: 14, color: "var(--color-text)" }}>
        Limits
      </a>
      <Link
        to="/solver"
        className="btn btn-primary"
        style={{
          borderRadius: 0,
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          padding: "8px 18px",
          color: "var(--color-bg)",
        }}
      >
        Open the solver
      </Link>
    </nav>
  );
}
