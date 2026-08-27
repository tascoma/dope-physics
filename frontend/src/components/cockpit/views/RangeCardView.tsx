import { useShot } from "../../../state/ShotContext";
import { useCartridges } from "../../../hooks/useCartridges";
import { YD_TO_M, type Sample } from "../../../lib/ballistics";
import { angularScale, toEnergy, toLinear, toRange, toVelocity, unitLabels } from "../../../lib/units";
import { fx } from "../../../lib/format";
import { Blueprint } from "../../ui/Blueprint";

function nearestSample(samples: Sample[], targetM: number): Sample {
  let best = samples[0];
  for (const p of samples) {
    if (Math.abs(p.rangeM - targetM) < Math.abs(best.rangeM - targetM)) best = p;
  }
  return best;
}

export function RangeCardView() {
  const { state, solution } = useShot();
  const { cartridges } = useCartridges();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);
  const scale = angularScale(metric);

  const cartridge = cartridges.find((c) => c.id === state.cartridgeId);
  const zeroDisplay = Math.round(toRange(state.zeroYd * YD_TO_M, metric));
  const dopeHead = `${cartridge?.name ?? "—"} · ${state.dragModel} ${state.bc.toFixed(3)} · zero ${zeroDisplay} ${units.range}`;

  const rangeTotal = toRange(solution.slantM, metric);
  const rows: {
    range: number;
    drop: string;
    elev: string;
    wind: string;
    spin: string;
    vel: number;
    mach: string;
    energy: number;
    tof: string;
    marginal: boolean;
  }[] = [];
  for (let r = 100; r <= rangeTotal + 1e-6; r += 100) {
    const targetM = metric ? r : r * YD_TO_M;
    const p = nearestSample(solution.samples, targetM);
    const rm = Math.max(p.rangeM, 1e-6);
    rows.push({
      range: Math.round(r),
      drop: fx(toLinear(p.dropM, metric), 1),
      elev: fx((-p.dropM / rm) * scale, 1),
      wind: fx((p.driftWindM / rm) * scale, 2),
      spin: fx(toLinear(p.spinM, metric), 1),
      vel: Math.round(toVelocity(p.velocityMs, metric)),
      mach: p.mach.toFixed(2),
      energy: Math.round(toEnergy(p.energyJ, metric)),
      tof: p.timeS.toFixed(2),
      marginal: p.mach < 1.1,
    });
  }

  return (
    <Blueprint style={{ padding: "12px 14px", background: "var(--color-neutral-100)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          Range card
        </span>
        <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 10, color: "var(--color-neutral-600)" }}>
          {dopeHead}
        </span>
      </div>
      <table className="table" style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5 }}>
        <thead>
          <tr>
            <th>Range</th>
            <th>Drop</th>
            <th>Elev</th>
            <th>Wind</th>
            <th>Spin</th>
            <th>Vel</th>
            <th>Mach</th>
            <th>Energy</th>
            <th>TOF</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.range} style={{ background: r.marginal ? "rgba(89,128,166,.09)" : "transparent" }}>
              <td style={{ color: "var(--color-text)" }}>{r.range}</td>
              <td>{r.drop}</td>
              <td style={{ color: "var(--color-accent-700)" }}>{r.elev}</td>
              <td style={{ color: "var(--color-accent-700)" }}>{r.wind}</td>
              <td>{r.spin}</td>
              <td>{r.vel}</td>
              <td>{r.mach}</td>
              <td>{r.energy}</td>
              <td>{r.tof}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Blueprint>
  );
}
