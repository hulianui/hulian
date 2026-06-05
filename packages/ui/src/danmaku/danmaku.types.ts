import type { ReactNode } from "react";

/** 弹幕呈现模式：滚动（右→左）/ 顶部居中停留 / 底部居中停留。 */
export type DanmakuMode = "scroll" | "top" | "bottom";

/** 弹幕密度（同时在屏稀疏度）。 */
export type DanmakuDensity = "low" | "normal" | "high";

export interface DanmakuItem {
  /** 受控去重键：组件内部记已上屏 id，只对「新增且未上屏」的入场。 */
  id: string;
  text: ReactNode;
  /** 默认 scroll。 */
  mode?: DanmakuMode;
  /** 文字色，默认继承（前景 token）。 */
  color?: string;
  /** 字号档，默认 md。 */
  size?: "sm" | "md" | "lg";
  bold?: boolean;
}

export interface DanmakuProps {
  /** 受控弹幕流（只增不改既有项）。新增项自动入场。 */
  items: DanmakuItem[];
  /** 滚动轨道数，默认 4。 */
  tracks?: number;
  /** 滚动速度 px/s，默认 100。 */
  speed?: number;
  /** 密度（轨道安全间隙 + 无空闲轨道时是否强挤），默认 normal。 */
  density?: DanmakuDensity;
  /** 弹幕占用容器高度比 0–1，默认 1（满屏）。 */
  area?: number;
  /** 整体不透明度，默认 1。 */
  opacity?: number;
  /** 暂停所有动画。 */
  paused?: boolean;
  className?: string;
}
