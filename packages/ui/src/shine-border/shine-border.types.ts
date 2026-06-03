import type { CSSProperties } from "react";

export interface ShineBorderProps {
  /** 边框宽度 px，默认 1 */
  borderWidth?: number;
  /** 流光一轮秒数，默认 14 */
  duration?: number;
  /** 流光色（数组或单色），默认瑚琏 chart token */
  shineColor?: string | string[];
  className?: string;
  style?: CSSProperties;
}
