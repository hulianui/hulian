import type { HTMLAttributes, ReactNode } from "react";

// 注意：React 的 HTMLAttributes 含 microdata 全局属性 content?: string，
// 与本组件接受数组的 content 冲突 → 必须 Omit 掉再自定义（同 Alert 对 title 的处理）。
export interface WatermarkProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /** 水印文字；传数组渲染为多行。与 image 二选一（同传以 image 优先）。 */
  content?: string | string[];
  /** 图片水印源（dataURL / 链接）。设置后忽略 content。 */
  image?: string;
  /** 图片宽度（px），仅 image 模式生效。默认 120。 */
  width?: number;
  /** 图片高度（px），仅 image 模式生效。不传按图片原始宽高比推算。 */
  height?: number;
  /** 旋转角度（度），默认 -22。 */
  rotate?: number;
  /** 水印间距（px）。单值同时作用 x/y，或传 [x, y]。默认 100。 */
  gap?: number | [number, number];
  /** 文字字号（px），默认 16。 */
  fontSize?: number;
  /** 字体族，默认 sans-serif。 */
  fontFamily?: string;
  /** 字重，默认 normal。 */
  fontWeight?: number | string;
  /**
   * 水印颜色。不传则读取语义 token `--color-muted`（随明暗主题自适应），
   * 配合 opacity 形成「text-muted 半透明」默认观感。
   */
  color?: string;
  /** 整体不透明度，默认 0.15。 */
  opacity?: number;
  /** 水印层 z-index，默认 9（覆盖内容但 pointer-events:none 不挡交互）。 */
  zIndex?: number;
  children?: ReactNode;
}
