import { GroupHeader } from "../../ui/GroupHeader";
import { SliderRow } from "../../ui/SliderRow";
import { useShot } from "../../../state/ShotContext";
import { YD_TO_M } from "../../../lib/ballistics";
import { toRange, unitLabels } from "../../../lib/units";
import { compass, fx } from "../../../lib/format";

export function ShotGeometryGroup() {
  const { state, dispatch } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);

  return (
    <>
      <GroupHeader>05 — Shot geometry</GroupHeader>
      <SliderRow
        label="Target range"
        display={`${Math.round(toRange(state.targetYd * YD_TO_M, metric))} ${units.range}`}
        min={100}
        max={2500}
        step={10}
        value={state.targetYd}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "targetYd", value })}
      />
      <SliderRow
        label="Look angle"
        display={`${fx(state.lookAngleDeg, 0)}°`}
        min={-45}
        max={45}
        step={1}
        value={state.lookAngleDeg}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "lookAngleDeg", value })}
      />
      <SliderRow
        label="Target plate"
        display={
          metric ? `${Math.round(state.targetPlateIn * 2.54)} cm` : `${Math.round(state.targetPlateIn)} in`
        }
        min={4}
        max={60}
        step={1}
        value={state.targetPlateIn}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "targetPlateIn", value })}
      />
      <SliderRow
        label="Latitude"
        display={`${fx(Math.abs(state.latitudeDeg), 0)}° ${state.latitudeDeg < 0 ? "S" : "N"}`}
        min={-70}
        max={70}
        step={1}
        value={state.latitudeDeg}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "latitudeDeg", value })}
      />
      <SliderRow
        label="Azimuth of fire"
        display={`${Math.round(state.azimuthDeg)}° ${compass(state.azimuthDeg)}`}
        min={0}
        max={359}
        step={1}
        value={state.azimuthDeg}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "azimuthDeg", value })}
      />
    </>
  );
}
