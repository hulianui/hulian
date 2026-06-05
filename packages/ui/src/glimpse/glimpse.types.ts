import type { ReactNode } from "react";

export interface GlimpseProps {
  /** 触发元素（通常是行内链接文字/缩略词）。 */
  children: ReactNode;
  /** 预览图 URL（顶部封面）。 */
  image?: string;
  /** 预览标题。 */
  title?: ReactNode;
  /** 预览描述（多行截断）。 */
  description?: ReactNode;
  /** 链接地址：传入则触发器渲染为新标签页外链，并在卡片底部显示域名。 */
  href?: string;
  /** 浮层方位。@default "bottom" */
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** 悬停打开延迟(ms)。@default 300 */
  openDelay?: number;
  /** 移出关闭延迟(ms)。@default 150 */
  closeDelay?: number;
  /** 触发器额外类名。 */
  className?: string;
  /** 预览卡片额外类名。 */
  contentClassName?: string;
}
