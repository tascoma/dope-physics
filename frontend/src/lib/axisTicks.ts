// The 1-2-5-10 decade tick-step rule, shared by the side, plan, and velocity
// view axes (FRONTEND.md: "~5–7 divisions per axis").
import { YD_TO_M } from "./ballistics";
import { toRange } from "./units";

export interface AxisTick {
  pos: number;
  label: string;
}

export function niceStep(range: number, divisions: number): number {
  const raw = range / divisions;
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
  const m = Math.abs(raw) / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** X-axis (range) gridlines — shared across side, plan, and velocity views. */
export function computeXTicks(
  slantM: number,
  metric: boolean,
  toSvgX: (m: number) => number,
): AxisTick[] {
  const rangeTotal = toRange(slantM, metric);
  const step = niceStep(rangeTotal, 7);
  const out: AxisTick[] = [];
  for (let r = 0; r <= rangeTotal + 1e-6; r += step) {
    const meters = metric ? r : r * YD_TO_M;
    out.push({ pos: toSvgX(meters), label: Math.round(r).toString() });
  }
  return out;
}

export function computeYTicks(
  min: number,
  max: number,
  toSvgY: (v: number) => number,
  format: (v: number) => string,
): AxisTick[] {
  const step = niceStep(max - min, 5);
  const out: AxisTick[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
    out.push({ pos: toSvgY(v), label: format(v) });
  }
  return out;
}
