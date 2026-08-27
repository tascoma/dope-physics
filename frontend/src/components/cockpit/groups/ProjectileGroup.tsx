import { GroupHeader } from "../../ui/GroupHeader";
import { SliderRow } from "../../ui/SliderRow";
import { useShot } from "../../../state/ShotContext";
import { useCartridges } from "../../../hooks/useCartridges";
import { FT_TO_M } from "../../../lib/ballistics";
import { toVelocity, unitLabels } from "../../../lib/units";
import { weightGrams } from "../../../lib/format";

const TAG_STYLE = {
  borderRadius: 0,
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 10,
} as const;

export function ProjectileGroup() {
  const { state, dispatch, solution } = useShot();
  const { cartridges } = useCartridges();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);

  const calibreLabel = metric
    ? `${(state.calibreIn * 25.4).toFixed(2)} mm`
    : `${state.calibreIn.toFixed(3)} in`;
  const ldLabel = `L/D ${(state.lengthIn / state.calibreIn).toFixed(2)}`;
  const sgLabel = `SG ${solution.sg.toFixed(2)}`;

  return (
    <>
      <GroupHeader style={{ marginTop: 0, marginBottom: 9 }}>01 — Projectile</GroupHeader>
      <select
        className="input"
        aria-label="Cartridge preset"
        value={state.cartridgeId}
        onChange={(e) => {
          const cartridge = cartridges.find((c) => c.id === e.target.value);
          if (cartridge) dispatch({ type: "SET_CARTRIDGE", cartridge });
        }}
        style={{
          borderRadius: 0,
          fontFamily: "var(--font-heading)",
          fontSize: 15,
          letterSpacing: ".02em",
          marginBottom: 4,
        }}
      >
        {cartridges.length === 0 ? (
          <option value={state.cartridgeId}>Loading…</option>
        ) : (
          cartridges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))
        )}
      </select>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0 6px" }}>
        <span className="tag tag-outline" style={TAG_STYLE}>
          {calibreLabel}
        </span>
        <span className="tag tag-neutral" style={TAG_STYLE}>
          {ldLabel}
        </span>
        <span className="tag tag-neutral" style={TAG_STYLE}>
          {sgLabel}
        </span>
      </div>

      <SliderRow
        label={`Ballistic coeff · ${state.dragModel}`}
        display={state.bc.toFixed(3)}
        min={0.1}
        max={1.2}
        step={0.001}
        value={state.bc}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "bc", value })}
      />
      <SliderRow
        label="Muzzle velocity"
        display={`${Math.round(toVelocity(state.muzzleFps * FT_TO_M, metric))} ${units.velocity}`}
        min={1200}
        max={4200}
        step={5}
        value={state.muzzleFps}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "muzzleFps", value })}
      />
      <SliderRow
        label="Velocity SD"
        display={`± ${Math.round(toVelocity(state.muzzleSdFps * FT_TO_M, metric))} ${units.velocity}`}
        min={0}
        max={40}
        step={1}
        value={state.muzzleSdFps}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "muzzleSdFps", value })}
      />
      <SliderRow
        label="Bullet weight"
        display={metric ? `${weightGrams(state.weightGr).toFixed(1)} g` : `${state.weightGr} gr`}
        min={40}
        max={800}
        step={1}
        value={state.weightGr}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "weightGr", value })}
      />
      <SliderRow
        label="Barrel twist"
        display={`1 : ${state.twistIn.toFixed(1)} in`}
        min={5}
        max={20}
        step={0.1}
        value={state.twistIn}
        onChange={(value) => dispatch({ type: "SET_FIELD", key: "twistIn", value })}
      />
    </>
  );
}
