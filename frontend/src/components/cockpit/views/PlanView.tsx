import { useShot } from "../../../state/ShotContext";
import { toLinear, unitLabels } from "../../../lib/units";
import { clk } from "../../../lib/format";
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
import { fx } from "../../../lib/format";
import { ChartCard } from "./ChartCard";

export function PlanView() {
  const { state, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);
  const slantM = solution.slantM;
  const sx = scaleX(slantM);

  const samples = decimate(solution.samples);
  const driftDisplay = samples.map((p) => toLinear(p.driftM, metric));
  let tMax = Math.max(0, ...driftDisplay);
  let tMin = Math.min(0, ...driftDisplay);
  const tp = (tMax - tMin) * 0.12 + 0.5;
  tMax += tp;
  tMin -= tp;
  const ty = (d: number) => PLOT_Y0 + (PLOT_Y1 - PLOT_Y0) * ((tMax - d) / Math.max(tMax - tMin, 1e-6));

  const topPath = svgPath(samples.map((p) => [sx(p.rangeM), ty(toLinear(p.driftM, metric))]));
  const topWindOnly = svgPath(samples.map((p) => [sx(p.rangeM), ty(toLinear(p.driftWindM, metric))]));

  const gx = computeXTicks(slantM, metric, sx);
  const gyTop = computeYTicks(tMin, tMax, ty, (v) => fx(v, Math.abs(tMax - tMin) < 8 ? 1 : 0));
  const axisY = ty(0);

  const windBands = state.zonesEnabled
    ? [0, 1, 2].map((i) => {
        const a = sx((slantM * i) / 3);
        const b = sx((slantM * (i + 1)) / 3);
        const zone = state.wind[i];
        return {
          x: a,
          w: b - a,
          tx: (a + b) / 2,
          label: `${zone.speedMph}${metric ? " m/s" : " mph"} @ ${clk(zone.clock)}`,
        };
      })
    : [];

  const bullet = bulletSample(solution.samples, state.animProgress);

  return (
    <ChartCard title="Plan view — lateral deflection" note="wind · spin drift · Coriolis">
      <svg
        viewBox="0 0 1000 430"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "ui-monospace, Menlo, monospace" }}
        role="img"
        aria-label={`Plan view. Total lateral deflection ${fx(toLinear(solution.driftM, metric), 1)} ${units.linear}.`}
      >
        {gx.map((g, i) => (
          <g key={`x${i}`}>
            <line x1={g.pos} y1={30} x2={g.pos} y2={368} stroke="rgba(29,31,32,.07)" />
            <text x={g.pos} y={386} fontSize={10.5} fill="#7a7a7d" textAnchor="middle">
              {g.label}
            </text>
          </g>
        ))}
        {gyTop.map((g, i) => (
          <g key={`y${i}`}>
            <line x1={PLOT_X0} y1={g.pos} x2={PLOT_X1} y2={g.pos} stroke="rgba(29,31,32,.07)" />
            <text x={64} y={g.pos} fontSize={10.5} fill="#7a7a7d" textAnchor="end" dominantBaseline="middle">
              {g.label}
            </text>
          </g>
        ))}
        <line x1={PLOT_X0} y1={axisY} x2={PLOT_X1} y2={axisY} stroke="#1d1f20" strokeDasharray="7 4" />
        <path d={topWindOnly} fill="none" stroke="rgba(89,128,166,.4)" strokeWidth={1.2} strokeDasharray="4 3" />
        <path d={topPath} fill="none" stroke="#5980a6" strokeWidth={2} />
        {windBands.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={30} width={b.w} height={18} fill="rgba(89,128,166,.1)" />
            <text x={b.tx} y={43} fontSize={10} fill="#416180" textAnchor="middle">
              {b.label}
            </text>
          </g>
        ))}
        {bullet && (
          <>
            <circle cx={sx(bullet.rangeM)} cy={ty(toLinear(bullet.driftM, metric))} r={5} fill="#5980a6" opacity={0.25} />
            <circle cx={sx(bullet.rangeM)} cy={ty(toLinear(bullet.driftM, metric))} r={2.6} fill="#1d1f20" />
          </>
        )}
        <line x1={PLOT_X0} y1={AXIS_Y} x2={PLOT_X1} y2={AXIS_Y} stroke="rgba(29,31,32,.4)" />
        <line x1={PLOT_X0} y1={30} x2={PLOT_X0} y2={AXIS_Y} stroke="rgba(29,31,32,.4)" />
        <text x={525} y={CAPTION_Y} fontSize={10.5} fill="#7a7a7d" textAnchor="middle" letterSpacing={1.4}>
          RANGE — {units.range} · dashed = wind alone, solid = wind + spin + Coriolis
        </text>
      </svg>
    </ChartCard>
  );
}
