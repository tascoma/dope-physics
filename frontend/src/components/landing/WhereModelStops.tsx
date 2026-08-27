import type { CSSProperties } from "react";
import { Blueprint } from "../ui/Blueprint";
import { LIMIT_ROWS } from "../../content/landingContent";

const TH_STYLE: CSSProperties = {
  padding: "12px 24px 12px 0",
  fontSize: 13,
  lineHeight: "12px",
  fontWeight: 600,
  color: "rgba(29,31,32,.7)",
};

const HEADING_STYLE: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  fontSize: 26,
  lineHeight: "30px",
  letterSpacing: ".02em",
  textTransform: "uppercase",
  margin: 0,
};

const PROSE_STYLE: CSSProperties = {
  fontSize: 15,
  lineHeight: "24px",
  margin: "16px 0 0",
  color: "rgba(29,31,32,.78)",
};

export function WhereModelStops() {
  return (
    <section id="limits" style={{ padding: "24px 0 60px" }}>
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
        03 · Where the model stops
      </span>
      <hr style={{ height: 1, border: 0, margin: "0 0 32px", background: "var(--color-divider)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        <Blueprint style={{ position: "relative" }}>
          <header style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", borderBottom: "1px solid var(--color-divider)" }}>
            <span
              style={{
                flex: 1,
                minWidth: "16ch",
                padding: "12px 24px",
                fontSize: 13,
                lineHeight: "24px",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Approximations in force
            </span>
            <span
              style={{
                borderLeft: "1px solid var(--color-divider)",
                whiteSpace: "nowrap",
                padding: "12px 24px",
                fontSize: 13,
                lineHeight: "24px",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "rgba(29,31,32,.7)",
              }}
            >
              Sheet 02 of 02
            </span>
          </header>
          <table className="table" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th scope="col" style={{ ...TH_STYLE, width: "24%", padding: "12px 24px" }}>
                  Effect
                </th>
                <th scope="col" style={TH_STYLE}>
                  How it is handled
                </th>
                <th scope="col" style={{ ...TH_STYLE, width: "16%" }}>
                  Trust it to
                </th>
              </tr>
            </thead>
            <tbody>
              {LIMIT_ROWS.map((r) => (
                <tr key={r.eff}>
                  <td style={{ padding: "12px 24px", verticalAlign: "top", fontSize: 15, lineHeight: "24px" }}>{r.eff}</td>
                  <td
                    style={{
                      padding: "12px 24px 12px 0",
                      verticalAlign: "top",
                      fontSize: 15,
                      lineHeight: "24px",
                      color: "rgba(29,31,32,.78)",
                    }}
                  >
                    {r.how}
                  </td>
                  <td
                    style={{
                      padding: "12px 24px 12px 0",
                      verticalAlign: "top",
                      fontFamily: "ui-monospace, Menlo, monospace",
                      fontSize: 12.5,
                      lineHeight: "24px",
                      color: "var(--color-accent-700)",
                    }}
                  >
                    {r.trust}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Blueprint>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px clamp(24px,5vw,72px)" }}>
          <div>
            <h3 style={HEADING_STYLE}>A solver is not a substitute for a chronograph</h3>
            <p style={PROSE_STYLE}>
              Every number here inherits the error in what you typed. A muzzle velocity guessed from a box label is
              worth more error at 1,000 yards than every rotational effect on the sheet combined. Dope reports
              velocity standard deviation as vertical spread for exactly that reason.
            </p>
          </div>
          <div>
            <h3 style={HEADING_STYLE}>Truing is on you</h3>
            <p style={PROSE_STYLE}>
              The published ballistic coefficient of a bullet is a single number standing in for a curve. Shoot the
              gun, compare the drop, adjust the coefficient until the sheet matches the target. The solver gives you
              the model; the range gives you the truth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
