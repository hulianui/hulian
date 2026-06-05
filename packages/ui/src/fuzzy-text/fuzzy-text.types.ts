import type { CSSProperties, CanvasHTMLAttributes, ReactNode } from "react";

export interface FuzzyTextProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "color" | "children" | "style"> {
  /**
   * 要渲染的文字内容（仅支持纯文本，会被拼接为一行）。
   */
  children: ReactNode;
  /**
   * 字号，数字按 px、字符串按任意 CSS 长度（含 clamp）。
   * 默认 "clamp(2rem, 10vw, 10rem)"，自适应视口。
   */
  fontSize?: number | string;
  /**
   * 字重，默认 900（厚重笔画下扫描噪点更醒目）。
   */
  fontWeight?: number | string;
  /**
   * 字体族，默认 "inherit"（读取 canvas 的 computed font-family，吃外层字体）。
   */
  fontFamily?: string;
  /**
   * 文字填充色，默认取瑚琏前景 token var(--color-foreground)（自动随明暗主题）。
   * 可传任意 CSS 颜色字符串。
   */
  color?: string;
  /**
   * 是否启用悬停增强（指针在文字范围内时抖动加剧），默认 true。
   */
  enableHover?: boolean;
  /**
   * 静息态噪点强度（0–1），默认 0.18，越大越「毛」。
   */
  baseIntensity?: number;
  /**
   * 悬停态噪点强度（0–1），默认 0.5。
   */
  hoverIntensity?: number;
  /**
   * 每行/列最大像素位移幅度，默认 30，决定扫描噪点的「散开」范围。
   */
  fuzzRange?: number;
  /**
   * 抖动方向：水平按行左右错位 / 垂直按列上下错位 / both 两者叠加，默认 "horizontal"。
   */
  direction?: "horizontal" | "vertical" | "both";
  /**
   * 透传到 canvas 的额外 className。
   */
  className?: string;
  /**
   * 透传到 canvas 的内联样式。
   */
  style?: CSSProperties;
}
