import type { CSSProperties, RefObject } from "react";

/** 距离衰减曲线：决定鼠标越靠近字形时插值的增长方式 */
export type VariableProximityFalloff = "linear" | "exponential" | "gaussian";

export interface VariableProximityProps {
  /** 要渲染的文本（按词与字逐字拆分；空格保留为不可断词隙）。可访问性副本会以 sr-only 完整朗读。 */
  label: string;
  /**
   * 鼠标"远端"时的字体可变轴设置（CSS font-variation-settings 语法），
   * 如 `"'wght' 400, 'opsz' 9"`。需配合可变字体（variable font）才有视觉变化。
   */
  fromFontVariationSettings: string;
  /**
   * 鼠标"贴近"时的字体可变轴设置，逐轴向此目标插值，
   * 如 `"'wght' 900, 'opsz' 40"`。仅插值 from 中出现的轴；缺省轴回退到 from 值。
   */
  toFontVariationSettings: string;
  /**
   * 计算鼠标相对坐标的参照容器 ref。通常指向包裹本组件的盒子，
   * 让距离基于容器内坐标系；缺省时回退到视口坐标。
   */
  containerRef?: RefObject<HTMLElement | null>;
  /** 影响半径（px）：鼠标距字形中心超出此值则恢复 from 设置。默认 50。 */
  radius?: number;
  /** 衰减曲线。默认 "linear"。"exponential" 更陡、"gaussian" 中心更聚拢柔和。 */
  falloff?: VariableProximityFalloff;
  /** 合并到根 span 的额外类名 */
  className?: string;
  /** 合并到根 span 的内联样式 */
  style?: CSSProperties;
  /** 点击根 span 的回调 */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}
