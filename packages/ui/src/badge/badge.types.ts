import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";
export type BadgeVariant = "signal" | "themed";
export type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  /** 数字计数。为 0 时默认隐藏（除非 showZero）。 */
  count?: number;
  /** 超过 max 显示 `max+`（默认 99）。 */
  max?: number;
  /** 仅显示小圆点，不显示数字（优先级高于 count）。 */
  dot?: boolean;
  /** 自定义角标内容（如图标 ✓）。优先级最高，覆盖 count/dot。 */
  content?: ReactNode;
  /** count=0 仍显示。 */
  showZero?: boolean;
  /** 强制隐藏角标，保留被包裹的子元素。 */
  invisible?: boolean;
  /** 语气色，默认 danger（通知红）。 */
  tone?: BadgeTone;
  /**
   * 配色口径（#295）。默认 `"signal"`。
   *
   * · `"signal"` —— 明暗两个主题下同一个实心色 + 白字，即通知角标的通行样子
   *   （Ant Design / MUI 同此）。角标是极小的实心标记、颜色本身就是语义，不该随主题漂。
   * · `"themed"` —— 跟着主题走（`bg-danger text-danger-foreground` 那一套），与按钮 /
   *   警示条同口径。角标被当作**行内状态块**（跟在文字后面表示状态，而不是叠在图标角上）
   *   时用它，那种用法要的是融进当前主题。
   *
   * `neutral` 不受影响：它是中性计数而非警示标记，两档都跟随主题。
   */
  variant?: BadgeVariant;
  size?: "sm" | "md";
  /** 有 children 时角标叠加的角位，默认 top-right。 */
  placement?: BadgePlacement;
  /** 角标位置微调 [x, y]，单位 px（正值=右/下）。圆形宿主常用来外推贴边。 */
  offset?: [number, number];
  children?: ReactNode;
}
