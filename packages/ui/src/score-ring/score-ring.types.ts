import type { ReactNode } from "react";
import type { Grade } from "./score-ring.grade";

export interface ScoreRingProps {
  /** 当前分值。 */
  value: number;
  /** 满分。@default 100 */
  max?: number;
  /** 等级带（不传用默认 A-F）。 */
  grades?: Grade[];
  /** 直径 px。@default 96 */
  size?: number;
  /** 环宽 px。@default 8 */
  thickness?: number;
  /** 环心副标签（如「质量分」）。 */
  label?: ReactNode;
  /** 是否显示等级字。@default true */
  showGrade?: boolean;
  className?: string;
}
