import { useShot } from "../../state/ShotContext";
import { MPH_TO_MS } from "../../lib/ballistics";
import { toEnergy, toLinear, toVelocity, unitLabels } from "../../lib/units";
import { fx } from "../../lib/format";
import { SolutionCard } from "./SolutionCard";
import { ReadoutRow } from "./ReadoutRow";
import { EquationsPanel } from "./EquationsPanel";

export function RightRail() {
  const { state, dispatch, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);

  const zones = state.zonesEnabled ? state.wind : [state.wind[0]];
  const crosswindMph =
    zones.reduce((a, z) => a + Math.abs(z.speedMph * Math.sin((z.clock / 12) * 2 * Math.PI)), 0) /
    zones.length;
  const crosswindDisplay = metric
    ? `${(crosswindMph * MPH_TO_MS).toFixed(1)} m/s`
    : `${crosswindMph.toFixed(1)} mph`;

  const readouts: { label: string; value: string }[] = [
    { label: "Time of flight", value: `${solution.tofS.toFixed(3)} s` },
    { label: "Bullet drop from LOS", value: `${fx(toLinear(solution.dropM, metric), 1)} ${units.linear}` },
    { label: "Max ordinate", value: `${fx(toLinear(solution.maxOrdinateM, metric), 1)} ${units.linear}` },
    {
      label: "Impact velocity",
      value: `${Math.round(toVelocity(solution.velocityMs, metric))} ${units.velocity}  M${solution.mach.toFixed(2)}`,
    },
    { label: "Kinetic energy", value: `${Math.round(toEnergy(solution.energyJ, metric))} ${units.energy}` },
    // Matches the prototype's displayed value (wind-only lateral, no coriolis/spin).
    // Note: the handoff's backend/app/main.py computes SolutionOut.wind_deflection as
    // (wind_only_m - coriolis_m), which is a different quantity — a discrepancy in the
    // reference bundle itself, not resolved here.
    { label: "Wind deflection", value: `${fx(toLinear(solution.windOnlyM, metric), 1)} ${units.linear}` },
    { label: "Spin drift", value: `${fx(toLinear(solution.spinM, metric), 1)} ${units.linear}` },
    { label: "Coriolis (horizontal)", value: `${fx(toLinear(solution.coriolisM, metric), 2)} ${units.linear}` },
    {
      label: "Aerodynamic jump",
      value: `${fx(metric ? solution.aeroJumpMoa / 3.438 : solution.aeroJumpMoa, 2)} ${units.angular}`,
    },
    {
      label: "Stability factor (Miller)",
      value: `${solution.sg.toFixed(2)}${solution.sg < 1.4 ? "  MARGINAL" : ""}`,
    },
    {
      label: "Vertical spread from MV SD",
      value: `± ${fx(toLinear(solution.mvSpreadM, metric), 1)} ${units.linear}`,
    },
    { label: "Crosswind component", value: crosswindDisplay },
  ];

  return (
    <aside
      style={{
        borderLeft: "1px solid var(--color-divider)",
        overflowY: "auto",
        padding: "16px 16px 28px",
        background: "var(--color-bg)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 9.5,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
          marginBottom: 10,
        }}
      >
        Firing solution
      </div>

      <SolutionCard />

      {readouts.map((r) => (
        <ReadoutRow key={r.label} label={r.label} value={r.value} />
      ))}

      <button
        className="btn btn-secondary btn-block"
        onClick={() => dispatch({ type: "TOGGLE_SHOW_MATH" })}
        style={{
          borderRadius: 0,
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 12.5,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          marginTop: 16,
        }}
      >
        {state.showMath ? "hide the math" : "show the math"}
      </button>

      {state.showMath && <EquationsPanel />}
    </aside>
  );
}
