import { GroupHeader } from "../../ui/GroupHeader";
import { SliderRow } from "../../ui/SliderRow";
import { useShot } from "../../../state/ShotContext";
import { IN_TO_M, YD_TO_M } from "../../../lib/ballistics";
import { toLinear, toRange, unitLabels } from "../../../lib/units";
import { fx } from "../../../lib/format";

export function RifleZeroGroup() {
  const { state, dispatch } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);

  return (
    <>
      <GroupHeader>02 — Rifle &amp; zero</GroupHeader>
      <SliderRow
        label="Zero range"
        display={`${Math.round(toRange(state.zeroYd * YD_TO_M, metric))} ${units.range}`}
        min={25}
        max={400}
        step={5}
        value={state.zeroYd}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "zeroYd", value })}
      />
      <SliderRow
        label="Sight height over bore"
        display={`${fx(toLinear(state.sightHeightIn * IN_TO_M, metric), 1)} ${units.linear}`}
        min={0.5}
        max={4}
        step={0.05}
        value={state.sightHeightIn}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "sightHeightIn", value })}
      />
    </>
  );
}
