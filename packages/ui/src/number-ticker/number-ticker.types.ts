import type { ComponentPropsWithoutRef } from "react";

export interface NumberTickerProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** 目标值（必填）。进入视口后从 startValue 滚到此值 */
  value: number;
  /** 起始值，默认 0。startValue > value 即自然向下滚（无需单独 direction prop） */
  startValue?: number;
  /** 小数位，默认 0。驱动 Intl.NumberFormat 的 min/maxFractionDigits */
  decimalPlaces?: number;
  /** 滚动时长（秒），默认 1.2。曲线固定复用 motionEase.out（瑚琏签名） */
  duration?: number;
  /** 进入视口后延迟开始（秒），默认 0 */
  delay?: number;
}
