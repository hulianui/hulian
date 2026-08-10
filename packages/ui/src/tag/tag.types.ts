import type { HTMLAttributes, ReactNode } from "react";

export type TagTone = "neutral" | "brand" | "success" | "warning" | "danger";
export type TagVariant = "soft" | "solid" | "outline";

/**
 * 继承 span 的原生属性：状态标签经常要挂 `title` 做 hover 全文（短标签 + 完整值，
 * 典型如表格里显示「Word」而 title 是完整 MIME）、挂 `data-testid` 给 e2e、挂 `aria-*` 给读屏。
 * 封闭接口把这些全挡在外面，而同库的 Button / Card / Empty / Progress 都是继承的（#148）。
 */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
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
