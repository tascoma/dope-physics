import { useShot } from "../../../state/ShotContext";
import { IN_TO_M } from "../../../lib/ballistics";
import { angularScale, toRange, unitLabels } from "../../../lib/units";
import { corrections } from "../../../lib/ballistics";
import { reticleDivision } from "../../../lib/reticleScale";
import { fx } from "../../../lib/format";
import { Blueprint } from "../../ui/Blueprint";

const CENTER = 260;
const PER = 52; // px per division

export function ReticleView() {
  const { state, solution } = useShot();
  const metric = state.unitSystem === "metric";
  const units = unitLabels(metric);
  const decimals = metric ? 2 : 1;
  const slantM = solution.slantM;

  const scale = angularScale(metric);
  const elev = corrections(solution, metric).elevation; // signed
  const wind = (solution.driftM / slantM) * scale; // signed

  const division = reticleDivision(elev, wind);
  const ppa = PER / division;

  const dots: { x: number; y: number }[] = [];
  const labels: { x: number; y: number; anchor: "middle" | "end"; label: string }[] = [];
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    dots.push({ x: CENTER + i * PER, y: CENTER });
    dots.push({ x: CENTER, y: CENTER + i * PER });
  }
  for (let i = -4; i <= 4; i += 2) {
    if (i === 0) continue;
    const label = fx(Math.abs(i * division), division < 1 ? 2 : 0);
    labels.push({ x: CENTER + i * PER, y: 280, anchor: "middle", label });
    labels.push({ x: 248, y: CENTER + i * PER + 3.5, anchor: "end", label });
  }

  const holdX = Math.max(26, Math.min(494, CENTER - wind * ppa));
  const holdY = Math.max(26, Math.min(494, CENTER - elev * ppa));
  const tgtAng = (state.targetPlateIn * IN_TO_M * scale) / Math.max(slantM, 1e-6);
  const tgtPx = Math.max(5, Math.min(300, tgtAng * ppa));
  const holdAnchor = holdX > CENTER ? "end" : "start";
  const holdTx = holdX + (holdX > CENTER ? -14 : 14);

  const tgtLabel = `${Math.round(toRange(slantM, metric))} ${units.range}`;
  const holdLabel = `${fx(Math.abs(elev), decimals)}${elev >= 0 ? " UP / " : " DOWN / "}${fx(Math.abs(wind), decimals)} ${wind > 0 ? "LEFT" : "RIGHT"}`;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <Blueprint style={{ padding: "12px 14px", background: "var(--color-neutral-100)", flex: "1 1 400px", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Reticle — hold at {tgtLabel}
        </div>
        <svg
          viewBox="0 0 520 520"
          style={{ width: "100%", maxWidth: 520, height: "auto", display: "block", margin: "0 auto", fontFamily: "ui-monospace, Menlo, monospace" }}
          role="img"
          aria-label={`Reticle. Hold ${holdLabel}.`}
        >
          <circle cx={260} cy={260} r={252} fill="#e9e9ea" stroke="rgba(29,31,32,.45)" strokeWidth={1.5} />
          <circle cx={260} cy={260} r={240} fill="none" stroke="rgba(29,31,32,.12)" />
          <rect x={260 - tgtPx / 2} y={260 - tgtPx / 2} width={tgtPx} height={tgtPx} fill="rgba(29,31,32,.14)" stroke="rgba(29,31,32,.4)" />
          <line x1={20} y1={260} x2={500} y2={260} stroke="#1d1f20" strokeWidth={1} />
          <line x1={260} y1={20} x2={260} y2={500} stroke="#1d1f20" strokeWidth={1} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={2.4} fill="#1d1f20" />
          ))}
          {labels.map((l, i) => (
            <text key={i} x={l.x} y={l.y} fontSize={9.5} fill="#5d5d60" textAnchor={l.anchor}>
              {l.label}
            </text>
          ))}
          <line x1={holdX} y1={holdY - 22} x2={holdX} y2={holdY + 22} stroke="#5980a6" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={holdX - 22} y1={holdY} x2={holdX + 22} y2={holdY} stroke="#5980a6" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={holdX} cy={holdY} r={9} fill="none" stroke="#5980a6" strokeWidth={1.5} />
          <circle cx={holdX} cy={holdY} r={2.6} fill="#5980a6" />
          <text x={holdTx} y={holdY - 14} fontSize={10.5} fill="#416180" textAnchor={holdAnchor}>
            HOLD {holdLabel}
          </text>
        </svg>
      </Blueprint>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: "0 1 250px", minWidth: 230 }}>
        <Blueprint style={{ padding: "11px 12px", background: "var(--color-neutral-100)" }}>
          <div
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 9.5,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--color-neutral-600)",
              marginBottom: 7,
            }}
          >
            Dial instead of hold
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "4px 0",
              borderBottom: "1px solid rgba(29,31,32,.08)",
            }}
          >
            <span style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--color-neutral-700)" }}>
              Elevation up
            </span>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 14, color: "var(--color-text)" }}>
              {fx(Math.abs(elev), decimals)} {units.angular}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
            <span style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--color-neutral-700)" }}>
              Windage {wind >= 0 ? "LEFT" : "RIGHT"}
            </span>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 14, color: "var(--color-text)" }}>
              {fx(Math.abs(wind), decimals)} {units.angular}
            </span>
          </div>
        </Blueprint>
        <div style={{ border: "1px solid var(--color-divider)", padding: "11px 12px" }}>
          <div
            style={{
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 9.5,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "var(--color-neutral-600)",
              marginBottom: 6,
            }}
          >
            Target subtension
          </div>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#424244" }}>
            A {metric ? `${Math.round(state.targetPlateIn * 2.54)} cm` : `${state.targetPlateIn} in`} plate at{" "}
            {tgtLabel} subtends {tgtAng.toFixed(2)} {units.angular}. Reticle grid is{" "}
            {fx(division, division < 1 ? 2 : 0)} {units.angular} per division; the marker is where the crosshair goes.
          </p>
        </div>
      </div>
    </div>
  );
}
