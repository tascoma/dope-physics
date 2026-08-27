import type { CSSProperties, ReactNode } from "react";

const BASE_STYLE: CSSProperties = {
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 9.5,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--color-accent)",
  margin: "20px 0 3px",
};

interface GroupHeaderProps {
  children: ReactNode;
  style?: CSSProperties;
}

/** The `NN — Group name` mono label used above each left-rail control group. */
export function GroupHeader({ children, style }: GroupHeaderProps) {
  return <div style={{ ...BASE_STYLE, ...style }}>{children}</div>;
}
