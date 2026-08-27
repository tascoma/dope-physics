import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Seg } from "../ui/Seg";
import { useShot } from "../../state/ShotContext";
import type { DragModel } from "../../lib/ballistics";
import type { UnitSystem } from "../../state/shotState";

const LABEL_STYLE: CSSProperties = {
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 9.5,
  letterSpacing: ".12em",
  textTransform: "uppercase",
  color: "var(--color-neutral-600)",
};

export function Header() {
  const { state, dispatch } = useShot();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "11px 20px",
        borderBottom: "1px solid var(--color-divider)",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "var(--color-text)",
            textDecoration: "none",
          }}
        >
          Dope
        </Link>
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
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginLeft: "auto" }}>
        <span style={LABEL_STYLE}>drag model</span>
        <Seg<DragModel>
          name="drag-model"
          ariaLabel="Drag model"
          value={state.dragModel}
          onChange={(model) => dispatch({ type: "SET_DRAG_MODEL", model })}
          options={[
            { value: "G7", label: "G7" },
            { value: "G1", label: "G1" },
          ]}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={LABEL_STYLE}>units</span>
        <Seg<UnitSystem>
          name="units"
          ariaLabel="Units"
          value={state.unitSystem}
          onChange={(unitSystem) => dispatch({ type: "SET_UNIT_SYSTEM", unitSystem })}
          options={[
            { value: "imperial", label: "yd / MOA" },
            { value: "metric", label: "m / mil" },
          ]}
        />
      </div>
    </header>
  );
}
