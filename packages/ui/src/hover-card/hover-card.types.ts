import type { HTMLAttributes, ReactNode } from "react";
import type { PopoverAnchor } from "../popover/popover.types";

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
  /**
   * 把卡片锚到别处，而不是锚到 `HoverCardTrigger`。口径与 [Popover](../popover/popover.md) 的
   * `anchor` 完全一致（同一个 Base UI Positioner），接受元素 / ref / 返回元素的函数 /
   * 只有 `getBoundingClientRect()` 的虚拟元素。
   *
   * 与 Popover 的差别只有一条：**触发器仍不可省** —— 卡片是 hover 打开的，触发器就是那个被
   * hover 的东西；`anchor` 只改「贴在哪」，不改「谁把它打开」。不传时行为与从前逐字相同。
   */
  anchor?: PopoverAnchor;
}
