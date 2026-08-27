import { useShot } from "../../state/ShotContext";
import { SideView } from "./views/SideView";
import { PlanView } from "./views/PlanView";
import { ReticleView } from "./views/ReticleView";
import { VelocityView } from "./views/VelocityView";
import { RangeCardView } from "./views/RangeCardView";

export function Views() {
  const { state } = useShot();
  return (
    <div style={{ minHeight: 0, overflow: "auto", padding: "16px 18px 22px" }}>
      {state.view === "side" && <SideView />}
      {state.view === "top" && <PlanView />}
      {state.view === "scope" && <ReticleView />}
      {state.view === "curves" && <VelocityView />}
      {state.view === "dope" && <RangeCardView />}
    </div>
  );
}
