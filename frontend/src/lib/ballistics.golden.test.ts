// Golden-vector regression test — the other half of the parity contract in
// backend/tests/golden_vectors.json (the Python side owns it since
// services/ballistics.py is the canonical implementation this port mirrors).
// If this drifts from backend/tests/test_golden.py, the range card a shooter
// prints disagrees with the screen they read it off.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { IN_TO_M, RAD_TO_MOA, solve, type Shot } from "./ballistics";

// vitest runs with cwd = frontend/ (the package root).
const VECTORS_PATH = resolve(process.cwd(), "..", "backend", "tests", "golden_vectors.json");
const VECTORS = JSON.parse(readFileSync(VECTORS_PATH, "utf-8"));

interface GoldenInput {
  cal: number;
  len: number;
  gr: number;
  bc: number;
  model: "G1" | "G7";
  mv: number;
  tw: number;
  zero: number;
  sightH: number;
  tempF: number;
  humid: number;
  baro: number;
  altFt: number;
  zones: { s: number; c: number }[];
  tgt: number;
  incl: number;
  lat: number;
  azi: number;
}

function shotFrom(i: GoldenInput): Shot {
  return {
    calibreIn: i.cal, lengthIn: i.len, weightGr: i.gr, bc: i.bc, dragModel: i.model,
    muzzleFps: i.mv, muzzleSdFps: 0, twistIn: i.tw,
    zeroYd: i.zero, sightHeightIn: i.sightH,
    tempF: i.tempF, humidityPct: i.humid, baroInHg: i.baro, altitudeFt: i.altFt,
    wind: i.zones.map((z) => ({ speedMph: z.s, clock: z.c })),
    targetYd: i.tgt, lookAngleDeg: i.incl, latitudeDeg: i.lat, azimuthDeg: i.azi,
    includeSpinDrift: true, includeCoriolis: true, includeAeroJump: true,
  };
}

function approx(actual: number, expected: number, tol: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
}

describe("ballistics.ts golden vectors", () => {
  for (const c of VECTORS.cases) {
    it(c.id, () => {
      const s = solve(shotFrom(c.input));
      const e = c.expected;
      const tol = VECTORS.tolerances;
      const slant = c.input.tgt * 0.9144;

      approx(s.dropM / IN_TO_M, e.dropIn, tol.dropIn);
      approx(s.tofS, e.tofS, tol.tofS);
      approx(s.velocityMs / 0.3048, e.vImpactFps, tol.vImpactFps);
      approx(s.energyJ * 0.737562, e.energyFtLb, tol.energyFtLb);
      approx(s.sg, e.sg, tol.sg);

      const elev = (-s.dropM / slant) * RAD_TO_MOA - s.aeroJumpMoa;
      const wind = (s.driftM / slant) * RAD_TO_MOA;
      approx(elev, e.elevMOA, tol.elevMOA);
      approx(wind, e.windMOA, tol.windMOA);
    });
  }
});
