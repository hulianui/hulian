import type { ReactNode } from "react";

export interface HoverCardProps {
  children?: ReactNode;
  /** 悬停多少毫秒后打开。@default 300 */
  openDelay?: number;
  /** 移出多少毫秒后关闭。@default 150 */
  closeDelay?: number;
}

export interface HoverCardContentProps {
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
