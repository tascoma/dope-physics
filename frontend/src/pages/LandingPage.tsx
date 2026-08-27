import { Nav } from "../components/landing/Nav";
import { Hero } from "../components/landing/Hero";
import { ModelOfRecordTable } from "../components/landing/ModelOfRecordTable";
import { SolvedFromFirstPrinciples } from "../components/landing/SolvedFromFirstPrinciples";
import { WhereModelStops } from "../components/landing/WhereModelStops";
import { ClosingCTA } from "../components/landing/ClosingCTA";
import { Footer } from "../components/landing/Footer";

export function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <Nav />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <Hero />
        <ModelOfRecordTable />
        <SolvedFromFirstPrinciples />
        <WhereModelStops />
        <ClosingCTA />
        <Footer />
      </div>
    </div>
  );
}
