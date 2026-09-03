"use client";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { hasInteractiveAncestorWithin } from "../lib/drag-guard";

/**
 * 拖拽把手标记。DialogContent 开了 `draggable` 时自动落在标题行上；
 * 可见 header 由消费方自己画（没有 title / extra）时，把它标在自家把手元素上即可。
 */
export const DRAG_HANDLE_ATTR = "data-drag-handle";

export interface DragRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface DragBounds {
  minDx: number;
  maxDx: number;
  minDy: number;
  maxDy: number;
}

/**
 * 按「整块不出视口」算出本次拖拽允许的位移区间。
 *
 * popup 比视口还大时区间会反转（左边界要求 dx ≥ 正数、右边界要求 dx ≤ 负数），
 * 这时取两端之间而不是判成「不能动」—— 至少两条边都够得着。默认 popup 封顶 90vw / 85dvh，
 * 只有消费方把宽度改到超过视口时才会走到这个分支。
 */
export function dragBounds(rect: DragRect, viewport: { width: number; height: number }): DragBounds {
  const leftRoom = -rect.left;
  const rightRoom = viewport.width - rect.right;
  const topRoom = -rect.top;
  const bottomRoom = viewport.height - rect.bottom;
  return {
    minDx: Math.min(leftRoom, rightRoom),
    maxDx: Math.max(leftRoom, rightRoom),
    minDy: Math.min(topRoom, bottomRoom),
    maxDy: Math.max(topRoom, bottomRoom),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface DragSession extends DragBounds {
  pointerId: number;
  startX: number;
  startY: number;
  baseLeft: number;
  baseTop: number;
}

type PopupPointerEvent = ReactPointerEvent<HTMLDivElement>;

export interface PopupDragHandlers {
  onPointerDown: (e: PopupPointerEvent) => void;
  onPointerMove: (e: PopupPointerEvent) => void;
  onPointerUp: (e: PopupPointerEvent) => void;
  onPointerCancel: (e: PopupPointerEvent) => void;
}

/**
 * 给 Base UI 的 Popup 装上「按住把手拖动」的一组指针事件。
 *
 * 位移写在 popup 的内联 `left` / `top`（像素），刻意不碰 `translate` / `transform`：
 * - Popup 靠 `-translate-x-1/2 -translate-y-1/2` 居中（Tailwind v4 编成独立的 `translate` 属性），
 *   内联 left/top 只是把参照点挪走，居中偏移照旧叠在上面；消费方用 className 改初始位置
 *   （`top-10 translate-y-0` 之类）也照常生效，因为 left/top 是在它们的**结果**上累加。
 * - `translate` / `scale` 都在 Popup 的过渡列表里（#341 起真的会动），写它们会让每一步位移
 *   都吃 200ms 缓动 —— 跟手感全无。`left` / `top` 不在那个列表里，所以拖拽逐帧即时生效。
 * - 每一帧只改 DOM，不走 React state：拖一个塞满表单的对话框时不该逐帧重渲染整棵子树。
 *
 * 起点用 `offsetLeft` / `offsetTop`：它们是布局结果（像素，且按规范**忽略 transform**），
 * 比 `getComputedStyle().left` 稳 —— 后者在 left/right/width 三者同给（over-constrained）时
 * 会退回 `50%` 这种未解析值。
 *
 * 位移由 popup 是否还在视口内约束（见 dragBounds）。位置随 Popup 一起卸载：Base UI 关闭即卸载
 * popup，所以每次打开都回到初始位置，不需要额外重置。
 */
export function usePopupDrag(enabled: boolean): PopupDragHandlers | undefined {
  const session = useRef<DragSession | null>(null);

  const onPointerDown = (e: PopupPointerEvent) => {
    if (e.button !== 0) return;
    const popup = e.currentTarget;
    const target = e.target instanceof Element ? e.target : null;
    const handle = target?.closest(`[${DRAG_HANDLE_ATTR}]`) ?? null;
    // React 事件沿 React 树冒泡，嵌套在正文里的另一个（portal 出去的）对话框按下把手时，
    // 外层 Popup 也会收到这个事件 —— 用 DOM 包含关系认「把手是不是我的」。
    if (!handle || !popup.contains(handle)) return;
    // 标题行右侧 extra 里的按钮等交互元素：它们自己要吃这次按下，不起拖。
    if (hasInteractiveAncestorWithin(target, handle)) return;

    const rect = popup.getBoundingClientRect();
    session.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseLeft: popup.offsetLeft,
      baseTop: popup.offsetTop,
      ...dragBounds(rect, { width: window.innerWidth, height: window.innerHeight }),
    };
    // 不让浏览器起文字选择，也不把焦点从正文里的输入框抢走（拖完接着打字）。
    e.preventDefault();
    // 状态先落地、捕获后置且 best-effort：合成事件 / 边缘态下 setPointerCapture 会抛，
    // 抛了也只是指针移出 popup 后不再跟踪，不该连累拖拽本身。
    try {
      popup.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onPointerMove = (e: PopupPointerEvent) => {
    const s = session.current;
    if (!s || e.pointerId !== s.pointerId) return;
    const dx = clamp(e.clientX - s.startX, s.minDx, s.maxDx);
    const dy = clamp(e.clientY - s.startY, s.minDy, s.maxDy);
    const popup = e.currentTarget;
    popup.style.left = `${s.baseLeft + dx}px`;
    popup.style.top = `${s.baseTop + dy}px`;
  };

  const onPointerEnd = (e: PopupPointerEvent) => {
    const s = session.current;
    if (!s || e.pointerId !== s.pointerId) return;
    session.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  if (!enabled) return undefined;
  return { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd };
}
