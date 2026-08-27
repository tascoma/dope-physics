/**
 * Exterior ballistics solver — TypeScript port of `backend/app/ballistics.py`.
 *
 * WHY THIS EXISTS TWICE. Sliders must re-solve on every pointer move; a HTTP
 * round trip per frame is not that. So the browser carries this port for live
 * feedback and the FastAPI service stays the authority for anything saved,
 * shared, printed or exported.
 *
 * THE RULE. The two implementations must agree. `golden_vectors.json` at the
 * root of this bundle pins five cases; both sides test against it. If you touch
 * the algorithm, touch both files and regenerate the vectors in the same commit.
 *
 * FRAME. x downrange along the LINE OF SIGHT (so range is slant range),
 * y perpendicular and positive up (so y is drop from the sight line),
 * z to the shooter's right. SI internally; convert at the boundary.
 */

export type DragModel = "G7" | "G1";

const G1: ReadonlyArray<readonly [number, number]> = [
  [0, 0.2629], [0.05, 0.2558], [0.1, 0.2487], [0.15, 0.2413], [0.2, 0.2344],
  [0.25, 0.2278], [0.3, 0.2214], [0.35, 0.2155], [0.4, 0.2104], [0.45, 0.2061],
  [0.5, 0.2032], [0.55, 0.202], [0.6, 0.2034], [0.7, 0.2165], [0.725, 0.223],
  [0.75, 0.2313], [0.775, 0.2417], [0.8, 0.2546], [0.825, 0.2706], [0.85, 0.2901],
  [0.875, 0.3136], [0.9, 0.3415], [0.925, 0.3734], [0.95, 0.4084], [0.975, 0.4448],
  [1, 0.4805], [1.025, 0.5136], [1.05, 0.5427], [1.075, 0.5677], [1.1, 0.5883],
  [1.15, 0.6191], [1.2, 0.6393], [1.3, 0.6518], [1.4, 0.6474], [1.5, 0.6357],
  [1.6, 0.6196], [1.8, 0.5852], [2, 0.5533], [2.2, 0.5252], [2.5, 0.489],
  [3, 0.4389], [3.5, 0.4032], [4, 0.3775], [4.5, 0.3611], [5, 0.3498],
];

const G7: ReadonlyArray<readonly [number, number]> = [
  [0, 0.1198], [0.05, 0.1197], [0.1, 0.1196], [0.15, 0.1194], [0.2, 0.1193],
  [0.25, 0.1194], [0.3, 0.1194], [0.35, 0.1194], [0.4, 0.1193], [0.45, 0.1193],
  [0.5, 0.1194], [0.55, 0.1193], [0.6, 0.1194], [0.65, 0.1197], [0.7, 0.1202],
  [0.725, 0.1207], [0.75, 0.1215], [0.775, 0.1226], [0.8, 0.1242], [0.825, 0.1266],
  [0.85, 0.1306], [0.875, 0.1368], [0.9, 0.1464], [0.925, 0.166], [0.95, 0.2054],
  [0.975, 0.2993], [1, 0.3803], [1.025, 0.4015], [1.05, 0.4043], [1.075, 0.4034],
  [1.1, 0.4014], [1.15, 0.3955], [1.2, 0.3884], [1.3, 0.3733], [1.4, 0.3584],
  [1.5, 0.3435], [1.6, 0.3292], [1.8, 0.3026], [2, 0.2799], [2.2, 0.2597],
  [2.5, 0.2329], [3, 0.1988], [3.5, 0.1752], [4, 0.1584], [4.5, 0.1459], [5, 0.1367],
];

export const TABLES: Record<DragModel, ReadonlyArray<readonly [number, number]>> = { G1, G7 };

export const OMEGA = 7.292115e-5;
export const GRAVITY = 9.80665;
/** A / 2m of the standard projectile (1 in, 1 lb) — makes BC in lb/in² work. */
export const K_STD = 5.5855e-4;

export const YD_TO_M = 0.9144;
export const FT_TO_M = 0.3048;
export const IN_TO_M = 0.0254;
export const MPH_TO_MS = 0.44704;
export const GRAIN_TO_KG = 6.479891e-5;
export const RAD_TO_MOA = 10800 / Math.PI;
export const RAD_TO_MIL = 1000;

export function cdOf(mach: number, table: ReadonlyArray<readonly [number, number]>): number {
  if (mach <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (mach >= last[0]) return last[1];
  let lo = 0;
  let hi = table.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid][0] <= mach) lo = mid;
    else hi = mid;
  }
  const [x0, y0] = table[lo];
  const [x1, y1] = table[hi];
  return y0 + ((y1 - y0) * (mach - x0)) / (x1 - x0);
}

