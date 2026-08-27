"""Standard drag functions.

Each table is a list of (mach, cd) pairs for the *standard projectile* of that
family, ascending in mach. Cd is dimensionless. These are the published G1 and
G7 tables; do not "clean up" the values — the transonic knee between Mach 0.9
and 1.1 is the physically important part and it is genuinely that steep.
"""

from __future__ import annotations

G1: list[tuple[float, float]] = [
    (0.00, 0.2629), (0.05, 0.2558), (0.10, 0.2487), (0.15, 0.2413),
    (0.20, 0.2344), (0.25, 0.2278), (0.30, 0.2214), (0.35, 0.2155),
    (0.40, 0.2104), (0.45, 0.2061), (0.50, 0.2032), (0.55, 0.2020),
    (0.60, 0.2034), (0.70, 0.2165), (0.725, 0.2230), (0.75, 0.2313),
    (0.775, 0.2417), (0.80, 0.2546), (0.825, 0.2706), (0.85, 0.2901),
    (0.875, 0.3136), (0.90, 0.3415), (0.925, 0.3734), (0.95, 0.4084),
    (0.975, 0.4448), (1.00, 0.4805), (1.025, 0.5136), (1.05, 0.5427),
    (1.075, 0.5677), (1.10, 0.5883), (1.15, 0.6191), (1.20, 0.6393),
    (1.30, 0.6518), (1.40, 0.6474), (1.50, 0.6357), (1.60, 0.6196),
    (1.80, 0.5852), (2.00, 0.5533), (2.20, 0.5252), (2.50, 0.4890),
    (3.00, 0.4389), (3.50, 0.4032), (4.00, 0.3775), (4.50, 0.3611),
    (5.00, 0.3498),
]

G7: list[tuple[float, float]] = [
    (0.00, 0.1198), (0.05, 0.1197), (0.10, 0.1196), (0.15, 0.1194),
    (0.20, 0.1193), (0.25, 0.1194), (0.30, 0.1194), (0.35, 0.1194),
    (0.40, 0.1193), (0.45, 0.1193), (0.50, 0.1194), (0.55, 0.1193),
    (0.60, 0.1194), (0.65, 0.1197), (0.70, 0.1202), (0.725, 0.1207),
    (0.75, 0.1215), (0.775, 0.1226), (0.80, 0.1242), (0.825, 0.1266),
    (0.85, 0.1306), (0.875, 0.1368), (0.90, 0.1464), (0.925, 0.1660),
    (0.95, 0.2054), (0.975, 0.2993), (1.00, 0.3803), (1.025, 0.4015),
    (1.05, 0.4043), (1.075, 0.4034), (1.10, 0.4014), (1.15, 0.3955),
    (1.20, 0.3884), (1.30, 0.3733), (1.40, 0.3584), (1.50, 0.3435),
    (1.60, 0.3292), (1.80, 0.3026), (2.00, 0.2799), (2.20, 0.2597),
    (2.50, 0.2329), (3.00, 0.1988), (3.50, 0.1752), (4.00, 0.1584),
    (4.50, 0.1459), (5.00, 0.1367),
]

TABLES = {"G1": G1, "G7": G7}


def cd_of(mach: float, table: list[tuple[float, float]]) -> float:
    """Linear interpolation of Cd at `mach`, clamped at both ends.

    Binary search, not a linear scan: this is called four times per integration
    step (~1,400 steps for a 1,000 yd shot), so it is the hot path.
    """
    if mach <= table[0][0]:
        return table[0][1]
    if mach >= table[-1][0]:
        return table[-1][1]
    lo, hi = 0, len(table) - 1
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if table[mid][0] <= mach:
            lo = mid
        else:
            hi = mid
    x0, y0 = table[lo]
    x1, y1 = table[hi]
    return y0 + (y1 - y0) * (mach - x0) / (x1 - x0)
