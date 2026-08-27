"""Golden-vector regression test.

These numbers came out of the HTML prototype's solver, which is the design of
record. If a change to `services/ballistics.py` breaks a case here, the
change is wrong until proven otherwise — or the algorithm changed
deliberately, in which case regenerate the vectors AND update the TypeScript
port in the same commit.

    uv run pytest -q
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import pytest

from app.services.ballistics import (
    IN_TO_M,
    RAD_TO_MOA,
    Shot,
    WindZone,
    solve,
)

VECTORS = json.loads((Path(__file__).parent / "golden_vectors.json").read_text())


def _shot(i: dict) -> Shot:
    return Shot(
        calibre_in=i["cal"], length_in=i["len"], weight_gr=i["gr"], bc=i["bc"],
        drag_model=i["model"], muzzle_fps=i["mv"], twist_in=i["tw"],
        zero_yd=i["zero"], sight_height_in=i["sightH"],
        temp_f=i["tempF"], humidity_pct=i["humid"], baro_in_hg=i["baro"],
        altitude_ft=i["altFt"],
        wind=tuple(WindZone(z["s"], z["c"]) for z in i["zones"]),
        target_yd=i["tgt"], look_angle_deg=i["incl"],
        latitude_deg=i["lat"], azimuth_deg=i["azi"],
    )


@pytest.mark.parametrize("case", VECTORS["cases"], ids=lambda c: c["id"])
def test_golden(case: dict) -> None:
    s = solve(_shot(case["input"]))
    e = case["expected"]
    tol = VECTORS["tolerances"]
    slant = case["input"]["tgt"] * 0.9144

    assert s.drop_m / IN_TO_M == pytest.approx(e["dropIn"], abs=tol["dropIn"])
    assert s.tof_s == pytest.approx(e["tofS"], abs=tol["tofS"])
    assert s.velocity_ms / 0.3048 == pytest.approx(e["vImpactFps"], abs=tol["vImpactFps"])
    assert s.energy_j * 0.737562 == pytest.approx(e["energyFtLb"], abs=tol["energyFtLb"])
    assert s.sg == pytest.approx(e["sg"], abs=tol["sg"])

    elev = (-s.drop_m / slant) * RAD_TO_MOA - s.aero_jump_moa
    wind = (s.drift_m / slant) * RAD_TO_MOA
    assert elev == pytest.approx(e["elevMOA"], abs=tol["elevMOA"])
    assert wind == pytest.approx(e["windMOA"], abs=tol["windMOA"])


def test_zero_crosses_line_of_sight() -> None:
    """At the zero distance the path must be on the sight line, by definition."""
    s = solve(Shot(calibre_in=0.308, length_in=1.24, weight_gr=175, bc=0.243,
                   zero_yd=100, target_yd=100, wind=(WindZone(0, 12),),
                   include_coriolis=False, include_spin_drift=False))
    assert abs(s.drop_m / IN_TO_M) < 0.05


def test_no_wind_no_lateral_when_effects_off() -> None:
    s = solve(Shot(calibre_in=0.308, length_in=1.24, weight_gr=175, bc=0.243,
                   target_yd=1000, wind=(WindZone(0, 12),),
                   include_coriolis=False, include_spin_drift=False,
                   include_aero_jump=False))
    assert abs(s.drift_m) < 1e-6


def test_denser_air_drops_more() -> None:
    """Cold, high-pressure, sea-level air must produce more drop than hot,
    thin, high-altitude air. If this ever inverts, the density sign is wrong."""
    common = dict(calibre_in=0.308, length_in=1.24, weight_gr=175, bc=0.243,
                  target_yd=1000, wind=(WindZone(0, 12),))
    cold = solve(Shot(**common, temp_f=10, altitude_ft=0, baro_in_hg=30.5))
    hot = solve(Shot(**common, temp_f=100, altitude_ft=8000, baro_in_hg=29.4))
    assert cold.drop_m < hot.drop_m


def test_uphill_and_downhill_are_not_symmetric_in_slant_drop() -> None:
    """Look angle rotates gravity; it is not a cosine scale factor."""
    common = dict(calibre_in=0.308, length_in=1.24, weight_gr=175, bc=0.243,
                  target_yd=800, wind=(WindZone(0, 12),))
    up = solve(Shot(**common, look_angle_deg=30))
    flat = solve(Shot(**common, look_angle_deg=0))
    assert abs(up.drop_m) < abs(flat.drop_m)
    assert not math.isclose(abs(up.drop_m), abs(flat.drop_m), rel_tol=1e-3)
