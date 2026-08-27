import { useCallback, useEffect, useRef } from "react";
import { useShot } from "../state/ShotContext";

/**
 * Drives the FIRE marker with a single requestAnimationFrame loop writing an
 * index into state — never re-solves per frame (ARCHITECTURE.md).
 */
export function useFireAnimation() {
  const { dispatch, solution } = useShot();
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const fire = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);

    const durationMs = Math.min(Math.max(solution.tofS * 1400, 900), 3600);
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      dispatch({ type: "SET_ANIM_PROGRESS", progress });
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        timeoutRef.current = window.setTimeout(
          () => dispatch({ type: "SET_ANIM_PROGRESS", progress: null }),
          1100,
        );
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [dispatch, solution.tofS]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return { fire };
}
