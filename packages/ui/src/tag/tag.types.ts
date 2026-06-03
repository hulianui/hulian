import type { ReactNode } from "react";

export type TagTone = "neutral" | "brand" | "success" | "warning" | "danger";
export type TagVariant = "soft" | "solid" | "outline";

export interface TagProps {
  /** 视觉变体：soft 浅底（默认，最常用于状态标签）/ solid 实底 / outline 描边。 */
  variant?: TagVariant;
  /** 语气色：neutral 默认 / brand 处理中 / success 成功 / warning 警告 / danger 错误。 */
  tone?: TagTone;
  size?: "sm" | "md";
  /** 前导状态圆点（颜色随 tone）。与 icon 互斥：icon > dot。 */
  dot?: boolean;
  /** 圆点呼吸动画（processing 进行态语义）。仅在 dot 为真时生效。 */
  pulse?: boolean;
  /** 前导图标槽（状态图标等），存在时不渲染 dot。 */
  icon?: ReactNode;
  /** 提供则渲染关闭(×)按钮，点击触发该回调。 */
  onClose?: () => void;
  /** 禁用：降透明度、屏蔽指针事件、关闭按钮不可点。 */
  isDisabled?: boolean;
  className?: string;
  children?: ReactNode;
}
