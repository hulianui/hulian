import type { ReactNode } from "react";

export interface DockProps {
  children?: ReactNode;
  /** 鼠标靠近时图标放大到的峰值尺寸(px)。 */
  magnification?: number;
  /** 影响范围半径(px)。 */
  distance?: number;
  /** 静息图标尺寸(px)。 */
  iconSize?: number;
  className?: string;
}

export interface DockIconProps {
  children?: ReactNode;
  className?: string;
}
