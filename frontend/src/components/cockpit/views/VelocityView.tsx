import { useShot } from "../../../state/ShotContext";
import { toEnergy, toRange, toVelocity, unitLabels } from "../../../lib/units";
import {
  AXIS_Y,
  CAPTION_Y,
  PLOT_X0,
  PLOT_X1,
  PLOT_Y0,
  PLOT_Y1,
  bulletSample,
  decimate,
  scaleX,
  svgPath,
} from "../../../lib/chart";
import { computeXTicks, computeYTicks } from "../../../lib/axisTicks";
import { ChartCard } from "./ChartCard";
import type { Sample } from "../../../lib/ballistics";

function crossing(samples: Sample[], mach: number): Sample | null {
  for (let i = 1; i < samples.length; i++) {
    if (samples[i - 1].mach >= mach && samples[i].mach < mach) return samples[i];
  }
  return null;
}

export function VelocityView() {
  const { state, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);
  const slantM = solution.slantM;
  const sx = scaleX(slantM);

  const samples = decimate(solution.samples);
  const velocitiesDisplay = samples.map((p) => toVelocity(p.velocityMs, metric));
  const vMax = Math.max(...velocitiesDisplay) * 1.06;
  const vy = (v: number) => PLOT_Y0 + (PLOT_Y1 - PLOT_Y0) * ((vMax - v) / Math.max(vMax, 1e-6));

  const energiesDisplay = samples.map((p) => toEnergy(p.energyJ, metric));
  const eMax = Math.max(...energiesDisplay) * 1.06;
  const ey = (e: number) => PLOT_Y0 + (PLOT_Y1 - PLOT_Y0) * ((eMax - e) / Math.max(eMax, 1e-6));

  const velPath = svgPath(samples.map((p) => [sx(p.rangeM), vy(toVelocity(p.velocityMs, metric))]));
  const enePathLine = svgPath(samples.map((p) => [sx(p.rangeM), ey(toEnergy(p.energyJ, metric))]));
  const enePath = `${enePathLine} L${sx(slantM).toFixed(1)} ${PLOT_Y1} L${PLOT_X0} ${PLOT_Y1} Z`;

  const gx = computeXTicks(slantM, metric, sx);
  const gyVel = computeYTicks(0, vMax, vy, (v) => Math.round(v).toString());
  const gyEne = computeYTicks(0, eMax, ey, (v) => Math.round(v).toString());

  const machMarks = ([[1.2, "MACH 1.2"], [1, "MACH 1 — TRANSONIC"]] as const)
    .map(([m, label]) => {
      const p = crossing(solution.samples, m);
      if (!p) return null;
      const x = sx(p.rangeM);
      return { x, ty: m === 1 ? 58 : 44, label: `${label} @ ${Math.round(toRange(p.rangeM, metric))} ${units.range}` };
    })
    .filter((m): m is { x: number; ty: number; label: string } => m !== null);

  const bullet = bulletSample(solution.samples, state.animProgress);

  return (
    <ChartCard title="Velocity & energy decay" note="solid = velocity · steel fill = energy">
      <svg
        viewBox="0 0 1000 430"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "ui-monospace, Menlo, monospace" }}
        role="img"
        aria-label={`Velocity and energy view. Impact velocity ${Math.round(toVelocity(solution.velocityMs, metric))} ${units.velocity}.`}
      >
        {gx.map((g, i) => (
          <g key={`x${i}`}>
            <line x1={g.pos} y1={30} x2={g.pos} y2={368} stroke="rgba(29,31,32,.07)" />
            <text x={g.pos} y={386} fontSize={10.5} fill="#7a7a7d" textAnchor="middle">
              {g.label}
            </text>
          </g>
        ))}
        {gyVel.map((g, i) => (
          <g key={`v${i}`}>
            <line x1={PLOT_X0} y1={g.pos} x2={PLOT_X1} y2={g.pos} stroke="rgba(29,31,32,.07)" />
            <text x={64} y={g.pos} fontSize={10.5} fill="#7a7a7d" textAnchor="end" dominantBaseline="middle">
              {g.label}
            </text>
          </g>
        ))}
        {gyEne.map((g, i) => (
          <text key={`e${i}`} x={986} y={g.pos} fontSize={10.5} fill="#416180" textAnchor="start" dominantBaseline="middle">
            {g.label}
          </text>
        ))}
        <path d={enePath} fill="rgba(89,128,166,.16)" stroke="none" />
        <path d={velPath} fill="none" stroke="#1d1f20" strokeWidth={2} />
        {machMarks.map((m, i) => (
          <g key={i}>
            <line x1={m.x} y1={30} x2={m.x} y2={368} stroke="#5980a6" strokeWidth={1} strokeDasharray="5 3" />
            <text x={m.x - 5} y={m.ty} fontSize={10} fill="#416180" textAnchor="end">
              {m.label}
            </text>
          </g>
        ))}
        {bullet && <circle cx={sx(bullet.rangeM)} cy={vy(toVelocity(bullet.velocityMs, metric))} r={2.8} fill="#1d1f20" />}
        <line x1={PLOT_X0} y1={AXIS_Y} x2={PLOT_X1} y2={AXIS_Y} stroke="rgba(29,31,32,.4)" />
        <line x1={PLOT_X0} y1={30} x2={PLOT_X0} y2={AXIS_Y} stroke="rgba(29,31,32,.4)" />
        <text x={525} y={CAPTION_Y} fontSize={10.5} fill="#7a7a7d" textAnchor="middle" letterSpacing={1.4}>
          RANGE — {units.range} · left axis {units.velocity} · right axis {units.energy}
        </text>
      </svg>
    </ChartCard>
  );
}
