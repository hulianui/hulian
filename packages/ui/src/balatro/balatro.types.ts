import type { ReactNode } from "react";

export interface BalatroProps {
  /**
   * 旋涡静态旋转量（isRotate=false 时生效），默认 -2.0。
   * 控制油彩绕中心的整体旋转角度基准；正负决定旋向。
   */
  spinRotation?: number;

  /**
   * 油彩内部流动速度因子，默认 7.0。
   * 越大正弦迭代相位推进越快，旋涡翻涌越剧烈。
   */
  spinSpeed?: number;

  /**
   * 旋涡中心相对屏幕中点的偏移 [x, y]，默认 [0, 0]。
   * 用于把油彩焦点推离正中（如 [0.1, -0.05] 偏右上）。
   */
  offset?: [number, number];

  /**
   * 主色（旋涡亮带），CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 `--color-chart-1` 取主题色，明暗自适应。
   */
  color1?: string;

  /**
   * 次色（旋涡中段），CSS 颜色字符串。
   * 默认从 `--color-chart-2` 取主题色。
   */
  color2?: string;

  /**
   * 底色（旋涡暗部 / 缝隙），CSS 颜色字符串。
   * 默认从 `--color-chart-5` 取主题色。
   */
  color3?: string;

  /**
   * 对比度，默认 3.5。
   * 越大三色分界越锐利，越小越柔和融合（同时影响基底色占比）。
   */
  contrast?: number;

  /**
   * 高光强度，默认 0.4。
   * 越大旋涡峰值处越亮（叠加白光）；0 = 无额外高光。
   */
  lighting?: number;

  /**
   * 旋转随半径的衰减量，默认 0.25。
   * 越大外圈旋转越强、形成更明显的螺旋拖尾；越小越接近刚体旋转。
   */
  spinAmount?: number;

  /**
   * 像素化强度，默认 745。
   * 数值越大像素块越小（越精细），越小越复古马赛克。
   */
  pixelFilter?: number;

  /**
   * 旋转缓动系数，默认 1.0。
   * 整体缩放旋转量与速度，作微调用。
   */
  spinEase?: number;

  /**
   * 是否让旋涡随时间持续自转，默认 false。
   * true 时 spinRotation 改为驱动持续旋转速度。
   */
  isRotate?: boolean;

  /**
   * 是否开启鼠标交互（横向移动轻微改变旋向/流速），默认 true。
   * 关闭后组件不接收指针事件（pointer-events-none）。
   */
  mouseInteraction?: boolean;

  /**
   * 额外 className，透传到根容器（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认背景为吃 chart token 的 conic-gradient 旋涡兜底。
   */
  fallback?: ReactNode;
}
