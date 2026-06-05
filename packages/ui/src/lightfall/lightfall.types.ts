import type { ReactNode } from "react";

export interface LightfallProps {
  /**
   * 光束色板（按高度循环取色），默认取瑚琏 chart token，自动吃明暗主题。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可），最多取前 8 个。
   * 默认：["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]
   */
  colors?: string[];
  /**
   * 背景辉光底色（中心一团柔光的颜色），默认取主色 token。
   * 默认：var(--color-primary)
   */
  backgroundColor?: string;
  /**
   * 光束坠落速度，默认 0.5。越大越快；0 近似静止（仍渲染）。
   */
  speed?: number;
  /**
   * 同时坠落的光束条数（1–16，四舍五入并夹取），默认 2。
   */
  streakCount?: number;
  /**
   * 单束光的横向宽度系数，默认 1。越大越粗。
   */
  streakWidth?: number;
  /**
   * 单束光的拖尾长度系数，默认 1。越大尾迹越长。
   */
  streakLength?: number;
  /**
   * 整体辉光强度，默认 1。越大越亮越发光。
   */
  glow?: number;
  /**
   * 光束在角向上的疏密（环数），默认 0.6。越大光束越密集。
   */
  density?: number;
  /**
   * 闪烁强度（0=稳定常亮，1=明暗呼吸），默认 1。
   */
  twinkle?: number;
  /**
   * 视距缩放（隧道纵深感），默认 3。越大纵深越强。
   */
  zoom?: number;
  /**
   * 背景中心辉光的强度，默认 0.5。0 关闭中心辉光。
   */
  backgroundGlow?: number;
  /**
   * 整体不透明度（写入 shader），默认 1。
   */
  opacity?: number;
  /**
   * 是否开启鼠标交互（指针处增亮 + 牵引光团），默认 true。
   */
  mouseInteraction?: boolean;
  /**
   * 鼠标增亮强度，默认 0.5。
   */
  mouseStrength?: number;
  /**
   * 鼠标影响半径，默认 1。
   */
  mouseRadius?: number;
  /**
   * 透传到根容器的额外 className（组件自带 absolute inset-0 z-0）。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 时的静态兜底内容（渲染在降级渐变层内）。
   */
  fallback?: ReactNode;
}
