/** Formats to `d` decimals, normalizing "-0.00" to "0.00". */
export function fx(v: number, d: number): string {
  const s = v.toFixed(d);
  return s === "-" + (0).toFixed(d) ? (0).toFixed(d) : s;
}

/** Clock-hour label, e.g. 3 -> "3:00", 4.5 -> "4:30". */
export function clk(c: number): string {
  const h = Math.floor(c) || 12;
  const m = c % 1 ? ":30" : ":00";
  return `${h}${m}`;
}

const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export function compass(deg: number): string {
  return COMPASS_POINTS[Math.round(deg / 22.5) % 16];
}

/** Grains -> grams. */
export function weightGrams(gr: number): number {
  return gr * 0.06479891;
}
