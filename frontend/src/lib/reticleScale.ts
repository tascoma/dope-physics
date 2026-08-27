const DIVISION_VALUES = [0.25, 0.5, 1, 2, 2.5, 5, 10, 20];

/**
 * Division value (in the current angular unit) so 4 divisions from centre
 * contain the hold with a 15% margin — without this, a large hold pegs the
 * marker off the glass. Falls back to 50 if even the largest step isn't enough.
 */
export function reticleDivision(elevation: number, windage: number): number {
  const need = Math.max(Math.abs(elevation), Math.abs(windage)) * 1.15;
  return DIVISION_VALUES.find((d) => d * 4 >= need) ?? 50;
}
