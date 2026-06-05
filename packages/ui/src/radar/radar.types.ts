import type { ReactNode } from "react";

export interface RadarProps {
  /**
   * 整体动画速度因子（环波扩散 + 扫描臂共用基础时间），默认 1。
   * 直接映射到 GLSL uniform uSpeed；越大整体越快。
   */
  speed?: number;

  /**
   * 雷达图缩放，默认 0.5。
   * 越小雷达盘越大（铺满容器），越大雷达盘越小（留更多边距）。
   */
  scale?: number;

  /**
   * 同心环数量，默认 10。
   * 越大环越密集。
   */
  ringCount?: number;

  /**
   * 辐条（径向分隔线）数量，默认 10。
   * 越大辐条越密集；0 表示无辐条。
   */
  spokeCount?: number;

  /**
   * 同心环线条粗细，默认 0.05。
   * 越大环线越宽越柔，越小越锐利。
   */
  ringThickness?: number;

  /**
   * 辐条线条粗细，默认 0.01。
   * 越大辐条越宽。
   */
  spokeThickness?: number;

  /**
   * 扫描臂旋转速度，默认 1。
   * 越大扫描臂转得越快。
   */
  sweepSpeed?: number;

  /**
   * 扫描臂宽度（幂次锐度），默认 2。
   * 越大扫描光束越窄越锐，越小越宽越散。
   */
  sweepWidth?: number;

  /**
   * 扫描臂瓣数，默认 1。
   * 1 = 单束扫描；2 = 对称双束；以此类推。
   */
  sweepLobes?: number;

  /**
   * 雷达主色（环 / 辐条 / 扫描臂），CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   */
  color?: string;

  /**
   * 雷达底色（叠加在透明画布上的常驻基色），CSS 颜色字符串。
   * 默认不叠底色（透明），让组件透出宿主容器背景。
   */
  backgroundColor?: string;

  /**
   * 边缘衰减幂次，默认 2。
   * 越大中心越聚焦、边缘消散越快；越小整盘越均匀发亮。
   */
  falloff?: number;

  /**
   * 整体亮度倍率，默认 1。
   * 越大越亮。
   */
  brightness?: number;

  /**
   * 是否开启鼠标视差（雷达盘随指针平滑偏移），默认 true。
   */
  enableMouseInteraction?: boolean;

  /**
   * 鼠标视差影响系数，默认 0.1。
   * 越大盘随指针偏移越明显。
   */
  mouseInfluence?: number;

  /**
   * 额外 className，透传到根容器（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的径向渐变装饰 div。
   */
  fallback?: ReactNode;
}
