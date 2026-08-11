import type { HTMLAttributes, ReactNode } from "react";

export interface HoverCardProps {
  children?: ReactNode;
  /** 悬停多少毫秒后打开。@default 300 */
  openDelay?: number;
  /** 移出多少毫秒后关闭。@default 150 */
  closeDelay?: number;
}

/**
 * 继承 div 原生属性（#201）：卡片被 portal 出去，但合成事件仍沿 React 树冒泡回触发器所在的
 * 父元素——「点卡片里的内容顺手触发整行 onClick」只能在卡片根上 stopPropagation 挡住。
 * 同理还有 e2e 定位浮层要的 data-testid 与 role / aria-*。
 */
export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}
