import type { ReactNode } from "react";
import type { Popover as BasePopover } from "@base-ui/react/popover";

/**
 * 浮层锚点：真实元素、指向元素的 ref、返回元素的函数，或**虚拟元素**（只要能给出
 * `getBoundingClientRect()` 的对象）。直接取 Base UI `Popover.Positioner` 的 `anchor` 口径，
 * 不另抄一份 —— 抄一份就会在上游放宽时悄悄落后。
 */
export type PopoverAnchor = NonNullable<BasePopover.Positioner.Props["anchor"]>;

export interface PopoverContentProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /**
   * 把浮层锚到别处，而不是锚到 `PopoverTrigger`。
   *
   * 存在的理由是「触发点不是 DOM 元素」这一整类场景：DOCX / canvas 上算出来的标注点、
   * 右键位置、地图上的坐标 —— 它们只有一个矩形，没有可当触发器的节点。给一个
   * `{ getBoundingClientRect() }` 的虚拟元素即可，翻转 / 视口 clamp / 焦点管理 / Esc 与
   * 点外部关闭仍由本组件负责（hulianui/hulian#229 的消费方为此自绘了 478 行）。
   *
   * 传了 `anchor` 时 `PopoverTrigger` 可以整个省掉（`open` 自己控）；不传时行为与从前逐字相同 ——
   * 仍然锚到触发器。
   *
   * 坐标变化时**换一个新对象**（或用 `() => virtualEl` 的函数形态），别原地改同一个对象的字段：
   * 定位是按 anchor 的 identity 变化重算的，改字段不换对象浮层不会动。
   */
  anchor?: PopoverAnchor;
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
