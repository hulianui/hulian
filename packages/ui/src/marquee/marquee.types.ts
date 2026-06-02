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
}
