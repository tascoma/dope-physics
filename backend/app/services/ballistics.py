"""Exterior ballistics solver — point mass, RK4, G1/G7 standard drag.

This is the canonical implementation. The TypeScript port in
`frontend/src/lib/ballistics.ts` mirrors it step for step so the browser can
solve live while sliders are dragged; both are pinned by
`backend/tests/golden_vectors.json`. If you change the algorithm here, change it
there and regenerate the vectors — never let the two drift.

Coordinate frame
----------------
The integration frame is aligned with the LINE OF SIGHT, not the horizon:

    x  downrange along the sight line   (so range is slant range)
    y  perpendicular to it, positive up (so y IS drop from the sight line)
    z  to the shooter's right

Look angle therefore rotates gravity into the frame rather than scaling the
answer by a cosine, and the muzzle starts at y = -sight_height.

Units
-----
SI internally (metres, m/s, kg, seconds, kelvin, pascals). Inputs and outputs
are in shooter units (yards, fps, grains, inches, °F, inHg, mph) because that
is what the user types and reads. Conversions live at the boundary only.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from app.services.drag_tables import TABLES, cd_of

# — physical constants —
OMEGA = 7.292115e-5      # Earth angular velocity, rad/s
GRAVITY = 9.80665        # m/s²
R_DRY = 287.058          # specific gas constant, dry air, J/(kg·K)
R_VAPOUR = 461.495       # specific gas constant, water vapour, J/(kg·K)

# Reference area over twice the mass of the STANDARD projectile
# (1 inch diameter, 1 pound mass), i.e. k = A / 2m.
# A  = pi * (0.0254 m)^2 / 4 = 5.0671e-4 m²
# m  = 0.45359237 kg
# k  = 5.5855e-4 m²/kg  — the constant that makes BC in lb/in² work out.
K_STD = 5.5855e-4

# — unit conversions —
YD_TO_M = 0.9144
FT_TO_M = 0.3048
IN_TO_M = 0.0254
MPH_TO_MS = 0.44704
GRAIN_TO_KG = 6.479891e-5
INHG_TO_PA = 3386.389
J_TO_FTLB = 0.737562
RAD_TO_MOA = 10800.0 / math.pi   # 1 rad = 3437.75 MOA
RAD_TO_MIL = 1000.0              # NATO mil (true milliradian)


@dataclass(frozen=True)
class Atmosphere:
    density: float        # kg/m³
    sound_speed: float    # m/s
    pressure: float       # Pa, station (not sea level)
    temperature: float    # K


def atmosphere(
    temp_f: float,
    humidity_pct: float,
    baro_in_hg: float,
    altitude_ft: float,
) -> Atmosphere:
    """Humid-air density and speed of sound.

    `baro_in_hg` is SEA-LEVEL barometric pressure (what a weather service
    reports). Station pressure is derived from it and the altitude, then
    vapour pressure is separated out — water vapour is lighter than dry air,
    so humid air is LESS dense, which is the opposite of most people's
    intuition.
    """
    t_c = (temp_f - 32.0) / 1.8
    t_k = t_c + 273.15
    p_sea = baro_in_hg * INHG_TO_PA
    h_m = altitude_ft * FT_TO_M
    # barometric formula, ISA troposphere
    p_station = p_sea * max(1.0 - 2.25577e-5 * h_m, 0.05) ** 5.25588
    # Tetens equation for saturation vapour pressure
    p_sat = 610.78 * 10.0 ** (7.5 * t_c / (t_c + 237.3))
    p_vapour = (humidity_pct / 100.0) * p_sat
    density = (p_station - p_vapour) / (R_DRY * t_k) + p_vapour / (R_VAPOUR * t_k)
    # dry-air relation; humidity's effect on c (<0.3%) is ignored — see PHYSICS.md
    sound_speed = 331.3 * math.sqrt(1.0 + t_c / 273.15)
    return Atmosphere(density, sound_speed, p_station, t_k)


def miller_sg(
    weight_gr: float,
    twist_in: float,
    calibre_in: float,
    length_in: float,
    muzzle_fps: float,
) -> float:
    """Miller gyroscopic stability factor, velocity-corrected.

    Below ~1.4 the bullet is marginally stable and its real BC degrades in a
    way this model does not capture — surface that to the user rather than
    silently solving as if all were well.
    """
    t = twist_in / calibre_in          # calibres per turn
    l = length_in / calibre_in         # length in calibres  # noqa: E741
    base = 30.0 * weight_gr / (t * t * calibre_in ** 3 * l * (1.0 + l * l))
    return base * (max(muzzle_fps, 500.0) / 2800.0) ** (1.0 / 3.0)


@dataclass(frozen=True)
class WindZone:
    """Wind over one third of the flight path.

    `clock` is the direction the wind comes FROM, in clock hours:
    12 = headwind, 3 = from the shooter's right, 6 = tailwind, 9 = from left.
    Halves are allowed (4.5 = between 4 and 5 o'clock).
    """
    speed_mph: float
    clock: float

    def vector(self) -> tuple[float, float]:
        """(wx, wz) in m/s — the direction the AIR MOVES, not where it's from."""
        a = self.clock / 12.0 * 2.0 * math.pi
        sp = self.speed_mph * MPH_TO_MS
        return (-sp * math.cos(a), -sp * math.sin(a))


@dataclass(frozen=True)
class Shot:
    # projectile
    calibre_in: float
    length_in: float
    weight_gr: float
    bc: float                     # for the chosen drag model, lb/in²
    drag_model: str = "G7"        # "G7" | "G1"
    muzzle_fps: float = 2600.0
    muzzle_sd_fps: float = 0.0    # velocity standard deviation
    twist_in: float = 11.0        # 1 turn in N inches, right-hand assumed
    # rifle
    zero_yd: float = 100.0
    sight_height_in: float = 2.2
    # atmosphere
    temp_f: float = 59.0
    humidity_pct: float = 50.0
    baro_in_hg: float = 29.92
    altitude_ft: float = 0.0
    # wind: 1 zone = uniform, 3 zones = thirds of the path
    wind: tuple[WindZone, ...] = (WindZone(0.0, 3.0),)
    # geometry
    target_yd: float = 1000.0
    look_angle_deg: float = 0.0   # + uphill
    latitude_deg: float = 39.0    # + north
    azimuth_deg: float = 0.0      # 0 = north, clockwise
    # switches
    include_spin_drift: bool = True
    include_coriolis: bool = True
    include_aero_jump: bool = True


@dataclass
class Sample:
    range_m: float
    drop_m: float           # from line of sight, negative = below
    drift_m: float          # total lateral, incl. spin drift, + = right
    drift_wind_m: float     # lateral from wind + Coriolis only
    spin_m: float           # spin drift component
    velocity_ms: float
    mach: float
    energy_j: float
    time_s: float


@dataclass
class Solution:
    launch_angle_rad: float
    tof_s: float
    drop_m: float
    drift_m: float
    spin_m: float
    coriolis_m: float
    wind_only_m: float
    velocity_ms: float
    mach: float
    energy_j: float
    max_ordinate_m: float
    sg: float
    aero_jump_moa: float
    mv_spread_m: float          # vertical spread implied by muzzle_sd_fps
    reached_target: bool        # False = went subsonic/fell short
    atmosphere: Atmosphere = field(repr=False)
    samples: list[Sample] = field(default_factory=list, repr=False)

    # — presentation helpers; angles are ALWAYS the correction to apply —
    @property
    def elevation_moa(self) -> float:
        return _ang(-self.drop_m, self._slant, RAD_TO_MOA) - self.aero_jump_moa

    @property
    def elevation_mil(self) -> float:
        return _ang(-self.drop_m, self._slant, RAD_TO_MIL) - self.aero_jump_moa / 3.438

    @property
    def windage_moa(self) -> float:
        """Positive = bullet goes right, so DIAL LEFT by this much."""
        return _ang(self.drift_m, self._slant, RAD_TO_MOA)

    @property
    def windage_mil(self) -> float:
        return _ang(self.drift_m, self._slant, RAD_TO_MIL)

    _slant: float = 1.0


def _ang(offset_m: float, range_m: float, scale: float) -> float:
    return offset_m / max(range_m, 1e-6) * scale


def _integrate(
    *,
    theta: float,
    alpha: float,
    end_x: float,
    atmo: Atmosphere,
    bc: float,
    table: list[tuple[float, float]],
    wind_at,
    omega: tuple[float, float, float] | None,
    v0: float,
    sight_h: float,
    dt: float = 0.002,
    sample_every: float = 0.0,
) -> tuple[list[float], float, list[tuple[float, list[float]]], bool]:
    """Classical RK4 on the 6-state [x, y, z, vx, vy, vz].

    Returns (state at end_x, time at end_x, samples, reached_end). The final
    state is linearly interpolated between the two steps that straddle end_x —
    without that the answer quantises to the step size and drop at long range
    jitters by tenths of an inch as you drag a slider.
    """
    gx = -GRAVITY * math.sin(alpha)
    gy = -GRAVITY * math.cos(alpha)
    s = [0.0, -sight_h, 0.0, v0 * math.cos(theta), v0 * math.sin(theta), 0.0]
    t = 0.0
    samples: list[tuple[float, list[float]]] = []
    acc = 0.0

    def deriv(s: list[float]) -> list[float]:
        wx, wz = wind_at(s[0])
        rx, ry, rz = s[3] - wx, s[4], s[5] - wz      # velocity relative to air
        v = math.sqrt(rx * rx + ry * ry + rz * rz)
        kd = K_STD * atmo.density * cd_of(v / atmo.sound_speed, table) * v / bc
        ax, ay, az = gx - kd * rx, gy - kd * ry, -kd * rz
        if omega is not None:
            ox, oy, oz = omega
            # a += -2 (omega x v)
            ax -= 2.0 * (oy * s[5] - oz * s[4])
            ay -= 2.0 * (oz * s[3] - ox * s[5])
            az -= 2.0 * (ox * s[4] - oy * s[3])
        return [s[3], s[4], s[5], ax, ay, az]

    if sample_every:
        samples.append((0.0, list(s)))
    prev, prev_t = list(s), 0.0
    while s[0] < end_x and t < 8.0:
        k1 = deriv(s)
        k2 = deriv([a + b * dt / 2 for a, b in zip(s, k1)])
        k3 = deriv([a + b * dt / 2 for a, b in zip(s, k2)])
        k4 = deriv([a + b * dt for a, b in zip(s, k3)])
        prev, prev_t = list(s), t
        s = [a + dt / 6.0 * (m + 2 * n + 2 * o + p)
             for a, m, n, o, p in zip(s, k1, k2, k3, k4)]
        t += dt
        if sample_every:
            acc += dt
            if acc >= sample_every:
                acc = 0.0
                samples.append((t, list(s)))

    reached = s[0] >= end_x * 0.999
    span = s[0] - prev[0]
    u = (end_x - prev[0]) / span if span > 1e-9 else 0.0
    end = [p + (c - p) * u for p, c in zip(prev, s)]
    t_end = prev_t + (t - prev_t) * u
    if sample_every:
        samples.append((t_end, end))
    return end, t_end, samples, reached


def solve(shot: Shot) -> Solution:
    """Full firing solution. ~10 ms in CPython for a 1,000 yd shot."""
    atmo = atmosphere(shot.temp_f, shot.humidity_pct, shot.baro_in_hg, shot.altitude_ft)
    table = TABLES[shot.drag_model]
    v0 = shot.muzzle_fps * FT_TO_M
    sight_h = shot.sight_height_in * IN_TO_M
    zero_m = max(shot.zero_yd, 10.0) * YD_TO_M
    slant_m = max(shot.target_yd, 10.0) * YD_TO_M
    alpha = math.radians(shot.look_angle_deg)
    still = lambda _x: (0.0, 0.0)  # noqa: E731

    # 1. Zero: bisect launch angle until the path crosses the sight line at
    #    the zero distance. Flat, no wind, no Coriolis — that is what zeroing
    #    on a calm range actually establishes.
    lo, hi = -0.004, 0.06
    for _ in range(28):
        mid = (lo + hi) / 2.0
        end, _t, _s, _r = _integrate(
            theta=mid, alpha=0.0, end_x=zero_m, atmo=atmo, bc=shot.bc,
            table=table, wind_at=still, omega=None, v0=v0, sight_h=sight_h,
            dt=0.003,
        )
        if end[1] < 0.0:
            lo = mid
        else:
            hi = mid
    theta = (lo + hi) / 2.0

    # 2. Wind field: 1 zone is uniform, 3 zones split the path in thirds.
    zones = list(shot.wind) if len(shot.wind) == 3 else list(shot.wind) * 3
    vecs = [z.vector() for z in zones]
    third = slant_m / 3.0

    def wind_at(x: float) -> tuple[float, float]:
        return vecs[0] if x < third else (vecs[1] if x < 2 * third else vecs[2])

    # 3. Earth rotation in the shooter's frame.
    lat = math.radians(shot.latitude_deg)
    azi = math.radians(shot.azimuth_deg)
    omega = (
        (OMEGA * math.cos(lat) * math.cos(azi),
         OMEGA * math.sin(lat),
         -OMEGA * math.cos(lat) * math.sin(azi))
        if shot.include_coriolis else None
    )

    # 4. The shot.
    end, tof, raw, reached = _integrate(
        theta=theta, alpha=alpha, end_x=slant_m, atmo=atmo, bc=shot.bc,
        table=table, wind_at=wind_at, omega=omega, v0=v0, sight_h=sight_h,
        dt=0.002, sample_every=0.008,
    )
    # 5. Reference runs to attribute the lateral budget.
    no_cor, _t, _s, _r = _integrate(
        theta=theta, alpha=alpha, end_x=slant_m, atmo=atmo, bc=shot.bc,
        table=table, wind_at=wind_at, omega=None, v0=v0, sight_h=sight_h, dt=0.003,
    )
    no_wind, _t2, _s2, _r2 = _integrate(
        theta=theta, alpha=alpha, end_x=slant_m, atmo=atmo, bc=shot.bc,
        table=table, wind_at=still, omega=None, v0=v0, sight_h=sight_h, dt=0.003,
    )

    sg = miller_sg(shot.weight_gr, shot.twist_in, shot.calibre_in,
                   shot.length_in, shot.muzzle_fps)

    def spin_at(t: float) -> float:
        """Litz fit, inches, right-hand twist. A function of TIME, not range —
        which is why it grows so fast past 1,000 yd."""
        if not shot.include_spin_drift:
            return 0.0
        return 1.25 * (sg + 1.2) * max(t, 0.0) ** 1.83 * IN_TO_M

    cross_from_left = sum(-z.speed_mph * math.sin(z.clock / 12 * 2 * math.pi)
                          for z in zones) / len(zones)
    aero_jump_moa = 0.01 * sg * cross_from_left if shot.include_aero_jump else 0.0

    mass_kg = shot.weight_gr * GRAIN_TO_KG
    samples = [
        Sample(
            range_m=st[0], drop_m=st[1],
            drift_m=st[2] + spin_at(t), drift_wind_m=st[2], spin_m=spin_at(t),
            velocity_ms=(v := math.sqrt(st[3] ** 2 + st[4] ** 2 + st[5] ** 2)),
            mach=v / atmo.sound_speed, energy_j=0.5 * mass_kg * v * v, time_s=t,
        )
        for t, st in raw
    ]

    mv_spread = 0.0
    if shot.muzzle_sd_fps:
        fast, _t3, _s3, _r3 = _integrate(
            theta=theta, alpha=alpha, end_x=slant_m, atmo=atmo, bc=shot.bc,
            table=table, wind_at=still, omega=None,
            v0=v0 + shot.muzzle_sd_fps * FT_TO_M, sight_h=sight_h, dt=0.003,
        )
        mv_spread = abs(fast[1] - no_wind[1])

    v_end = math.sqrt(end[3] ** 2 + end[4] ** 2 + end[5] ** 2)
    return Solution(
        launch_angle_rad=theta,
        tof_s=tof,
        drop_m=end[1],
        drift_m=end[2] + spin_at(tof),
        spin_m=spin_at(tof),
        coriolis_m=end[2] - no_cor[2],
        wind_only_m=no_cor[2],
        velocity_ms=v_end,
        mach=v_end / atmo.sound_speed,
        energy_j=0.5 * mass_kg * v_end * v_end,
        max_ordinate_m=max((s.drop_m for s in samples), default=0.0),
        sg=sg,
        aero_jump_moa=aero_jump_moa,
        mv_spread_m=mv_spread,
        reached_target=reached,
        atmosphere=atmo,
        samples=samples,
        _slant=slant_m,
    )


def range_card(solution: Solution, step_yd: float = 100.0) -> list[Sample]:
    """Nearest sample at each step of range — the DOPE table rows."""
    out: list[Sample] = []
    if not solution.samples:
        return out
    limit = solution.samples[-1].range_m
    r = step_yd * YD_TO_M
    while r <= limit + 1e-6:
        out.append(min(solution.samples, key=lambda s: abs(s.range_m - r)))
        r += step_yd * YD_TO_M
    return out
