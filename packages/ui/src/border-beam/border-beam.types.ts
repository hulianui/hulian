import type { CSSProperties } from "react";

export interface BorderBeamProps {
  /** 光束方块边长 px，默认 50 */
  size?: number;
  /** 绕行一轮秒数，默认 6 */
  duration?: number;
  /** 起始延迟秒，默认 0 */
  delay?: number;
  /** 光束起色，默认 var(--color-primary) */
  colorFrom?: string;
  /** 光束止色，默认 var(--color-chart-2) */
  colorTo?: string;
  /** 反向绕行，默认 false */
  reverse?: boolean;
  /** 起始偏移 0-100，默认 0 */
  initialOffset?: number;
  /** 边框宽度 px，默认 1 */
  borderWidth?: number;
  className?: string;
  style?: CSSProperties;
}
