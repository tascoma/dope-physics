import { createContext, useContext, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { solve, type Solution } from "../lib/ballistics";
import { DEFAULT_UI_STATE, shotReducer, toShot, type ShotAction, type ShotUIState } from "./shotState";

interface ShotContextValue {
  state: ShotUIState;
  dispatch: Dispatch<ShotAction>;
  solution: Solution;
}

const ShotContext = createContext<ShotContextValue | null>(null);

export function ShotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shotReducer, DEFAULT_UI_STATE);
  // solve() is a pure function of the shot — recompute whenever state changes.
  const solution = useMemo(() => solve(toShot(state)), [state]);
  const value = useMemo(() => ({ state, dispatch, solution }), [state, solution]);
  return <ShotContext.Provider value={value}>{children}</ShotContext.Provider>;
}

export function useShot(): ShotContextValue {
  const ctx = useContext(ShotContext);
  if (!ctx) throw new Error("useShot must be used within a ShotProvider");
  return ctx;
}
