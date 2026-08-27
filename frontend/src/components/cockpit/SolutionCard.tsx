import type { CSSProperties } from "react";
import { Blueprint } from "../ui/Blueprint";
import { useShot } from "../../state/ShotContext";
import { corrections } from "../../lib/ballistics";
import { fx } from "../../lib/format";

const LABEL_STYLE: CSSProperties = {
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 9.5,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "rgba(242,242,243,.55)",
};
const VALUE_STYLE: CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: 44,
  lineHeight: 1,
  color: "var(--color-bg)",
};

/** The one dark field in the app — the firing-solution card. */
export function SolutionCard() {
  const { state, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const c = corrections(solution, metric);
  const decimals = metric ? 2 : 1;

  return (
    <Blueprint
      cornerColor="rgba(242,242,243,.5)"
      style={{ padding: "12px 13px", background: "var(--color-accent-900)", marginBottom: 16 }}
    >
      <div style={LABEL_STYLE}>elevation · {c.unit}</div>
      <div style={{ ...VALUE_STYLE, margin: "2px 0 10px" }}>
        {c.elevation >= 0 ? "U " : "D "}
        {fx(Math.abs(c.elevation), decimals)}
      </div>
      <div style={LABEL_STYLE}>
        windage · {c.unit} {c.windageDirection}
      </div>
      <div style={{ ...VALUE_STYLE, margin: "2px 0 0" }}>
        {c.windageDirection === "LEFT" ? "L " : "R "}
        {fx(c.windage, decimals)}
      </div>
    </Blueprint>
  );
}
