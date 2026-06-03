import type { ReactNode } from "react";

export interface ChipProps {
  variant?: "solid" | "soft" | "outline";
  tone?: "brand" | "danger" | "neutral";
  size?: "sm" | "md";
  /** 提供则渲染关闭(×)按钮，点击触发该回调（区别于 Badge：Chip 可移除）。 */
  onClose?: () => void;
  /** 前导小圆点（状态指示）。与 avatar/startContent 互斥优先级：avatar > startContent > dot。 */
  dot?: boolean;
  /** 前导头像（贴左边缘，自动按 size 约束为正方形）。传入 <Avatar/> 等节点。 */
  avatar?: ReactNode;
  /** 起始位置内容槽（图标等），avatar 存在时不渲染。 */
  startContent?: ReactNode;
  /** 结尾位置内容槽（图标等），位于 children 之后、关闭按钮之前。 */
  endContent?: ReactNode;
  /** 禁用：降透明度、屏蔽指针事件、关闭按钮不可点。 */
  isDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}
