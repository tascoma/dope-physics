"""Pydantic v2 request/response models — the wire contract.

Wire units are SHOOTER units (yards, fps, grains, inches, °F, inHg, mph) with
`unit_system` deciding only how ANGLES and derived readouts come back. Keeping
one wire unit system and converting for display in the client is deliberate:
two unit systems on the wire means two sets of bugs.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator


class WindZoneIn(BaseModel):
    speed_mph: float = Field(0, ge=0, le=60)
    clock: float = Field(3, ge=0, lt=12, description="Direction wind comes FROM, clock hours")


class ShotIn(BaseModel):
    # projectile
    calibre_in: float = Field(..., gt=0.1, lt=1.0)
    length_in: float = Field(..., gt=0.2, lt=4.0)
    weight_gr: float = Field(..., gt=20, lt=1000)
    bc: float = Field(..., gt=0.05, lt=1.5)
    drag_model: Literal["G7", "G1"] = "G7"
    muzzle_fps: float = Field(2600, gt=500, lt=5000)
    muzzle_sd_fps: float = Field(0, ge=0, le=100)
    twist_in: float = Field(11, gt=3, lt=30)
    # rifle
    zero_yd: float = Field(100, ge=10, le=600)
    sight_height_in: float = Field(2.2, ge=0, le=6)
    # atmosphere
    temp_f: float = Field(59, ge=-40, le=140)
    humidity_pct: float = Field(50, ge=0, le=100)
    baro_in_hg: float = Field(29.92, ge=20, le=33)
    altitude_ft: float = Field(0, ge=-1500, le=20000)
    # wind
    wind: list[WindZoneIn] = Field(default_factory=lambda: [WindZoneIn()])
    # geometry
    target_yd: float = Field(1000, ge=10, le=4000)
    look_angle_deg: float = Field(0, ge=-60, le=60)
    latitude_deg: float = Field(39, ge=-90, le=90)
    azimuth_deg: float = Field(0, ge=0, lt=360)
    # switches — turning these off is the teaching mode
    include_spin_drift: bool = True
    include_coriolis: bool = True
    include_aero_jump: bool = True
    # output
    unit_system: Literal["imperial", "metric"] = "imperial"
    sample_step_yd: float = Field(100, ge=25, le=500)

    @model_validator(mode="after")
    def _wind_zone_count(self) -> "ShotIn":
        if len(self.wind) not in (1, 3):
            raise ValueError("wind must have exactly 1 zone (uniform) or 3 zones (thirds)")
        return self


class SampleOut(BaseModel):
    """One point on the trajectory. Ranges/offsets are in the requested unit
    system so the chart layer never converts."""
    range: float
    drop: float
    drift: float
    drift_wind: float
    spin: float
    velocity: float
    mach: float
    energy: float
    elevation: float          # angular correction at THIS range
    windage: float
    tof: float


class SolutionOut(BaseModel):
    # angular corrections to apply, in MOA (imperial) or mil (metric)
    elevation: float
    windage: float
    windage_direction: Literal["LEFT", "RIGHT"]
    angular_unit: Literal["MOA", "mil"]
    # linear
    drop: float
    drift: float
    wind_deflection: float
    spin_drift: float
    coriolis: float
    max_ordinate: float
    mv_spread: float
    linear_unit: Literal["in", "cm"]
    # scalars
    tof: float
    velocity: float
    mach: float
    energy: float
    launch_angle_moa: float
    sg: float
    aero_jump: float
    air_density: float
    sound_speed: float
    reached_target: bool
    warnings: list[str] = Field(default_factory=list)
    trajectory: list[SampleOut] = Field(default_factory=list)
    range_card: list[SampleOut] = Field(default_factory=list)


class CartridgeOut(BaseModel):
    """A preset. These are published figures, not measured on the user's rifle —
    the UI must say so, and truing must overwrite them."""
    id: str
    name: str
    calibre_in: float
    length_in: float
    weight_gr: float
    bc_g7: float
    bc_g1: float
    muzzle_fps: float
    twist_in: float
