import type { CSSProperties } from "react";
import { GroupHeader } from "../../ui/GroupHeader";
import { SliderRow } from "../../ui/SliderRow";
import { useShot } from "../../../state/ShotContext";
import { toVelocity, unitLabels } from "../../../lib/units";
import { fx } from "../../../lib/format";

const ROW_LABEL_STYLE: CSSProperties = {
  fontSize: 10.5,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color: "var(--color-neutral-700)",
};
const ROW_VALUE_STYLE: CSSProperties = {
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 12,
  color: "var(--color-accent-700)",
};

export function AtmosphereGroup() {
  const { state, dispatch, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);
  const tempUnit = metric ? "°C" : "°F";

  return (
    <>
      <GroupHeader>03 — Atmosphere</GroupHeader>
      <SliderRow
        label="Temperature"
        display={`${metric ? fx((state.tempF - 32) / 1.8, 0) : Math.round(state.tempF)} ${tempUnit}`}
        min={-20}
        max={120}
        step={1}
        value={state.tempF}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "tempF", value })}
      />
      <SliderRow
        label="Barometric pressure"
        display={
          metric ? `${Math.round(state.baroInHg * 33.8639)} hPa` : `${state.baroInHg.toFixed(2)} inHg`
        }
        min={24}
        max={32}
        step={0.01}
        value={state.baroInHg}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "baroInHg", value })}
      />
      <SliderRow
        label="Relative humidity"
        display={`${Math.round(state.humidityPct)} %`}
        min={0}
        max={100}
        step={1}
        value={state.humidityPct}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "humidityPct", value })}
      />
      <SliderRow
        label="Station altitude"
        display={
          metric ? `${Math.round(state.altitudeFt * 0.3048)} m` : `${Math.round(state.altitudeFt)} ft`
        }
        min={0}
        max={12000}
        step={50}
        value={state.altitudeFt}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "altitudeFt", value })}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid rgba(29,31,32,.1)",
        }}
      >
        <span style={ROW_LABEL_STYLE}>air density</span>
        <span style={ROW_VALUE_STYLE}>{solution.atmosphere.density.toFixed(4)} kg/m³</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 3 }}>
        <span style={ROW_LABEL_STYLE}>speed of sound</span>
        <span style={ROW_VALUE_STYLE}>
          {Math.round(toVelocity(solution.atmosphere.soundSpeed, metric))} {units.velocity}
        </span>
      </div>
    </>
  );
}
