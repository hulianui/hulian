import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /** 滚动方向，默认 "left"（内容向左滚）。"right" 经 animation-direction: reverse */
  direction?: "left" | "right";
  /** 单轮时长（秒），默认 40。越大越慢 */
  duration?: number;
  /** 子项间距（CSS 长度），默认 "1rem" */
  gap?: string;
  /** 鼠标悬停暂停，默认 false */
  pauseOnHover?: boolean;
  /** 子项复制份数，默认 4（窄内容也铺满不露缝） */
  repeat?: number;
  /** 竖向滚动，默认 false（横向）。竖向时 direction="left" 视为向上滚、"right" 向下滚 */
  vertical?: boolean;
  /** 两端渐隐遮罩（mask-image），默认 false。开启后边缘淡入淡出，适合 logo / 图标墙 */
  fade?: boolean;
  /** 渐隐区宽度（CSS 长度），默认 "15%"。仅 fade 为真时生效 */
  fadeWidth?: string;
}
