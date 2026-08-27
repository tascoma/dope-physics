// Ports the prototype's `maths(sol, u)` method — ten equation cards with the
// live, substituted values for this shot. Content, not logic: FRONTEND.md
// calls this "what makes the panel worth building."
import { FT_TO_M, GRAIN_TO_KG, OMEGA, TABLES, cdOf } from "./ballistics";
import type { Solution } from "./ballistics";
import type { ShotUIState } from "../state/shotState";
import { toEnergy, toLinear, toVelocity, unitLabels } from "./units";
import { fx } from "./format";

export interface EquationCard {
  title: string;
  eq: string;
  sub: string;
  note: string;
}

export function buildEquationCards(
  state: ShotUIState,
  solution: Solution,
  metric: boolean,
): EquationCard[] {
  const env = solution.atmosphere;
  const table = TABLES[state.dragModel];
  const velUnit = metric ? "m/s" : "fps";
  const energyUnit = metric ? "J" : "ft·lb";
  const angUnit = metric ? "mil" : "MOA";

  const zones = state.zonesEnabled ? state.wind : [state.wind[0], state.wind[0], state.wind[0]];
  const crossFromLeft =
    zones.reduce((a, z) => a - z.speedMph * Math.sin((z.clock / 12) * 2 * Math.PI), 0) / zones.length;
  const massKg = state.weightGr * GRAIN_TO_KG;
  const muzzleMach = (state.muzzleFps * FT_TO_M) / env.soundSpeed;

  return [
    {
      title: "Drag deceleration",
      eq: "a = k · ρ · Cd(M) · v² / BC",
      sub:
        `k = A/2m = 5.5855e-4   ρ = ${env.density.toFixed(4)}   ` +
        `Cd = ${cdOf(muzzleMach, table).toFixed(4)}   BC = ${state.bc.toFixed(3)}`,
      note:
        `Point-mass retardation against the ${state.dragModel} standard drag function. ` +
        `Cd is read from the ${state.dragModel} table by Mach number and scaled by the ballistic coefficient.`,
    },
    {
      title: "Air density",
      eq: "ρ = (P−Pv)/(Rd·T) + Pv/(Rv·T)",
      sub:
        `T = ${env.temperature.toFixed(1)} K   P = ${(env.pressure / 100).toFixed(1)} hPa   ` +
        `RH = ${state.humidityPct} %\nP = P₀(1 − 2.25577e-5·h)^5.25588`,
      note:
        "Station pressure is derived from sea-level baro and altitude; humidity lowers density " +
        "because water vapour is lighter than dry air.",
    },
    {
      title: "Speed of sound",
      eq: "c = 331.3 · √(1 + T/273.15)",
      sub: `c = ${Math.round(toVelocity(env.soundSpeed, metric))} ${velUnit}   impact Mach = ${solution.mach.toFixed(3)}`,
      note: "Every Cd lookup depends on this. Cold, dense air lowers c, pushing the bullet to a higher Mach and more drag.",
    },
    {
      title: "Gyroscopic stability (Miller)",
      eq: "SG = 30m / (t²·d³·l·(1+l²))",
      sub:
        `m = ${state.weightGr} gr   t = ${(state.twistIn / state.calibreIn).toFixed(1)} cal/turn   ` +
        `l = ${(state.lengthIn / state.calibreIn).toFixed(2)} cal\nSG = ${solution.sg.toFixed(3)}  (velocity-corrected)`,
      note: "SG drives both spin drift and aerodynamic jump. Below about 1.4 the bullet is marginally stable and BC degrades.",
    },
    {
      title: "Spin drift (Litz approximation)",
      eq: "d = 1.25 · (SG + 1.2) · TOF^1.83",
      sub: `TOF = ${solution.tofS.toFixed(3)} s  →  ${fx(toLinear(solution.spinM, metric), 2)} ${unitLabels(metric).linear}`,
      note: "An empirical fit, in inches, for right-hand twist. It is a function of time of flight, not range, so it grows fast at long distance.",
    },
    {
      title: "Coriolis acceleration",
      eq: "a = −2 Ω × v",
      sub:
        `Ω = 7.2921e-5 rad/s   φ = ${state.latitudeDeg}°   Az = ${state.azimuthDeg}°\n` +
        `Ω = (${coriolisComponent(state.latitudeDeg, state.azimuthDeg, "x")}, ` +
        `${coriolisComponent(state.latitudeDeg, state.azimuthDeg, "y")}, ` +
        `${coriolisComponent(state.latitudeDeg, state.azimuthDeg, "z")})`,
      note:
        "Integrated inside the solver rather than added afterwards. The horizontal component depends " +
        "on latitude only; the vertical (Eötvös) component depends on the azimuth of fire.",
    },
    {
      title: "Aerodynamic jump",
      eq: "AJ ≈ 0.01 · SG · w⊥",
      sub:
        `w⊥ (from left) = ${crossFromLeft.toFixed(1)} mph  →  ` +
        `${fx(metric ? solution.aeroJumpMoa / 3.438 : solution.aeroJumpMoa, 3)} ${angUnit}`,
      note: "A crosswind tilts the bullet's yaw axis at launch, throwing the group vertically. Wind from the left lifts a right-twist bullet.",
    },
    {
      title: "Angular hold",
      eq: "θ = arctan(offset / range)",
      sub: "1 mil = 3.600 in @ 100 yd   1 MOA = 1.047 in @ 100 yd",
      note: "Drop and drift are solved in linear units, then divided by slant range to give the dial. This is why the same drop is a different hold at every distance.",
    },
    {
      title: "Kinetic energy",
      eq: "E = ½ m v²",
      sub:
        `m = ${(massKg * 1000).toFixed(2)} g   v = ${Math.round(toVelocity(solution.velocityMs, metric))} ${velUnit}  →  ` +
        `${Math.round(toEnergy(solution.energyJ, metric))} ${energyUnit}`,
      note: "Energy falls with the square of velocity, so it decays much faster than velocity itself.",
    },
    {
      title: "Integration",
      eq: "Runge–Kutta 4, Δt = 2 ms",
      sub:
        "zero solved by bisection on launch angle (28 iterations)\n" +
        `look angle ${state.lookAngleDeg}° rotates gravity into the sight-line frame`,
      note: "The trajectory is integrated in a frame aligned with the line of sight, so range is slant range and drop is measured perpendicular to the sight line.",
    },
  ];
}

function coriolisComponent(latDeg: number, aziDeg: number, axis: "x" | "y" | "z"): string {
  const lat = (latDeg * Math.PI) / 180;
  const azi = (aziDeg * Math.PI) / 180;
  const value =
    axis === "x"
      ? OMEGA * Math.cos(lat) * Math.cos(azi)
      : axis === "y"
        ? OMEGA * Math.sin(lat)
        : -OMEGA * Math.cos(lat) * Math.sin(azi);
  return value.toExponential(2);
}
