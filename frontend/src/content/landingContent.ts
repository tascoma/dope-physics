// Landing page copy — final per FRONTEND.md ("Use it verbatim"), transcribed
// from design/Landing.dc.html's renderVals(). Data-driven so the two 7-row
// tables aren't hardcoded JSX.

export interface ModelRow {
  n: string;
  prop: string;
  val: string;
  rem: string;
}

export const MODEL_ROWS: ModelRow[] = [
  { n: "01", prop: "Integrator", val: "Runge–Kutta 4", rem: "Fixed 2 ms step, in a frame aligned with the line of sight" },
  { n: "02", prop: "Drag function", val: "G7 / G1", rem: "Standard tables, 45 points, interpolated on Mach number" },
  { n: "03", prop: "Air density", val: "Humid air", rem: "Station pressure from sea-level baro and altitude; vapour pressure removed" },
  { n: "04", prop: "Zero solution", val: "Bisection", rem: "28 iterations on launch angle against the sight-height offset" },
  { n: "05", prop: "Coriolis", val: "−2 Ω × v", rem: "Integrated inside the loop from latitude and azimuth, not added after" },
  { n: "06", prop: "Stability", val: "Miller", rem: "Velocity-corrected gyroscopic stability factor from twist, length and mass" },
  { n: "07", prop: "Wind", val: "Three zones", rem: "Speed and clock direction resolved per third of the flight path" },
];

export interface PrincipleCell {
  title: string;
  eq: string;
  body: string;
}

export const PRINCIPLE_CELLS: PrincipleCell[] = [
  {
    title: "Drag and velocity decay",
    eq: "a = k · ρ · Cd(M) · v² / BC",
    body: "Retardation is recomputed at every step from the instantaneous Mach number, so the drag curve through the transonic band is the table's, not a straight line. Velocity, energy and time of flight all fall out of the same integration.",
  },
  {
    title: "Atmosphere",
    eq: "ρ = (P−Pv)/(Rd·T) + Pv/(Rv·T)",
    body: "Temperature, humidity, barometric pressure and altitude produce one density and one speed of sound. Both feed the drag term — cold dense air raises the Mach number and the drag with it, which is why a summer zero misses in November.",
  },
  {
    title: "Shot geometry",
    eq: "θ = arctan(offset / range)",
    body: "The trajectory is integrated along the sight line, so range is slant range and drop is measured perpendicular to it. Look angle rotates gravity into that frame rather than scaling the answer by a cosine.",
  },
];

export interface LimitRow {
  eff: string;
  how: string;
  trust: string;
}

export const LIMIT_ROWS: LimitRow[] = [
  { eff: "Spin drift", how: "Litz empirical fit on stability factor and time of flight, right-hand twist assumed", trust: "± 15 %" },
  { eff: "Aerodynamic jump", how: "Linear approximation from stability factor and crosswind component", trust: "± 25 %" },
  { eff: "Ballistic coefficient", how: "Single constant across the whole velocity band", trust: "true it yourself" },
  { eff: "Yaw of repose, precession", how: "Not modelled — a point mass has no rotational state", trust: "n/a" },
  { eff: "Vertical Coriolis (Eötvös)", how: "Solved, but sensitive to azimuth you may not know precisely", trust: "± 0.1 mil" },
  { eff: "Transonic instability", how: "Drag is table-accurate; bullet behaviour through Mach 1 is not", trust: "treat as advisory" },
  { eff: "Speed of sound", how: "Dry-air relation; humidity's small effect on c is ignored", trust: "± 0.3 %" },
];
