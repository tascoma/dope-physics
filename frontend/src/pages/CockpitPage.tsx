import { ShotProvider } from "../state/ShotContext";
import { Header } from "../components/cockpit/Header";
import { LeftRail } from "../components/cockpit/LeftRail";
import { RightRail } from "../components/cockpit/RightRail";
import { TabBar } from "../components/cockpit/TabBar";
import { Views } from "../components/cockpit/Views";

export function CockpitPage() {
  return (
    <ShotProvider>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          height: "100vh",
          overflow: "hidden",
          background: "var(--color-bg)",
        }}
      >
        <Header />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "288px minmax(0,1fr) 296px",
            minHeight: 0,
            background: "var(--color-bg)",
          }}
        >
          <LeftRail />
          <main
            style={{
              display: "grid",
              gridTemplateRows: "auto minmax(0,1fr)",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <TabBar />
            <Views />
          </main>
          <RightRail />
        </div>
      </div>
    </ShotProvider>
  );
}
