"""HTTP-level tests for the ballistics endpoints — wire contract, not solver
correctness (that's `test_golden.py`)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from httpx import AsyncClient

from app.services.cartridges import CARTRIDGES

VECTORS = json.loads((Path(__file__).parent / "golden_vectors.json").read_text())


async def test_cartridges_returns_presets(client: AsyncClient) -> None:
    resp = await client.get("/api/cartridges")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == len(CARTRIDGES)
    assert {c["id"] for c in body} == {c["id"] for c in CARTRIDGES}
    assert set(body[0].keys()) == {
        "id", "name", "calibre_in", "length_in", "weight_gr",
        "bc_g7", "bc_g1", "muzzle_fps", "twist_in",
    }


async def test_solve_happy_path(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/solve",
        json={
            "calibre_in": 0.308, "length_in": 1.24, "weight_gr": 175, "bc": 0.243,
            "drag_model": "G7", "muzzle_fps": 2600, "target_yd": 1000,
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["angular_unit"] == "MOA"
    assert body["windage_direction"] in ("LEFT", "RIGHT")
    assert body["reached_target"] is True
    assert len(body["trajectory"]) > 0
    assert len(body["range_card"]) > 0


async def test_solve_matches_golden_case_over_http(client: AsyncClient) -> None:
    case = next(c for c in VECTORS["cases"] if c["id"] == "A_308_1000yd_8mph_3oclock")
    i = case["input"]
    resp = await client.post(
        "/api/solve",
        json={
            "calibre_in": i["cal"], "length_in": i["len"], "weight_gr": i["gr"],
            "bc": i["bc"], "drag_model": i["model"], "muzzle_fps": i["mv"],
            "twist_in": i["tw"], "zero_yd": i["zero"], "sight_height_in": i["sightH"],
            "temp_f": i["tempF"], "humidity_pct": i["humid"], "baro_in_hg": i["baro"],
            "altitude_ft": i["altFt"],
            "wind": [{"speed_mph": z["s"], "clock": z["c"]} for z in i["zones"]],
            "target_yd": i["tgt"], "look_angle_deg": i["incl"],
            "latitude_deg": i["lat"], "azimuth_deg": i["azi"],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    e = case["expected"]
    tol = VECTORS["tolerances"]
    assert body["drop"] == pytest.approx(e["dropIn"], abs=tol["dropIn"])
    assert body["tof"] == pytest.approx(e["tofS"], abs=tol["tofS"])
    assert body["elevation"] == pytest.approx(e["elevMOA"], abs=tol["elevMOA"])


async def test_solve_rejects_invalid_wind_zone_count(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/solve",
        json={
            "calibre_in": 0.308, "length_in": 1.24, "weight_gr": 175, "bc": 0.243,
            "wind": [{"speed_mph": 5, "clock": 3}, {"speed_mph": 5, "clock": 3}],
        },
    )
    assert resp.status_code == 422


async def test_solve_rejects_out_of_range_field(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/solve",
        json={"calibre_in": 5.0, "length_in": 1.24, "weight_gr": 175, "bc": 0.243},
    )
    assert resp.status_code == 422


async def test_true_is_not_implemented(client: AsyncClient) -> None:
    resp = await client.post("/api/true", json={})
    assert resp.status_code == 501
