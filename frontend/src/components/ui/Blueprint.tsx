import type { CSSProperties, ReactNode } from "react";

interface BlueprintProps {
  className?: string;
  style?: CSSProperties;
  /** Registration-mark color override — the solution card uses a translucent light tint. */
  cornerColor?: string;
  children: ReactNode;
}

/** The `.blueprint` frame + its four registration-mark corners. Never drop the marks. */
export function Blueprint({ className, style, cornerColor, children }: BlueprintProps) {
  const cornerStyle = cornerColor ? { color: cornerColor } : undefined;
  return (
    <div className={["blueprint", className].filter(Boolean).join(" ")} style={{ borderRadius: 0, ...style }}>
      <i className="corner tl" style={cornerStyle} />
      <i className="corner tr" style={cornerStyle} />
      <i className="corner bl" style={cornerStyle} />
      <i className="corner br" style={cornerStyle} />
      {children}
    </div>
  );
}
