import { useShot } from "../../state/ShotContext";
import { useFireAnimation } from "../../hooks/useFireAnimation";
import { toVelocity, unitLabels } from "../../lib/units";
import type { ViewKey } from "../../state/shotState";

const TABS: { key: ViewKey; label: string }[] = [
  { key: "side", label: "Side view" },
  { key: "top", label: "Plan view" },
  { key: "scope", label: "Reticle" },
  { key: "curves", label: "Velocity" },
  { key: "dope", label: "Range card" },
];

export function TabBar() {
  const { state, dispatch, solution } = useShot();
  const { fire } = useFireAnimation();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);

  const flightLabel = solution.reachedTarget
    ? `TOF ${solution.tofS.toFixed(2)} s · impact ${Math.round(toVelocity(solution.velocityMs, metric))} ${units.velocity}`
    : "SUBSONIC STALL — REDUCE RANGE";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "10px 18px 0",
        borderBottom: "1px solid var(--color-divider)",
        flexWrap: "wrap",
      }}
    >
      {TABS.map((t) => {
        const active = state.view === t.key;
        return (
          <button
            key={t.key}
            onClick={() => dispatch({ type: "SET_VIEW", view: t.key })}
            style={{
              border: "1px solid var(--color-divider)",
              borderBottom: "none",
              borderRadius: 0,
              background: active ? "var(--color-accent)" : "transparent",
              color: active ? "var(--color-bg)" : "var(--color-text)",
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              padding: "7px 14px",
              marginBottom: -1,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        );
      })}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
        <span
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 10,
            color: "var(--color-neutral-600)",
            whiteSpace: "nowrap",
          }}
        >
          {flightLabel}
        </span>
        <button
          className="btn btn-primary"
          onClick={fire}
          style={{
            borderRadius: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: 13.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            padding: "8px 20px",
          }}
        >
          Fire
        </button>
      </div>
    </div>
  );
}
