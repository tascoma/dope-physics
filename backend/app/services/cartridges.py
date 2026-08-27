"""Cartridge presets.

Published manufacturer figures for the bullet and a representative muzzle
velocity — NOT measurements from the user's rifle. The UI must present these as
starting points and let truing overwrite the BC and velocity per rifle.
"""

from __future__ import annotations

CARTRIDGES: list[dict] = [
    {"id": "308win-175smk", "name": ".308 Win — 175gr Sierra MK",
     "calibre_in": 0.308, "length_in": 1.24, "weight_gr": 175,
     "bc_g7": 0.243, "bc_g1": 0.496, "muzzle_fps": 2600, "twist_in": 11},
    {"id": "65cm-140eldm", "name": "6.5 Creedmoor — 140gr ELD-M",
     "calibre_in": 0.264, "length_in": 1.35, "weight_gr": 140,
     "bc_g7": 0.315, "bc_g1": 0.625, "muzzle_fps": 2710, "twist_in": 8},
    {"id": "6dasher-105hyb", "name": "6mm Dasher — 105gr Hybrid",
     "calibre_in": 0.243, "length_in": 1.28, "weight_gr": 105,
     "bc_g7": 0.278, "bc_g1": 0.546, "muzzle_fps": 2950, "twist_in": 8},
    {"id": "300wm-215hyb", "name": ".300 Win Mag — 215gr Hybrid",
     "calibre_in": 0.308, "length_in": 1.55, "weight_gr": 215,
     "bc_g7": 0.354, "bc_g1": 0.691, "muzzle_fps": 2825, "twist_in": 10},
    {"id": "338lm-300smk", "name": ".338 Lapua — 300gr Sierra MK",
     "calibre_in": 0.338, "length_in": 1.70, "weight_gr": 300,
     "bc_g7": 0.381, "bc_g1": 0.768, "muzzle_fps": 2750, "twist_in": 9.4},
    {"id": "223rem-77smk", "name": ".223 Rem — 77gr Sierra MK",
     "calibre_in": 0.224, "length_in": 0.99, "weight_gr": 77,
     "bc_g7": 0.191, "bc_g1": 0.372, "muzzle_fps": 2750, "twist_in": 8},
    {"id": "50bmg-750amax", "name": ".50 BMG — 750gr A-MAX",
     "calibre_in": 0.510, "length_in": 2.36, "weight_gr": 750,
     "bc_g7": 0.526, "bc_g1": 1.050, "muzzle_fps": 2820, "twist_in": 15},
]
