import { useShot } from "../../../state/ShotContext";
import { MPH_TO_MS } from "../../../lib/ballistics";
import { clk } from "../../../lib/format";

const ZONE_LABELS = ["0–1/3 range", "1/3–2/3 range", "2/3–target"];

export function WindGroup() {
  const { state, dispatch } = useShot();
  const metric = state.unitSystem === "metric";
  const indices: (0 | 1 | 2)[] = state.zonesEnabled ? [0, 1, 2] : [0];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "20px 0 3px",
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 9.5,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          04 — Wind
        </span>
        <button
          className="btn btn-ghost"
          onClick={() => dispatch({ type: "TOGGLE_ZONES" })}
          style={{
            borderRadius: 0,
            fontSize: 10,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            padding: "2px 5px",
          }}
        >
          {state.zonesEnabled ? "single zone" : "3 zones"}
        </button>
      </div>

      {indices.map((i) => {
        const zone = state.wind[i];
        const angle = (zone.clock / 12) * 2 * Math.PI;
        const ax = 22 + 15 * Math.sin(angle);
        const ay = 22 - 15 * Math.cos(angle);
        const readout = metric
          ? `${(zone.speedMph * MPH_TO_MS).toFixed(1)} m/s`
          : `${zone.speedMph.toFixed(1)} mph`;
        const zoneLabel = state.zonesEnabled ? ZONE_LABELS[i] : "Uniform along path";

        return (
          <div
            key={i}
            style={{ border: "1px solid var(--color-divider)", padding: "8px 9px 9px", marginBottom: 7 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: "ui-monospace, Menlo, monospace",
                  fontSize: 9.5,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "var(--color-neutral-600)",
                }}
              >
                {zoneLabel}
              </span>
              <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>
                {readout} · {clk(zone.clock)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={zone.speedMph}
              aria-label={`Wind speed, ${zoneLabel}`}
              aria-valuetext={readout}
              onChange={(e) =>
                dispatch({
                  type: "SET_WIND_ZONE",
                  index: i,
                  field: "speedMph",
                  value: parseFloat(e.target.value),
                })
              }
              style={{ marginBottom: 6 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg
                viewBox="0 0 44 44"
                style={{ width: 42, height: 42, flex: "none", overflow: "visible" }}
                role="img"
                aria-label={`Wind from ${clk(zone.clock)}`}
              >
                <circle cx={22} cy={22} r={20} fill="none" stroke="rgba(29,31,32,.2)" />
                <line x1={22} y1={2} x2={22} y2={7} stroke="rgba(29,31,32,.35)" />
                <line x1={22} y1={37} x2={22} y2={42} stroke="rgba(29,31,32,.35)" />
                <line x1={2} y1={22} x2={7} y2={22} stroke="rgba(29,31,32,.35)" />
                <line x1={37} y1={22} x2={42} y2={22} stroke="rgba(29,31,32,.35)" />
                <line x1={22} y1={22} x2={ax} y2={ay} stroke="#5980a6" strokeWidth={1.5} />
                <circle cx={ax} cy={ay} r={2.4} fill="#5980a6" />
              </svg>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "var(--color-neutral-700)",
                  }}
                >
                  from {clk(zone.clock)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={11.5}
                  step={0.5}
                  value={zone.clock}
                  aria-label="Wind direction, clock hours"
                  aria-valuetext={`from ${clk(zone.clock)}`}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_WIND_ZONE",
                      index: i,
                      field: "clock",
                      value: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
