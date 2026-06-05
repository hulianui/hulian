import type { ReactNode } from "react";

export type SwipeActionTone = "default" | "primary" | "danger" | "success" | "warning";

export interface SwipeActionButton {
  key: string;
  label: ReactNode;
  /** 背景色调，默认 default。 */
  tone?: SwipeActionTone;
  onClick?: () => void;
}

export interface SwipeActionProps {
  children: ReactNode;
  /** 左滑出（内容右移）时显示的动作。 */
  left?: SwipeActionButton[];
  /** 右滑出（内容左移）时显示的动作。 */
  right?: SwipeActionButton[];
  /** 松手触发完全展开的阈值（占动作区宽度比例 0-1），默认 0.5。 */
  threshold?: number;
  /** 展开/收起回调（null=收起）。 */
  onOpenChange?: (side: "left" | "right" | null) => void;
  className?: string;
}
