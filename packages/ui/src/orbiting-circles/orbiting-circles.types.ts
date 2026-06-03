import type { ReactNode } from "react";

export interface OrbitingCirclesProps {
  /** 环绕的子元素（图标等），按数量均匀分布到圆周。 */
  children?: ReactNode;
  /** 轨道半径(px)。 */
  radius?: number;
  /** 一圈时长(s)。 */
  duration?: number;
  /** 反向旋转。 */
  reverse?: boolean;
  /** 子元素方框尺寸(px)。 */
  iconSize?: number;
  /** 是否画出轨道虚线圆环。 */
  showPath?: boolean;
  className?: string;
}
