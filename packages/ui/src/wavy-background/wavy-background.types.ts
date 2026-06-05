import type { HTMLAttributes } from "react";

/**
 * WavyBackground — 噪声驱动的彩色波浪带 canvas 背景层。
 * 来源：Aceternity UI wavy-background，瑚琏化：token 颜色、reduced-motion 静帧、SSR 安全、零依赖噪声。
 */
export interface WavyBackgroundProps {
  /** 波浪上方的内容（absolute 居中覆盖） */
  children?: React.ReactNode;
  /** 内容容器类（覆盖在波浪上的 wrapper div） */
  className?: string;
  /** 外层根容器类 */
  containerClassName?: string;
  /**
   * 波浪颜色列表，支持任意 CSS 颜色字符串（含 `var(--…)`）。
   * 默认消费瑚琏 chart token，挂载后 getComputedStyle 解析成实际色值再绘制。
   */
  colors?: string[];
  /** 每条波浪的绘制宽度（像素，越大波带越粗） @default 50 */
  waveWidth?: number;
  /**
   * 背景填充色；每帧半透明绘制产生拖影。
   * 默认吃 `--color-background` / 兜底 `--color-bg`。
   * 同样支持 CSS 变量，挂载后解析。
   */
  backgroundFill?: string;
  /** canvas filter blur（像素）。0 = 不模糊 @default 10 */
  blur?: number;
  /** 动画速度 @default "fast" */
  speed?: "slow" | "fast";
  /**
   * 每条波浪的整体透明度 (0-1) @default 0.5
   * 注意：canvas 逐帧半透明 backgroundFill 本身会产生叠加效果。
   */
  waveOpacity?: number;
  /** 透传至外层根 div（containerClassName 之外的 HTML 属性，含 data-* 自定义属性） */
  containerProps?: Omit<HTMLAttributes<HTMLDivElement>, "className"> & Record<`data-${string}`, string | undefined>;
}
