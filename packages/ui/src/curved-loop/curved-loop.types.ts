import type { SVGProps } from "react";

export interface CurvedLoopProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** 跑马灯文案。内部会去掉尾部空白并补一个不间断空格作为词间隔，再首尾无缝拼接铺满曲线。 */
  text?: string;
  /**
   * 滚动速度（像素 / 帧，约按 60fps 计）。值越大滚动越快。
   * @default 2
   */
  speed?: number;
  /**
   * 曲线弯曲量（二次贝塞尔控制点的垂直偏移，单位 viewBox 像素）。
   * 正值向下弯（凹），负值向上弯（凸），0 近似直线。
   * @default 320
   */
  curveAmount?: number;
  /**
   * 自动滚动方向。
   * @default "left"
   */
  direction?: "left" | "right";
  /**
   * 是否允许鼠标 / 触控拖拽来手动拨动文字（松手后沿拖拽方向继续自动滚动）。
   * @default true
   */
  interactive?: boolean;
  /** 文字颜色 token 类名（如 text-primary / text-foreground）。默认 fill 走 currentColor，可由父级 text-* 控制。 */
  className?: string;
}