export interface Atmosphere {
  density: number;      // kg/m³
  soundSpeed: number;   // m/s
  pressure: number;     // Pa, station
  temperature: number;  // K
}

export function atmosphere(
  tempF: number, humidityPct: number, baroInHg: number, altitudeFt: number,
): Atmosphere {
  const tC = (tempF - 32) / 1.8;
  const tK = tC + 273.15;
  const pSea = baroInHg * 3386.389;
  const hM = altitudeFt * FT_TO_M;
  const pStation = pSea * Math.pow(Math.max(1 - 2.25577e-5 * hM, 0.05), 5.25588);
  const pSat = 610.78 * Math.pow(10, (7.5 * tC) / (tC + 237.3));
  const pVapour = (humidityPct / 100) * pSat;
  return {
    density: (pStation - pVapour) / (287.058 * tK) + pVapour / (461.495 * tK),
    soundSpeed: 331.3 * Math.sqrt(1 + tC / 273.15),
    pressure: pStation,
    temperature: tK,
  };
}

/** Miller gyroscopic stability factor, velocity-corrected. Below ~1.4 is marginal. */
export function millerSG(
  weightGr: number, twistIn: number, calibreIn: number, lengthIn: number, muzzleFps: number,
): number {
  const t = twistIn / calibreIn;
  const l = lengthIn / calibreIn;
  const base = (30 * weightGr) / (t * t * calibreIn ** 3 * l * (1 + l * l));
  return base * Math.pow(Math.max(muzzleFps, 500) / 2800, 1 / 3);
}

export interface WindZone {
  /** mph */
  speedMph: number;
  /** direction the wind comes FROM, in clock hours: 12 head, 3 right, 6 tail, 9 left */
  clock: number;
}

/** (wx, wz) in m/s — the direction the air MOVES. */
export function windVector(z: WindZone): [number, number] {
  const a = (z.clock / 12) * 2 * Math.PI;
  const sp = z.speedMph * MPH_TO_MS;
  return [-sp * Math.cos(a), -sp * Math.sin(a)];
}

export interface Shot {
  calibreIn: number;
  lengthIn: number;
  weightGr: number;
  bc: number;
  dragModel: DragModel;
  muzzleFps: number;
  muzzleSdFps: number;
  twistIn: number;
  zeroYd: number;
  sightHeightIn: number;
  tempF: number;
  humidityPct: number;
  baroInHg: number;
  altitudeFt: number;
  /** 1 zone = uniform, 3 zones = thirds of the path */
  wind: WindZone[];
  targetYd: number;
  lookAngleDeg: number;
  latitudeDeg: number;
  azimuthDeg: number;
  includeSpinDrift: boolean;
  includeCoriolis: boolean;
  includeAeroJump: boolean;
}

export const DEFAULT_SHOT: Shot = {
  calibreIn: 0.308, lengthIn: 1.24, weightGr: 175, bc: 0.243, dragModel: "G7",
  muzzleFps: 2600, muzzleSdFps: 12, twistIn: 11,
  zeroYd: 100, sightHeightIn: 2.2,
  tempF: 59, humidityPct: 50, baroInHg: 29.92, altitudeFt: 0,
  wind: [{ speedMph: 8, clock: 3 }],
  targetYd: 1000, lookAngleDeg: 0, latitudeDeg: 39, azimuthDeg: 0,
  includeSpinDrift: true, includeCoriolis: true, includeAeroJump: true,
};

export interface Sample {
  rangeM: number;
  dropM: number;
  driftM: number;
  driftWindM: number;
  spinM: number;
  velocityMs: number;
  mach: number;
  energyJ: number;
  timeS: number;
}

export interface Solution {
  launchAngleRad: number;
  tofS: number;
  dropM: number;
  driftM: number;
  spinM: number;
  coriolisM: number;
  windOnlyM: number;
  velocityMs: number;
  mach: number;
  energyJ: number;
  maxOrdinateM: number;
  slantM: number;
  sg: number;
  aeroJumpMoa: number;
  mvSpreadM: number;
  reachedTarget: boolean;
  atmosphere: Atmosphere;
  samples: Sample[];
}

type State = [number, number, number, number, number, number];

interface IntegrateOpts {
  theta: number;
  alpha: number;
  endX: number;
  atmo: Atmosphere;
  bc: number;
  table: ReadonlyArray<readonly [number, number]>;
  windAt: (x: number) => [number, number];
  omega: [number, number, number] | null;
  v0: number;
  sightH: number;
  dt?: number;
  sampleEvery?: number;
}

