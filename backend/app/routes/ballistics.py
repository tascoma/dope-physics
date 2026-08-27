"""Ballistics endpoints.

Note on where the physics runs: the browser also carries a TypeScript port so
sliders can re-solve on every frame without a round trip. This endpoint is the
AUTHORITY — anything saved, shared, printed or exported must come from here.
`backend/tests/golden_vectors.json` is what keeps the two honest.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.ballistics import CartridgeOut, SampleOut, ShotIn, SolutionOut
from app.services.ballistics import (
    IN_TO_M,
    RAD_TO_MIL,
    RAD_TO_MOA,
    YD_TO_M,
    Shot,
    WindZone,
    range_card,
    solve,
)
from app.services.cartridges import CARTRIDGES

router = APIRouter(tags=["ballistics"])


@router.get("/cartridges", response_model=list[CartridgeOut])
def cartridges() -> list[CartridgeOut]:
    return [CartridgeOut(**c) for c in CARTRIDGES]


@router.post("/solve", response_model=SolutionOut)
def post_solve(body: ShotIn) -> SolutionOut:
    metric = body.unit_system == "metric"
    ang_scale = RAD_TO_MIL if metric else RAD_TO_MOA
    lin = (lambda m: m * 100.0) if metric else (lambda m: m / IN_TO_M)
    rng = (lambda m: m) if metric else (lambda m: m / YD_TO_M)
    vel = (lambda v: v) if metric else (lambda v: v / 0.3048)
    ene = (lambda j: j) if metric else (lambda j: j * 0.737562)

    shot = Shot(
        calibre_in=body.calibre_in,
        length_in=body.length_in,
        weight_gr=body.weight_gr,
        bc=body.bc,
        drag_model=body.drag_model,
        muzzle_fps=body.muzzle_fps,
        muzzle_sd_fps=body.muzzle_sd_fps,
        twist_in=body.twist_in,
        zero_yd=body.zero_yd,
        sight_height_in=body.sight_height_in,
        temp_f=body.temp_f,
        humidity_pct=body.humidity_pct,
        baro_in_hg=body.baro_in_hg,
        altitude_ft=body.altitude_ft,
        wind=tuple(WindZone(z.speed_mph, z.clock) for z in body.wind),
        target_yd=body.target_yd,
        look_angle_deg=body.look_angle_deg,
        latitude_deg=body.latitude_deg,
        azimuth_deg=body.azimuth_deg,
        include_spin_drift=body.include_spin_drift,
        include_coriolis=body.include_coriolis,
        include_aero_jump=body.include_aero_jump,
    )
    s = solve(shot)

    aj = s.aero_jump_moa / 3.438 if metric else s.aero_jump_moa
    elevation = (-s.drop_m / s._slant) * ang_scale - aj
    windage = (s.drift_m / s._slant) * ang_scale

    def sample_out(sm) -> SampleOut:
        r = max(sm.range_m, 1e-6)
        return SampleOut(
            range=rng(sm.range_m),
            drop=lin(sm.drop_m),
            drift=lin(sm.drift_m),
            drift_wind=lin(sm.drift_wind_m),
            spin=lin(sm.spin_m),
            velocity=vel(sm.velocity_ms),
            mach=sm.mach,
            energy=ene(sm.energy_j),
            elevation=(-sm.drop_m / r) * ang_scale,
            windage=(sm.drift_m / r) * ang_scale,
            tof=sm.time_s,
        )

    warnings: list[str] = []
    if not s.reached_target:
        warnings.append("Projectile did not reach the target range — reduce range or raise velocity.")
    if s.sg < 1.4:
        warnings.append(
            f"Gyroscopic stability {s.sg:.2f} is marginal (below 1.4); the real "
            "ballistic coefficient will be worse than modelled."
        )
    if s.mach < 1.2:
        warnings.append("Impact is transonic or subsonic — dispersion is not modelled here.")

    return SolutionOut(
        elevation=elevation,
        windage=abs(windage),
        windage_direction="LEFT" if windage >= 0 else "RIGHT",
        angular_unit="mil" if metric else "MOA",
        drop=lin(s.drop_m),
        drift=lin(s.drift_m),
        wind_deflection=lin(s.wind_only_m - s.coriolis_m),
        spin_drift=lin(s.spin_m),
        coriolis=lin(s.coriolis_m),
        max_ordinate=lin(s.max_ordinate_m),
        mv_spread=lin(s.mv_spread_m),
        linear_unit="cm" if metric else "in",
        tof=s.tof_s,
        velocity=vel(s.velocity_ms),
        mach=s.mach,
        energy=ene(s.energy_j),
        launch_angle_moa=s.launch_angle_rad * RAD_TO_MOA,
        sg=s.sg,
        aero_jump=aj,
        air_density=s.atmosphere.density,
        sound_speed=vel(s.atmosphere.sound_speed),
        reached_target=s.reached_target,
        warnings=warnings,
        trajectory=[sample_out(x) for x in s.samples],
        range_card=[sample_out(x) for x in range_card(s, body.sample_step_yd)],
    )


@router.post("/true")
def post_true() -> None:
    """Fit a BC from observed drops — needs persistence (rifle/load profiles),
    which is out of scope for this build. See ARCHITECTURE.md's build order.

    TODO: given a Shot and a list of (range_yd, observed_drop_in), bisect the
    BC until modelled drop matches observation in the least-squares sense. Two
    observations at different ranges are enough to be useful; one is not.
    Persist the fitted BC per rifle+load once profiles exist.
    """
    raise HTTPException(status_code=501, detail="BC truing is not implemented yet")
