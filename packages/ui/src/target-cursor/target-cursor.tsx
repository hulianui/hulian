"use client";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { TargetCursorProps } from "./target-cursor.types";

// 吸取自 React Bits TargetCursor：一个跟随鼠标的自定义光标——中心一颗圆点 + 四角「准星括号」，
// 空闲时四角绕中心持续自转；悬停到命中元素（targetSelector）时四角展开包裹其包围盒，形成瞄准框。
// 瑚琏化：
// 1. 去 gsap 依赖——自转用纯 CSS 关键帧 hulian-target-cursor（落 preset.css），
//    位置/包裹跟随用裸 requestAnimationFrame 做 lerp 缓动插值（零运行时依赖）。
// 2. 颜色全吃 token（默认 var(--color-foreground)，dot 背景 / 四角描边同源），替原始写死 #fff。
// 3. reduced-motion：useReducedMotion 关掉自转 CSS 动画（DOM 结构两态一致），跟随直接置位不插值。
// 4. RSC：副作用全在 useEffect 内、SSR/jsdom 下 getContext 之类一律 guard，根节点恒定渲染（含移动端，仅隐藏）。
// 5. mix-blend-difference 保留（让光标在明暗底上都可见），但描边/圆点走 token 而非硬编码白。

const CORNER_SIZE = 12;
const BORDER_WIDTH = 3;

export function TargetCursor({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  color = "var(--color-foreground)",
  hoverDuration = 0.2,
  className,
  style,
}: TargetCursorProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;

    // 移动端 / 触屏：不接管光标，保持 DOM 但停所有监听
    const isTouch =
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const corners = cornersRef.current;
    const dot = dotRef.current;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = "none";

    // 当前光标中心点（viewport 坐标），用 lerp 平滑跟随鼠标
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let mx = px;
    let my = py;

    let activeTarget: Element | null = null;
    let strength = 0; // 0=空闲(四角默认位) 1=完全包裹目标
    let targetCorners: Array<{ x: number; y: number }> | null = null;
    let raf = 0;

    // 四角空闲态相对中心的偏移（构成一个十字准星方框）
    const idleCorners = [
      { x: -CORNER_SIZE * 1.5, y: -CORNER_SIZE * 1.5 },
      { x: CORNER_SIZE * 0.5, y: -CORNER_SIZE * 1.5 },
      { x: CORNER_SIZE * 0.5, y: CORNER_SIZE * 0.5 },
      { x: -CORNER_SIZE * 1.5, y: CORNER_SIZE * 0.5 },
    ];

    const computeTargetCorners = (el: Element) => {
      const r = el.getBoundingClientRect();
      return [
        { x: r.left - BORDER_WIDTH, y: r.top - BORDER_WIDTH },
        { x: r.right + BORDER_WIDTH - CORNER_SIZE, y: r.top - BORDER_WIDTH },
        {
          x: r.right + BORDER_WIDTH - CORNER_SIZE,
          y: r.bottom + BORDER_WIDTH - CORNER_SIZE,
        },
        { x: r.left - BORDER_WIDTH, y: r.bottom + BORDER_WIDTH - CORNER_SIZE },
      ];
    };

    // lerp 系数：hoverDuration→包裹缓动，跟随固定较快；reduced 时直接置位
    const followK = reduce ? 1 : 0.18;
    const strengthK = reduce ? 1 : Math.min(1, 0.08 / Math.max(hoverDuration, 0.01));

    const tick = () => {
      // 光标中心跟随鼠标
      px += (mx - px) * followK;
      py += (my - py) * followK;
      if (root) root.style.transform = `translate(${px}px, ${py}px)`;

      // 包裹强度趋向目标态
      const wantStrength = activeTarget ? 1 : 0;
      strength += (wantStrength - strength) * strengthK;

      // 四角插值：空闲偏移 ↔ 目标包围盒（相对光标中心）
      if (targetCorners) {
        for (let i = 0; i < corners.length; i++) {
          const node = corners[i];
          if (!node) continue;
          const idle = idleCorners[i]!;
          const tgt = targetCorners[i]!;
          const wx = idle.x + (tgt.x - px - idle.x) * strength;
          const wy = idle.y + (tgt.y - py - idle.y) * strength;
          node.style.transform = `translate(${wx}px, ${wy}px)`;
        }
      } else {
        for (let i = 0; i < corners.length; i++) {
          const node = corners[i];
          if (!node) continue;
          const idle = idleCorners[i]!;
          node.style.transform = `translate(${idle.x}px, ${idle.y}px)`;
        }
      }

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(targetSelector) ?? null;
      if (el === activeTarget) return;
      activeTarget = el;
      // 自转交给 CSS（含目标态暂停），位置在 tick 内插值
      root.dataset.active = el ? "true" : "false";
      targetCorners = el ? computeTargetCorners(el) : targetCorners;
    };

    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null;
      if (activeTarget && (!related || !related.closest?.(targetSelector))) {
        activeTarget = null;
        root.dataset.active = "false";
        // 保留 targetCorners 让强度回落动画平滑，下次悬停再覆盖
      }
    };

    const onDown = () => {
      if (dot) dot.style.transform = "translate(-50%, -50%) scale(0.7)";
      root.style.setProperty("--hulian-tc-scale", "0.9");
    };
    const onUp = () => {
      if (dot) dot.style.transform = "translate(-50%, -50%) scale(1)";
      root.style.setProperty("--hulian-tc-scale", "1");
    };

    const onScrollOrResize = () => {
      if (activeTarget) targetCorners = computeTargetCorners(activeTarget);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, hideDefaultCursor, hoverDuration, reduce]);

  // 自转动画类（空闲转、悬停目标时暂停）；reduced-motion 全停
  const spinClass = cn(
    "[animation:hulian-target-cursor_var(--hulian-tc-spin,2s)_linear_infinite]",
    "data-[active=true]:[animation-play-state:paused]",
    "motion-reduce:[animation:none]",
  );

  const cornerBase =
    "absolute left-1/2 top-1/2 h-3 w-3 will-change-transform [border:3px_solid_var(--hulian-tc-color)]";

  const setCorner = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cornersRef.current[i] = el;
  };

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-active="false"
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[9999] h-0 w-0",
        "-translate-x-1/2 -translate-y-1/2 [mix-blend-mode:difference]",
        spinClass,
        className,
      )}
      style={
        {
          "--hulian-tc-color": color,
          "--hulian-tc-spin": `${spinDuration}s`,
          scale: "var(--hulian-tc-scale, 1)",
          ...style,
        } as CSSProperties
      }
    >
      {/* 中心圆点 */}
      <div
        ref={dotRef}
        className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full [background:var(--hulian-tc-color)] will-change-transform"
      />
      {/* 四角括号：仅留两条相邻边，构成 L 形准星角 */}
      <div ref={setCorner(0)} className={cn(cornerBase, "[border-right:none] [border-bottom:none]")} />
      <div ref={setCorner(1)} className={cn(cornerBase, "[border-left:none] [border-bottom:none]")} />
      <div ref={setCorner(2)} className={cn(cornerBase, "[border-left:none] [border-top:none]")} />
      <div ref={setCorner(3)} className={cn(cornerBase, "[border-right:none] [border-top:none]")} />
    </div>
  );
}
