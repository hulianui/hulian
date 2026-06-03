import type { ReactNode } from "react";

export interface ChipProps {
  variant?: "solid" | "soft" | "outline";
  tone?: "brand" | "danger" | "neutral";
  size?: "sm" | "md";
  /** 提供则渲染关闭(×)按钮，点击触发该回调（区别于 Badge：Chip 可移除）。 */
  onClose?: () => void;
  /** 前导小圆点（状态指示）。 */
  dot?: boolean;
  className?: string;
  children?: ReactNode;
}
