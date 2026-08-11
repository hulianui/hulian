import type { ReactNode } from "react";

export interface PopoverContentProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /**
   * 不画皮：为真时不渲染包住 children 的那层皮肤 div（内边距补偿 + `text-sm text-foreground`），
   * children 直接进 Popup。浮层里装的是自带外观、要贴边铺满的一整块（顶部搜索行 + 列表的标签选择器、
   * `Calendar` 面板、当贴边菜单用的浮层）时配 `className="p-0"` 一起用。
   * 与 `Card` 的 `variant="plain"`、`AccordionPanel` / `CollapsiblePanel` 的 `plain` 同名同义
   * （hulianui/hulian#172 / #162 / #159）。
   * @default false
   */
  plain?: boolean;
  /**
   * 是否渲染指向触发器的箭头。贴边型浮层（菜单 / 日历 / 铺满型面板）通常不要箭头。
   * 独立于 `plain`：箭头指的是浮层与触发器的关系，不是内容的皮肤，两者可各开各的。
   * @default true
   */
  arrow?: boolean;
  className?: string;
}
