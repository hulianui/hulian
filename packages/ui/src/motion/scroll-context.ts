"use client";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";

// 滚动驱动型动画的「滚动上下文」自适应 —— ScrollFloat / ScrollReveal 共用。
//
// 为什么不能盲绑视口：`useScroll({ target })` 默认监听 window 滚动。组件一旦被放进内部
// 滚动区（文档站的 <main class="overflow-auto">、画廊预览框、抽屉、弹层），容器滚动不会
// 触发 window scroll，进度**永远停在 0** —— 而这类组件的 0 进度就是「透明 / 下沉 / 模糊」
// 的初始态，表现为文字看不见。比不动更糟：用户以为组件坏了，实际是绑错了滚动源。
//
// 三档：
// - `container`：显式传入或自动探到的可滚动祖先
// - `viewport`：没有可滚祖先，但页面本身可滚 → 绑窗口（useScroll 的默认行为）
// - `none`：两者都没有 → 调用方应降级为 in-view 入场，别把内容永远留在初始态
export type ScrollCtx = "pending" | "container" | "viewport" | "none";

/** 向上找最近的「可滚动且内容确实溢出」的祖先；没有则返回 null。 */
export function findScrollableAncestor(from: HTMLElement | null): HTMLElement | null {
  let el = from?.parentElement ?? null;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el);
    const clips = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
    if (clips && el.scrollHeight > el.clientHeight + 1) return el;
    el = el.parentElement;
  }
  return null;
}

/**
 * 探测 `targetRef` 所处的滚动上下文。
 *
 * **必须在 `useScroll` 之前调用** —— 两者同为 layout effect，按声明序先探测、再订阅，
 * 否则 useScroll 第一次订阅时拿到的还是空容器。
 *
 * 返回的 `containerRef` 直接喂给 `useScroll({ container })`，但注意调用方要写成
 * `container: ctx === "container" ? containerRef : undefined` —— useScroll 对
 * 「`.current` 为 null 的 ref」会一直等 hydrate 而不订阅，视口模式必须传 undefined 而非空 ref。
 */
export function useScrollContext(
  targetRef: RefObject<HTMLElement | null>,
  scrollContainerRef?: RefObject<HTMLElement | null>,
): { ctx: ScrollCtx; containerRef: RefObject<HTMLElement | null> } {
  const autoContainerRef = useRef<HTMLElement | null>(null);
  const [ctx, setCtx] = useState<ScrollCtx>(() => (scrollContainerRef ? "container" : "pending"));

  useLayoutEffect(() => {
    if (scrollContainerRef) {
      setCtx("container");
      return;
    }
    const found = findScrollableAncestor(targetRef.current);
    if (found) {
      autoContainerRef.current = found;
      // useScroll 要求容器非 static 定位才能算对 target 偏移（否则 dev 告警 + 进度错位）。
      let restorePosition: (() => void) | undefined;
      if (getComputedStyle(found).position === "static") {
        const prev = found.style.position;
        found.style.position = "relative";
        restorePosition = () => {
          found.style.position = prev;
        };
      }
      setCtx("container");
      return restorePosition;
    }
    const doc = document.documentElement;
    setCtx(doc.scrollHeight > doc.clientHeight + 1 ? "viewport" : "none");
  }, [scrollContainerRef, targetRef]);

  return { ctx, containerRef: scrollContainerRef ?? autoContainerRef };
}
