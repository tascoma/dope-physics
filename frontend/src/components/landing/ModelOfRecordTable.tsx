import type { CSSProperties } from "react";
import { Blueprint } from "../ui/Blueprint";
import { MODEL_ROWS } from "../../content/landingContent";

const HEADER_CELL: CSSProperties = {
  borderLeft: "1px solid var(--color-divider)",
  whiteSpace: "nowrap",
  padding: "12px 24px",
  fontSize: 13,
  lineHeight: "24px",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  fontWeight: 600,
  color: "rgba(29,31,32,.7)",
};

const TH_STYLE: CSSProperties = {
  padding: "12px 24px 12px 0",
  fontSize: 13,
  lineHeight: "12px",
  fontWeight: 600,
  color: "rgba(29,31,32,.7)",
};

export function ModelOfRecordTable() {
  return (
    <section id="model" style={{ padding: "0 0 60px" }}>
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
            Dope — model of record
          </span>
          <span style={HEADER_CELL}>Point mass</span>
          <span style={HEADER_CELL}>Rev A</span>
          <span style={HEADER_CELL}>Sheet 01 of 02</span>
        </header>
        <table className="table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...TH_STYLE, width: 72, padding: "12px 24px" }}>
                No.
              </th>
              <th scope="col" style={{ ...TH_STYLE, width: "30%" }}>
                Component
              </th>
              <th scope="col" style={{ ...TH_STYLE, width: "23%" }}>
                Method
              </th>
              <th scope="col" style={TH_STYLE}>
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {MODEL_ROWS.map((r) => (
              <tr key={r.n}>
                <td
                  style={{
                    padding: "12px 24px",
                    verticalAlign: "middle",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    color: "var(--color-accent-700)",
                  }}
                >
                  {r.n}
                </td>
                <td style={{ padding: "12px 24px 12px 0", verticalAlign: "middle", fontSize: 15, lineHeight: "24px" }}>
                  {r.prop}
                </td>
                <td
                  style={{
                    padding: "12px 24px 12px 0",
                    verticalAlign: "middle",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: 22,
                    lineHeight: "24px",
                    letterSpacing: ".02em",
                  }}
                >
                  {r.val}
                </td>
                <td
                  style={{
                    padding: "12px 24px 12px 0",
                    verticalAlign: "middle",
                    fontSize: 15,
                    lineHeight: "24px",
                    color: "rgba(29,31,32,.78)",
                  }}
                >
                  {r.rem}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p
          style={{
            margin: 0,
            padding: "12px 24px",
            borderTop: "1px solid var(--color-divider)",
            fontSize: 13,
            lineHeight: "24px",
            color: "rgba(29,31,32,.7)",
          }}
        >
          A point-mass model. It does not compute yaw, precession or nutation; the rotational effects below are
          empirical fits laid over the translational solution.
        </p>
      </Blueprint>
    </section>
  );
}
