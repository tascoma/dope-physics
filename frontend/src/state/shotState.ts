import { DEFAULT_SHOT, type DragModel, type Shot, type WindZone } from "../lib/ballistics";
import type { CartridgeOut } from "../api/client";

export type ViewKey = "side" | "top" | "scope" | "curves" | "dope";
export type UnitSystem = "imperial" | "metric";

export interface WindZoneState {
  speedMph: number;
  clock: number;
}

/** Scalar fields the left rail's sliders write directly via SET_FIELD. */
export interface ScalarFields {
  bc: number;
  muzzleFps: number;
  muzzleSdFps: number;
  weightGr: number;
  twistIn: number;
  zeroYd: number;
  sightHeightIn: number;
  tempF: number;
  humidityPct: number;
  baroInHg: number;
  altitudeFt: number;
  targetYd: number;
  lookAngleDeg: number;
  targetPlateIn: number;
  latitudeDeg: number;
  azimuthDeg: number;
}

export interface ShotUIState extends ScalarFields {
  cartridgeId: string;
  /** Fixed by the selected preset, not slider-controlled. */
  calibreIn: number;
  lengthIn: number;
  /** Published BCs of the selected preset — needed to rescale `bc` on a drag-model switch. */
  cartridgeBcG7: number;
  cartridgeBcG1: number;
  dragModel: DragModel;
  unitSystem: UnitSystem;
  zonesEnabled: boolean;
  wind: [WindZoneState, WindZoneState, WindZoneState];
  view: ViewKey;
  showMath: boolean;
  /** 0..1 progress through the FIRE animation, or null when idle. */
  animProgress: number | null;
}

export const DEFAULT_UI_STATE: ShotUIState = {
  cartridgeId: "308win-175smk",
  calibreIn: DEFAULT_SHOT.calibreIn,
  lengthIn: DEFAULT_SHOT.lengthIn,
  cartridgeBcG7: 0.243,
  cartridgeBcG1: 0.496,
  bc: DEFAULT_SHOT.bc,
  muzzleFps: DEFAULT_SHOT.muzzleFps,
  muzzleSdFps: DEFAULT_SHOT.muzzleSdFps,
  weightGr: DEFAULT_SHOT.weightGr,
  twistIn: DEFAULT_SHOT.twistIn,
  zeroYd: DEFAULT_SHOT.zeroYd,
  sightHeightIn: DEFAULT_SHOT.sightHeightIn,
  tempF: DEFAULT_SHOT.tempF,
  humidityPct: DEFAULT_SHOT.humidityPct,
  baroInHg: DEFAULT_SHOT.baroInHg,
  altitudeFt: DEFAULT_SHOT.altitudeFt,
  dragModel: DEFAULT_SHOT.dragModel,
  unitSystem: "imperial",
  zonesEnabled: false,
  wind: [
    { speedMph: 8, clock: 3 },
    { speedMph: 12, clock: 2 },
    { speedMph: 6, clock: 4.5 },
  ],
  targetYd: DEFAULT_SHOT.targetYd,
  lookAngleDeg: DEFAULT_SHOT.lookAngleDeg,
  targetPlateIn: 20,
  latitudeDeg: DEFAULT_SHOT.latitudeDeg,
  azimuthDeg: DEFAULT_SHOT.azimuthDeg,
  view: "side",
  showMath: false,
  animProgress: null,
};

export type ShotAction =
  | { type: "SET_FIELD"; key: keyof ScalarFields; value: number }
  | { type: "SET_CARTRIDGE"; cartridge: CartridgeOut }
  | { type: "SET_DRAG_MODEL"; model: DragModel }
  | { type: "SET_UNIT_SYSTEM"; unitSystem: UnitSystem }
  | { type: "TOGGLE_ZONES" }
  | { type: "SET_WIND_ZONE"; index: 0 | 1 | 2; field: "speedMph" | "clock"; value: number }
  | { type: "SET_VIEW"; view: ViewKey }
  | { type: "TOGGLE_SHOW_MATH" }
  | { type: "SET_ANIM_PROGRESS"; progress: number | null };

export function shotReducer(state: ShotUIState, action: ShotAction): ShotUIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.key]: action.value };

    case "SET_CARTRIDGE": {
      const c = action.cartridge;
      return {
        ...state,
        cartridgeId: c.id,
        calibreIn: c.calibre_in,
        lengthIn: c.length_in,
        weightGr: c.weight_gr,
        twistIn: c.twist_in,
        muzzleFps: c.muzzle_fps,
        bc: state.dragModel === "G7" ? c.bc_g7 : c.bc_g1,
        cartridgeBcG7: c.bc_g7,
        cartridgeBcG1: c.bc_g1,
      };
    }

    case "SET_DRAG_MODEL": {
      if (action.model === state.dragModel) return state;
      // Rescale BC preserving the user's ratio to the preset's published value —
      // otherwise switching G7→G1 silently triples the drop (FRONTEND.md).
      const curPublished = state.dragModel === "G7" ? state.cartridgeBcG7 : state.cartridgeBcG1;
      const ratio = curPublished ? state.bc / curPublished : 1;
      const newPublished = action.model === "G7" ? state.cartridgeBcG7 : state.cartridgeBcG1;
      return { ...state, dragModel: action.model, bc: Number((newPublished * ratio).toFixed(3)) };
    }

    case "SET_UNIT_SYSTEM":
      return { ...state, unitSystem: action.unitSystem };

    case "TOGGLE_ZONES":
      return { ...state, zonesEnabled: !state.zonesEnabled };

    case "SET_WIND_ZONE": {
      const wind = [...state.wind] as [WindZoneState, WindZoneState, WindZoneState];
      wind[action.index] = { ...wind[action.index], [action.field]: action.value };
      return { ...state, wind };
    }

    case "SET_VIEW":
      return { ...state, view: action.view };

    case "TOGGLE_SHOW_MATH":
      return { ...state, showMath: !state.showMath };

    case "SET_ANIM_PROGRESS":
      return { ...state, animProgress: action.progress };

    default:
      return state;
  }
}

export function toShot(state: ShotUIState): Shot {
  const zones: WindZone[] = state.zonesEnabled
    ? state.wind.map((w) => ({ speedMph: w.speedMph, clock: w.clock }))
    : [{ speedMph: state.wind[0].speedMph, clock: state.wind[0].clock }];
  return {
    calibreIn: state.calibreIn,
    lengthIn: state.lengthIn,
    weightGr: state.weightGr,
    bc: state.bc,
    dragModel: state.dragModel,
    muzzleFps: state.muzzleFps,
    muzzleSdFps: state.muzzleSdFps,
    twistIn: state.twistIn,
    zeroYd: state.zeroYd,
    sightHeightIn: state.sightHeightIn,
    tempF: state.tempF,
    humidityPct: state.humidityPct,
    baroInHg: state.baroInHg,
    altitudeFt: state.altitudeFt,
    wind: zones,
    targetYd: state.targetYd,
    lookAngleDeg: state.lookAngleDeg,
    latitudeDeg: state.latitudeDeg,
    azimuthDeg: state.azimuthDeg,
    includeSpinDrift: true,
    includeCoriolis: true,
    includeAeroJump: true,
  };
}
