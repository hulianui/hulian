// RouteTabs 的批量动作纯函数：算出「某个动作实际会关掉哪些页签」。
// 单独成文件是因为这套规则最容易出错（pinned 要排除、只剩一个不许关、closeAll 不等于 closeOthers），
// 而且它是**唯一真源** —— 组件与消费方都照这份结果办事，不各算各的。

import type { RouteTabItem } from "./route-tabs.types";

/** 该页签当下是否可关。 */
export function isClosable(item: RouteTabItem, items: RouteTabItem[]): boolean {
  if (item.pinned) return false;
  if (item.closable !== undefined) return item.closable;
  // 默认规则：可关页签多于一个才给关，关到只剩一个就停手（免得内容区空白）
  return items.filter((t) => !t.pinned && t.closable !== false).length > 1;
}

/** 排序后的展示顺序：pinned 恒在前，其余保持原序。 */
export function orderTabs(items: RouteTabItem[]): RouteTabItem[] {
  return [...items.filter((t) => t.pinned), ...items.filter((t) => !t.pinned)];
}

/**
 * 某个动作实际影响到的 key 列表。
 *
 * 三条关键语义：
 * - `closeAll` 关**全部可关的**（含当前页），不是「关闭其他」—— 后者是另一个动作。
 *   此前 AdminLayout 里 closeAll 实为 closeOthers，菜单文案与行为对不上。
 * - `closeLeft` / `closeRight` 按**展示顺序**算，不是数据顺序（pinned 提前会改变左右关系）。
 * - pinned 与 `closable: false` 的页签在任何批量动作里都不会被算进去。
 */
export function affectedKeys(
  action: "close" | "closeOthers" | "closeLeft" | "closeRight" | "closeAll" | "refresh",
  tabKey: string,
  items: RouteTabItem[],
): string[] {
  if (action === "refresh") return [];
  const ordered = orderTabs(items);
  const idx = ordered.findIndex((t) => t.key === tabKey);
  if (idx === -1) return [];

  const closable = (t: RouteTabItem) => !t.pinned && t.closable !== false;

  switch (action) {
    case "close":
      return isClosable(ordered[idx], items) ? [tabKey] : [];
    case "closeOthers":
      return ordered.filter((t) => t.key !== tabKey && closable(t)).map((t) => t.key);
    case "closeLeft":
      return ordered.slice(0, idx).filter(closable).map((t) => t.key);
    case "closeRight":
      return ordered.slice(idx + 1).filter(closable).map((t) => t.key);
    case "closeAll":
      return ordered.filter(closable).map((t) => t.key);
  }
}

/**
 * 关掉一批 key 之后，激活页签该落到哪。
 * 当前页没被关就不动；被关了就取「原展示顺序里最靠近的幸存者」（先往右找，右边没了往左）。
 */
export function nextActiveKey(
  items: RouteTabItem[],
  closing: string[],
  active: string | undefined,
): string | undefined {
  if (!active || !closing.includes(active)) return active;
  const ordered = orderTabs(items);
  const survivors = ordered.filter((t) => !closing.includes(t.key));
  if (survivors.length === 0) return undefined;
  const idx = ordered.findIndex((t) => t.key === active);
  for (let i = idx + 1; i < ordered.length; i++) {
    if (!closing.includes(ordered[i].key)) return ordered[i].key;
  }
  for (let i = idx - 1; i >= 0; i--) {
    if (!closing.includes(ordered[i].key)) return ordered[i].key;
  }
  return survivors[0].key;
}

/** 拖拽调序：把 dragKey 移到 dropKey 之前/之后，pinned 段与非 pinned 段各自独立不互串。 */
export function reorderTabs(
  items: RouteTabItem[],
  dragKey: string,
  dropKey: string,
  before: boolean,
): string[] {
  const drag = items.find((t) => t.key === dragKey);
  const drop = items.find((t) => t.key === dropKey);
  // 固定段与普通段不互相拖入：pinned 的语义就是「钉在最前」，混排会让它自相矛盾
  if (!drag || !drop || Boolean(drag.pinned) !== Boolean(drop.pinned)) {
    return orderTabs(items).map((t) => t.key);
  }
  const ordered = orderTabs(items).filter((t) => t.key !== dragKey);
  const at = ordered.findIndex((t) => t.key === dropKey);
  ordered.splice(before ? at : at + 1, 0, drag);
  return ordered.map((t) => t.key);
}
