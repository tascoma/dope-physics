import { useShot } from "../../state/ShotContext";
import { buildEquationCards } from "../../lib/equations";
import { EquationCard } from "./EquationCard";

export function EquationsPanel() {
  const { state, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const cards = buildEquationCards(state, solution, metric);

  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 11 }}>
      {cards.map((c) => (
        <EquationCard key={c.title} {...c} />
      ))}
    </div>
  );
}
