// Shared SVG chart geometry — plot-area bounds and helpers used by all four
// hand-built line/area charts (side, plan, velocity views share the same
// viewBox and X axis; the range card is a table, the reticle its own scale).
import type { Sample } from "./ballistics";

export const PLOT_X0 = 72;
export const PLOT_X1 = 978;
export const PLOT_Y0 = 40;
export const PLOT_Y1 = 356;
export const AXIS_Y = 368;
export const TICK_LABEL_Y = 386;
export const CAPTION_Y = 416;

/** Thins a dense sample array to at most ~`maxPoints` for SVG path drawing. */
export function decimate<T>(arr: T[], maxPoints = 380): T[] {
  const n = arr.length;
  const k = Math.max(1, Math.floor(n / maxPoints));
  return arr.filter((_, i) => i % k === 0 || i === n - 1);
}

export function svgPath(points: [number, number][]): string {
  return points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
}

/** Maps downrange distance (metres, 0..slantM) to plot-area X. */
export function scaleX(slantM: number): (rangeM: number) => number {
  return (x: number) => PLOT_X0 + (PLOT_X1 - PLOT_X0) * Math.min(x / slantM, 1);
}

/** Current sample under the FIRE animation marker, or null when idle. Indexes
 * the full-resolution sample array, not the decimated one used for drawing. */
export function bulletSample(samples: Sample[], animProgress: number | null): Sample | null {
  if (animProgress == null || samples.length === 0) return null;
  const index = Math.min(samples.length - 1, Math.round(animProgress * (samples.length - 1)));
  return samples[index];
}
