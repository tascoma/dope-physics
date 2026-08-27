// Ports the 4 non-golden invariant checks from backend/tests/test_golden.py.
import { DEFAULT_SHOT, IN_TO_M, solve, type Shot } from "./ballistics";

function shot(overrides: Partial<Shot>): Shot {
  return { ...DEFAULT_SHOT, muzzleSdFps: 0, ...overrides };
}

describe("ballistics.ts invariants", () => {
  it("zero crosses the line of sight", () => {
    const s = solve(
      shot({
        calibreIn: 0.308, lengthIn: 1.24, weightGr: 175, bc: 0.243,
        zeroYd: 100, targetYd: 100, wind: [{ speedMph: 0, clock: 12 }],
        includeCoriolis: false, includeSpinDrift: false,
      }),
    );
    expect(Math.abs(s.dropM / IN_TO_M)).toBeLessThan(0.05);
  });

  it("no lateral drift when wind, Coriolis, and aero jump are off", () => {
    const s = solve(
      shot({
        calibreIn: 0.308, lengthIn: 1.24, weightGr: 175, bc: 0.243,
        targetYd: 1000, wind: [{ speedMph: 0, clock: 12 }],
        includeCoriolis: false, includeSpinDrift: false, includeAeroJump: false,
      }),
    );
    expect(Math.abs(s.driftM)).toBeLessThan(1e-6);
  });

  it("denser air drops more than thin, hot, high-altitude air", () => {
    const common = {
      calibreIn: 0.308, lengthIn: 1.24, weightGr: 175, bc: 0.243,
      targetYd: 1000, wind: [{ speedMph: 0, clock: 12 }],
    };
    const cold = solve(shot({ ...common, tempF: 10, altitudeFt: 0, baroInHg: 30.5 }));
    const hot = solve(shot({ ...common, tempF: 100, altitudeFt: 8000, baroInHg: 29.4 }));
    expect(cold.dropM).toBeLessThan(hot.dropM);
  });

  it("uphill and downhill are not symmetric in slant drop", () => {
    const common = {
      calibreIn: 0.308, lengthIn: 1.24, weightGr: 175, bc: 0.243,
      targetYd: 800, wind: [{ speedMph: 0, clock: 12 }],
    };
    const up = solve(shot({ ...common, lookAngleDeg: 30 }));
    const flat = solve(shot({ ...common, lookAngleDeg: 0 }));
    expect(Math.abs(up.dropM)).toBeLessThan(Math.abs(flat.dropM));
    expect(Math.abs(up.dropM)).not.toBeCloseTo(Math.abs(flat.dropM), 1);
  });
});
