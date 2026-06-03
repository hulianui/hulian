import type { ReactNode } from "react";

export interface SpinProps {
  /** 是否处于加载态，默认 true。 */
  spinning?: boolean;
  /** 加载文案，居中显示在 Spinner 下方。 */
  tip?: ReactNode;
  /** 延迟显示毫秒数：spinning 持续超过 delay 才显示遮罩（防快速完成时闪烁）。默认 0。 */
  delay?: number;
  /** 尺寸，透传内部 Spinner。默认 md。 */
  size?: "sm" | "md" | "lg";
  /** 整页遮罩（fixed 覆盖视口），忽略 children。 */
  fullscreen?: boolean;
  /** 被包裹的内容；遮罩期 pointer-events:none。不传则作纯指示器。 */
  children?: ReactNode;
  className?: string;
}
