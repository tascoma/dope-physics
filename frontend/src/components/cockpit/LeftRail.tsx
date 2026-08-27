import { ProjectileGroup } from "./groups/ProjectileGroup";
import { RifleZeroGroup } from "./groups/RifleZeroGroup";
import { AtmosphereGroup } from "./groups/AtmosphereGroup";
import { WindGroup } from "./groups/WindGroup";
import { ShotGeometryGroup } from "./groups/ShotGeometryGroup";

export function LeftRail() {
  return (
    <aside
      style={{
        borderRight: "1px solid var(--color-divider)",
        overflowY: "auto",
        padding: "16px 16px 28px",
        background: "var(--color-bg)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <ProjectileGroup />
      <RifleZeroGroup />
      <AtmosphereGroup />
      <WindGroup />
      <ShotGeometryGroup />
    </aside>
  );
}
