// Display-unit conversion layer for the live, in-browser solve. Mirrors the
// lin/rng/vel/ene/ang_scale lambdas and warnings list in the handoff's
// backend/app/main.py:post_solve exactly, so the cockpit's live numbers match
// what /api/solve would return for the same Shot and unit_system.
import { IN_TO_M, RAD_TO_MIL, RAD_TO_MOA, YD_TO_M } from "./ballistics";
import type { Sample, Solution } from "./ballistics";

export interface UnitLabels {
  linear: "in" | "cm";
  angular: "MOA" | "mil";
  velocity: "fps" | "m/s";
  energy: "ft·lb" | "J";
  range: "yd" | "m";
}

export function unitLabels(metric: boolean): UnitLabels {
  return metric
    ? { linear: "cm", angular: "mil", velocity: "m/s", energy: "J", range: "m" }
    : { linear: "in", angular: "MOA", velocity: "fps", energy: "ft·lb", range: "yd" };
}

export const toLinear = (m: number, metric: boolean): number => (metric ? m * 100 : m / IN_TO_M);
export const toRange = (m: number, metric: boolean): number => (metric ? m : m / YD_TO_M);
export const toVelocity = (v: number, metric: boolean): number => (metric ? v : v / 0.3048);
export const toEnergy = (j: number, metric: boolean): number => (metric ? j : j * 0.737562);
export const angularScale = (metric: boolean): number => (metric ? RAD_TO_MIL : RAD_TO_MOA);

export interface DisplaySample {
  range: number;
  drop: number;
  drift: number;
  driftWind: number;
  spin: number;
  velocity: number;
  mach: number;
  energy: number;
  /** angular correction AT THIS RANGE */
  elevation: number;
  windage: number;
  tof: number;
}

export function toDisplaySample(s: Sample, metric: boolean): DisplaySample {
  const scale = angularScale(metric);
  const r = Math.max(s.rangeM, 1e-6);
  return {
    range: toRange(s.rangeM, metric),
    drop: toLinear(s.dropM, metric),
    drift: toLinear(s.driftM, metric),
    driftWind: toLinear(s.driftWindM, metric),
    spin: toLinear(s.spinM, metric),
    velocity: toVelocity(s.velocityMs, metric),
    mach: s.mach,
    energy: toEnergy(s.energyJ, metric),
    elevation: (-s.dropM / r) * scale,
    windage: (s.driftM / r) * scale,
    tof: s.timeS,
  };
}

/** Mirrors post_solve's warnings list exactly — surfaced without a round trip. */
export function buildWarnings(sol: Solution): string[] {
  const warnings: string[] = [];
  if (!sol.reachedTarget) {
    warnings.push("Projectile did not reach the target range — reduce range or raise velocity.");
  }
  if (sol.sg < 1.4) {
    warnings.push(
      `Gyroscopic stability ${sol.sg.toFixed(2)} is marginal (below 1.4); the real ` +
        "ballistic coefficient will be worse than modelled.",
    );
  }
  if (sol.mach < 1.2) {
    warnings.push("Impact is transonic or subsonic — dispersion is not modelled here.");
  }
  return warnings;
}
