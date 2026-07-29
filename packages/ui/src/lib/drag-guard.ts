// 可拖容器（Kanban 卡片 / Sortable 列表项）判定「这次按下该不该起拖」的共享口径。
//
// 为什么要共享：两个组件对「什么算交互元素」若各写一份，迟早漂移成两套行为 —— 消费方在
// Kanban 里塞个 contenteditable 能用，搬到 Sortable 里就被拖拽劫持，而这种差异没有任何道理可讲。
// 之前正是如此：sortable 的注释宣称「与 kanban 保持一致」，实际 kanban 少了 contenteditable。

/** 按下这些元素时不该发起拖拽 —— 它们自己要吃指针事件（点击、输入、拖选文字、拖动滑块）。 */
export const INTERACTIVE_DRAG_SELECTOR =
  "a,button,input,textarea,select,label,[role='button'],[role='link'],[contenteditable]:not([contenteditable='false']),[data-no-drag]";

/**
 * 从 target 向上找到 container 为止（**不含 container 自身**），命中交互元素则返回 true。
 *
 * 「不含 container 自身」是承重条件，不是洁癖：dnd-kit 会给可拖元素挂上 `role="button"`
 * （useSortable 的 attributes 里就有），而 `[role='button']` 正在上面的选择器里。
 * 一旦把 container 也测一遍，守卫会命中容器自己，于是**每一次拖拽都被挡光**——
 * 而且症状是「整个组件拖不动」，不是「某些元素拖不动」，很容易被误判成 dnd-kit 坏了。
 *
 * 「在 container 处停住」则是为了不一路找到 document：列表若被外层某个 `<a>` 或 `<label>`
 * 包着，无边界的 closest 会让整个列表连坐锁死。
 *
 * @param target 事件的 target（真实按下的最内层元素）
 * @param container activator 所在元素（整项可拖时是那个 li / 卡片；handle 模式下是手柄本身）
 */
export function hasInteractiveAncestorWithin(
  target: EventTarget | null,
  container: Element | null,
): boolean {
  if (!(target instanceof Element)) return false;
  let node: Element | null = target;
  while (node && node !== container) {
    if (node.matches(INTERACTIVE_DRAG_SELECTOR)) return true;
    node = node.parentElement;
  }
  return false;
}