function integrate(o: IntegrateOpts) {
  const dt = o.dt ?? 0.002;
  const gx = -GRAVITY * Math.sin(o.alpha);
  const gy = -GRAVITY * Math.cos(o.alpha);
  let s: State = [0, -o.sightH, 0, o.v0 * Math.cos(o.theta), o.v0 * Math.sin(o.theta), 0];
  let t = 0;
  const samples: Array<{ t: number; s: State }> = [];
  let acc = 0;

  const deriv = (st: State): State => {
    const [wx, wz] = o.windAt(st[0]);
    const rx = st[3] - wx;
    const ry = st[4];
    const rz = st[5] - wz;
    const v = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const kd = (K_STD * o.atmo.density * cdOf(v / o.atmo.soundSpeed, o.table) * v) / o.bc;
    let ax = gx - kd * rx;
    let ay = gy - kd * ry;
    let az = -kd * rz;
    if (o.omega) {
      const [ox, oy, oz] = o.omega;
      ax -= 2 * (oy * st[5] - oz * st[4]);
      ay -= 2 * (oz * st[3] - ox * st[5]);
      az -= 2 * (ox * st[4] - oy * st[3]);
    }
    return [st[3], st[4], st[5], ax, ay, az];
  };
  const step = (st: State, k: State, h: number): State =>
    st.map((a, i) => a + k[i] * h) as State;

  if (o.sampleEvery) samples.push({ t: 0, s: [...s] as State });
  let prev: State = [...s] as State;
  let prevT = 0;

  while (s[0] < o.endX && t < 8) {
    const k1 = deriv(s);
    const k2 = deriv(step(s, k1, dt / 2));
    const k3 = deriv(step(s, k2, dt / 2));
    const k4 = deriv(step(s, k3, dt));
    prev = [...s] as State;
    prevT = t;
    s = s.map((a, i) => a + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) as State;
    t += dt;
    if (o.sampleEvery) {
      acc += dt;
      if (acc >= o.sampleEvery) {
        acc = 0;
        samples.push({ t, s: [...s] as State });
      }
    }
  }

  const reached = s[0] >= o.endX * 0.999;
  const span = s[0] - prev[0];
  const u = span > 1e-9 ? (o.endX - prev[0]) / span : 0;
  const end = prev.map((p, i) => p + (s[i] - p) * u) as State;
  const tEnd = prevT + (t - prevT) * u;
  if (o.sampleEvery) samples.push({ t: tEnd, s: end });
  return { end, tEnd, samples, reached };
}

