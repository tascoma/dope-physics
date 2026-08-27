import { useShot } from "../../../state/ShotContext";
import { IN_TO_M, YD_TO_M } from "../../../lib/ballistics";
import { toLinear, toRange, unitLabels } from "../../../lib/units";
import { fx } from "../../../lib/format";
import {
  AXIS_Y,
  CAPTION_Y,
  PLOT_X0,
  PLOT_X1,
  PLOT_Y0,
  PLOT_Y1,
  TICK_LABEL_Y,
  bulletSample,
  decimate,
  scaleX,
  svgPath,
} from "../../../lib/chart";
import { computeXTicks, computeYTicks } from "../../../lib/axisTicks";
import { ChartCard } from "./ChartCard";

export function SideView() {
  const { state, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);
  const slantM = solution.slantM;
  const sx = scaleX(slantM);

  const samples = decimate(solution.samples);
  const dropsDisplay = samples.map((p) => toLinear(p.dropM, metric));
  let dTop = Math.max(0, ...dropsDisplay);
  let dBot = Math.min(0, ...dropsDisplay);
  const pad = (dTop - dBot) * 0.08 + 1;
  dTop += pad;
  dBot -= pad;
  const sy = (d: number) => PLOT_Y0 + (PLOT_Y1 - PLOT_Y0) * ((dTop - d) / Math.max(dTop - dBot, 1e-6));

  const sidePath = svgPath(samples.map((p) => [sx(p.rangeM), sy(toLinear(p.dropM, metric))]));

  const sightHeightM = state.sightHeightIn * IN_TO_M;
  const boreEndY = sy(toLinear(-sightHeightM + slantM * Math.tan(solution.launchAngleRad), metric));
  const borePath = svgPath([
    [sx(0), sy(toLinear(-sightHeightM, metric))],
    [sx(slantM), boreEndY],
  ]);

  const gx = computeXTicks(slantM, metric, sx);
  const gySide = computeYTicks(dBot, dTop, sy, (v) => fx(v, 0));

  const zeroM = state.zeroYd * YD_TO_M;
  const maxOrdSample = samples.reduce((a, b) => (b.dropM > a.dropM ? b : a), samples[0]);
  const sideMarks = [
    { x: sx(zeroM), y: sy(0), label: `ZERO ${Math.round(toRange(zeroM, metric))}` },
    {
      x: sx(maxOrdSample.rangeM),
      y: sy(toLinear(maxOrdSample.dropM, metric)),
      label: `APEX ${fx(toLinear(maxOrdSample.dropM, metric), 1)}`,
    },
  ];

  const losY = sy(0);
  const bullet = bulletSample(solution.samples, state.animProgress);

  return (
    <ChartCard title="Side elevation — path vs line of sight" note={`vertical exaggerated · ${units.linear}`}>
      <svg
        viewBox="0 0 1000 430"
        style={{ width: "100%", height: "auto", display: "block", fontFamily: "ui-monospace, Menlo, monospace" }}
        role="img"
        aria-label={`Side elevation view. Drop ${fx(toLinear(solution.dropM, metric), 1)} ${units.linear} at ${Math.round(toRange(slantM, metric))} ${units.range}.`}
      >
        {gx.map((g, i) => (
          <g key={`x${i}`}>
            <line x1={g.pos} y1={30} x2={g.pos} y2={368} stroke="rgba(29,31,32,.07)" />
            <text x={g.pos} y={TICK_LABEL_Y} fontSize={10.5} fill="#7a7a7d" textAnchor="middle">
              {g.label}
            </text>
          </g>
        ))}
        {gySide.map((g, i) => (
          <g key={`y${i}`}>
            <line x1={PLOT_X0} y1={g.pos} x2={PLOT_X1} y2={g.pos} stroke="rgba(29,31,32,.07)" />
            <text x={64} y={g.pos} fontSize={10.5} fill="#7a7a7d" textAnchor="end" dominantBaseline="middle">
              {g.label}
            </text>
          </g>
        ))}
        <line x1={PLOT_X0} y1={losY} x2={PLOT_X1} y2={losY} stroke="#1d1f20" strokeWidth={1} strokeDasharray="7 4" />
        <text x={PLOT_X1} y={losY - 6} fontSize={10.5} fill="#1d1f20" textAnchor="end">
          LINE OF SIGHT
        </text>
        <path d={borePath} fill="none" stroke="rgba(89,128,166,.45)" strokeWidth={1} strokeDasharray="3 3" />
        <path d={sidePath} fill="none" stroke="#5980a6" strokeWidth={2} />
        {sideMarks.map((m, i) => (
          <g key={i}>
            <line x1={m.x} y1={m.y} x2={m.x} y2={368} stroke="rgba(89,128,166,.35)" strokeDasharray="2 3" />
            <circle cx={m.x} cy={m.y} r={2.6} fill="#416180" />
            <text x={m.x} y={m.y - 9} fontSize={10} fill="#416180" textAnchor="middle">
              {m.label}
            </text>
          </g>
        ))}
        {bullet && (
          <>
            <circle cx={sx(bullet.rangeM)} cy={sy(toLinear(bullet.dropM, metric))} r={5} fill="#5980a6" opacity={0.25} />
            <circle cx={sx(bullet.rangeM)} cy={sy(toLinear(bullet.dropM, metric))} r={2.6} fill="#1d1f20" />
          </>
        )}
        <line x1={PLOT_X0} y1={AXIS_Y} x2={PLOT_X1} y2={AXIS_Y} stroke="rgba(29,31,32,.4)" />
        <line x1={PLOT_X0} y1={30} x2={PLOT_X0} y2={AXIS_Y} stroke="rgba(29,31,32,.4)" />
        <text x={525} y={CAPTION_Y} fontSize={10.5} fill="#7a7a7d" textAnchor="middle" letterSpacing={1.4}>
          RANGE — {units.range}
        </text>
      </svg>
    </ChartCard>
  );
}
