import type { HTMLAttributes } from "react";

export interface TypingDotsProps extends HTMLAttributes<HTMLSpanElement> {
  /** 无障碍标签（读屏播报）。@default "正在输入" */
  label?: string;
}
