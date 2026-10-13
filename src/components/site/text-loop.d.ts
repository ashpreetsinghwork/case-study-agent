import type { ComponentType, CSSProperties } from "react";

export type TextLoopShape = "circle" | "infinity" | "arch" | "line" | "wave";

export interface TextLoopProps {
  text?: string;
  shape?: TextLoopShape;
  path?: string;
  speed?: number;
  direction?: "forward" | "reverse";
  separator?: string;
  curviness?: number;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  color?: string;
  separatorColor?: string;
  ribbon?: boolean;
  ribbonColor?: string;
  ribbonWidth?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

declare const TextLoop: ComponentType<TextLoopProps>;
export default TextLoop;
