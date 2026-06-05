import type { ReactNode } from "react";

export interface FloatingReactionsHandle {
  /** 喷射一个（或 count 个）上浮表情。不传 content 时从 palette 随机取。 */
  emit: (content?: ReactNode, opts?: { count?: number }) => void;
}

export interface FloatingReactionsProps {
  /** 不传 content 时随机取的表情池，默认一组心。 */
  palette?: ReactNode[];
  /** 上浮高度 px，默认 220。 */
  rise?: number;
  /** 横向漂移幅度 px（左右随机），默认 40。 */
  drift?: number;
  /** 单个动画时长 ms，默认 2200。 */
  duration?: number;
  /** 字号 px，默认 24。 */
  size?: number;
  className?: string;
}