export function solve(shot: Shot): Solution {
  const atmo = atmosphere(shot.tempF, shot.humidityPct, shot.baroInHg, shot.altitudeFt);
  const table = TABLES[shot.dragModel];
  const v0 = shot.muzzleFps * FT_TO_M;
  const sightH = shot.sightHeightIn * IN_TO_M;
  const zeroM = Math.max(shot.zeroYd, 10) * YD_TO_M;
  const slantM = Math.max(shot.targetYd, 10) * YD_TO_M;
  const alpha = (shot.lookAngleDeg * Math.PI) / 180;
  const still = (): [number, number] => [0, 0];

  // 1. Zero — bisect the launch angle. Flat, still air: that is what zeroing
  //    on a calm range establishes, so that is what we solve for.
  let lo = -0.004;
  let hi = 0.06;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    const r = integrate({
      theta: mid, alpha: 0, endX: zeroM, atmo, bc: shot.bc, table,
      windAt: still, omega: null, v0, sightH, dt: 0.003,
    });
    if (r.end[1] < 0) lo = mid;
    else hi = mid;
  }
  const theta = (lo + hi) / 2;

  // 2. Wind field.
  const zones = shot.wind.length === 3 ? shot.wind : [shot.wind[0], shot.wind[0], shot.wind[0]];
  const vecs = zones.map(windVector);
  const third = slantM / 3;
  const windAt = (x: number): [number, number] =>
    x < third ? vecs[0] : x < 2 * third ? vecs[1] : vecs[2];

  // 3. Earth rotation in the shooter's frame.
  const lat = (shot.latitudeDeg * Math.PI) / 180;
  const azi = (shot.azimuthDeg * Math.PI) / 180;
  const omega: [number, number, number] | null = shot.includeCoriolis
    ? [
        OMEGA * Math.cos(lat) * Math.cos(azi),
        OMEGA * Math.sin(lat),
        -OMEGA * Math.cos(lat) * Math.sin(azi),
      ]
    : null;

  // 4. The shot, plus reference runs that let us attribute the lateral budget.
  const main = integrate({
    theta, alpha, endX: slantM, atmo, bc: shot.bc, table, windAt, omega,
    v0, sightH, dt: 0.002, sampleEvery: 0.008,
  });
  const noCor = integrate({
    theta, alpha, endX: slantM, atmo, bc: shot.bc, table, windAt, omega: null,
    v0, sightH, dt: 0.003,
  });
  const noWind = integrate({
    theta, alpha, endX: slantM, atmo, bc: shot.bc, table, windAt: still, omega: null,
    v0, sightH, dt: 0.003,
  });

  const sg = millerSG(shot.weightGr, shot.twistIn, shot.calibreIn, shot.lengthIn, shot.muzzleFps);
  // Litz fit, inches, right-hand twist. A function of TIME, not range.
  const spinAt = (t: number) =>
    shot.includeSpinDrift ? 1.25 * (sg + 1.2) * Math.pow(Math.max(t, 0), 1.83) * IN_TO_M : 0;

  const crossFromLeft =
    zones.reduce((a, z) => a - z.speedMph * Math.sin((z.clock / 12) * 2 * Math.PI), 0) /
    zones.length;
  const aeroJumpMoa = shot.includeAeroJump ? 0.01 * sg * crossFromLeft : 0;

  const massKg = shot.weightGr * GRAIN_TO_KG;
  const samples: Sample[] = main.samples.map(({ t, s }) => {
    const v = Math.sqrt(s[3] * s[3] + s[4] * s[4] + s[5] * s[5]);
    const spin = spinAt(t);
    return {
      rangeM: s[0], dropM: s[1], driftM: s[2] + spin, driftWindM: s[2], spinM: spin,
      velocityMs: v, mach: v / atmo.soundSpeed, energyJ: 0.5 * massKg * v * v, timeS: t,
    };
  });

  let mvSpreadM = 0;
  if (shot.muzzleSdFps) {
    const fast = integrate({
      theta, alpha, endX: slantM, atmo, bc: shot.bc, table, windAt: still, omega: null,
      v0: v0 + shot.muzzleSdFps * FT_TO_M, sightH, dt: 0.003,
    });
    mvSpreadM = Math.abs(fast.end[1] - noWind.end[1]);
  }

  const e = main.end;
  const vEnd = Math.sqrt(e[3] * e[3] + e[4] * e[4] + e[5] * e[5]);
  return {
    launchAngleRad: theta,
    tofS: main.tEnd,
    dropM: e[1],
    driftM: e[2] + spinAt(main.tEnd),
    spinM: spinAt(main.tEnd),
    coriolisM: e[2] - noCor.end[2],
    windOnlyM: noCor.end[2],
    velocityMs: vEnd,
    mach: vEnd / atmo.soundSpeed,
    energyJ: 0.5 * massKg * vEnd * vEnd,
    maxOrdinateM: samples.reduce((a, s) => Math.max(a, s.dropM), -Infinity),
    slantM,
    sg,
    aeroJumpMoa,
    mvSpreadM,
    reachedTarget: main.reached,
    atmosphere: atmo,
    samples,
  };
}

/**
 * Angular corrections to APPLY. Elevation is always "up"; positive windage
 * means the bullet goes right, so the shooter dials LEFT.
 */
export function corrections(sol: Solution, metric: boolean) {
  const scale = metric ? RAD_TO_MIL : RAD_TO_MOA;
  const aj = metric ? sol.aeroJumpMoa / 3.438 : sol.aeroJumpMoa;
  const elevation = (-sol.dropM / sol.slantM) * scale - aj;
  const windage = (sol.driftM / sol.slantM) * scale;
  return {
    elevation,
    windage: Math.abs(windage),
    windageDirection: windage >= 0 ? ("LEFT" as const) : ("RIGHT" as const),
    unit: metric ? ("mil" as const) : ("MOA" as const),
  };
}

/** Nearest sample at each step of range — the range-card rows. */
export function rangeCard(sol: Solution, stepYd = 100): Sample[] {
  if (!sol.samples.length) return [];
  const out: Sample[] = [];
  const limit = sol.samples[sol.samples.length - 1].rangeM;
  for (let r = stepYd * YD_TO_M; r <= limit + 1e-6; r += stepYd * YD_TO_M) {
    out.push(
      sol.samples.reduce((best, s) =>
        Math.abs(s.rangeM - r) < Math.abs(best.rangeM - r) ? s : best,
      ),
    );
  }
  return out;
}
