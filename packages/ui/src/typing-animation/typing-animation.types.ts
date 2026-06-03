import type { ComponentPropsWithoutRef } from "react";

export interface TypingAnimationProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** 要逐字打出的文本 */
  text: string;
  /** 每字毫秒，默认 80 */
  duration?: number;
  /** 开始前延迟毫秒，默认 0 */
  delay?: number;
  /** 进入视口才开始，默认 true */
  startOnView?: boolean;
  /** 显示闪烁光标，默认 true */
  showCursor?: boolean;
}
