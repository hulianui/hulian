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
// 4. RSC：副作用全在 useEffect 内、SSR/jsdom 下一律 guard，根节点恒定渲染（含移动端，仅隐藏）。
// 5. mix-blend-difference 保留（让光标在明暗底上都可见），但描边/圆点走 token 而非硬编码白。
// 6. 作用域：默认**容器作用域**——根节点 absolute 锚到父容器、pointer 事件只听容器、
//    指针离开容器即隐藏，多实例（文档画廊多 state 并排）互不干扰；
//    fullScreen=true 才回到原始整页 fixed 模式（事件挂 window、接管 body 光标）。

const CORNER_SIZE = 12;
const BORDER_WIDTH = 3;

export function TargetCursor({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  fullScreen = false,
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

    // 容器作用域：以父元素为舞台；全屏模式 container 为 null
    const container = fullScreen ? null : root.parentElement;

    // absolute 根要锚到容器左上角，容器必须是定位上下文；static 时就地补 relative（卸载还原）
    let restorePosition: (() => void) | null = null;
    if (container) {
      const computed = window.getComputedStyle(container);
      if (computed.position === "static") {
        const prev = container.style.position;
        container.style.position = "relative";
        restorePosition = () => {
          container.style.position = prev;
        };
      }
    }

    // 隐藏默认光标：容器模式只藏容器内，全屏模式接管 body
    let restoreCursor: (() => void) | null = null;
    if (hideDefaultCursor) {
      const host = container ?? document.body;
      const prev = host.style.cursor;
      host.style.cursor = "none";
      restoreCursor = () => {
        host.style.cursor = prev;
      };
    }

    // 容器左上角（含边框）的 viewport 坐标——把鼠标/目标的 viewport 坐标换算为容器局部坐标。
    // 每帧重算，滚动/容器移动自然跟随。
    const origin = () => {
      if (!container) return { x: 0, y: 0 };
      const r = container.getBoundingClientRect();
      return { x: r.left + container.clientLeft, y: r.top + container.clientTop };
    };

    // 当前光标中心点（容器局部坐标；全屏模式即 viewport 坐标），lerp 平滑跟随鼠标
    let px = container ? 0 : window.innerWidth / 2;
    let py = container ? 0 : window.innerHeight / 2;
    let mx = px;
    let my = py;

    let visible = !container; // 容器模式初始隐藏，指针进入容器才现身
    let activeTarget: Element | null = null;
    let strength = 0; // 0=空闲(四角默认位) 1=完全包裹目标
    let targetCorners: Array<{ x: number; y: number }> | null = null; // viewport 坐标
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
      const o = origin();

      // 光标中心跟随鼠标（局部坐标）
      px += (mx - o.x - px) * followK;
      py += (my - o.y - py) * followK;
      root.style.transform = `translate(${px}px, ${py}px)`;

      // 包裹强度趋向目标态
      const wantStrength = activeTarget && visible ? 1 : 0;
      strength += (wantStrength - strength) * strengthK;

      // 四角插值：空闲偏移 ↔ 目标包围盒（相对光标中心）
      if (targetCorners) {
        for (let i = 0; i < corners.length; i++) {
          const node = corners[i];
          if (!node) continue;
          const idle = idleCorners[i]!;
          const tgt = targetCorners[i]!;
          const wx = idle.x + (tgt.x - o.x - px - idle.x) * strength;
          const wy = idle.y + (tgt.y - o.y - py - idle.y) * strength;
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
      // 容器模式：只认容器内部的命中目标，杜绝跨实例抢目标
      const scoped = el && container && !container.contains(el) ? null : el;
      if (scoped === activeTarget) return;
      activeTarget = scoped;
      // 自转交给 CSS（含目标态暂停），位置在 tick 内插值
      root.dataset.active = scoped ? "true" : "false";
      targetCorners = scoped ? computeTargetCorners(scoped) : targetCorners;
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

    // 容器模式：进入容器现身（贴位到当前指针，避免从旧位置飞入）；离开即隐藏并清目标
    const onEnter = (e: MouseEvent) => {
      visible = true;
      root.style.opacity = "1";
      const o = origin();
      mx = e.clientX;
      my = e.clientY;
      px = mx - o.x;
      py = my - o.y;
    };
    const onLeave = () => {
      visible = false;
      root.style.opacity = "0";
      activeTarget = null;
      root.dataset.active = "false";
    };

    const onScrollOrResize = () => {
      if (activeTarget) targetCorners = computeTargetCorners(activeTarget);
    };

    // 事件作用域：容器模式全部挂容器（互不干扰多实例），全屏模式挂 window
    const host: HTMLElement | Window = container ?? window;
    host.addEventListener("mousemove", onMove as EventListener);
    host.addEventListener("mouseover", onOver as EventListener, { passive: true });
    host.addEventListener("mouseout", onOut as EventListener, { passive: true });
    host.addEventListener("mousedown", onDown as EventListener);
    host.addEventListener("mouseup", onUp as EventListener);
    if (container) {
      container.addEventListener("mouseenter", onEnter);
      container.addEventListener("mouseleave", onLeave);
    }
    // scroll 用 capture 捕获嵌套滚动容器；目标包围盒按需重算
    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.cancelAnimationFrame(raf);
      host.removeEventListener("mousemove", onMove as EventListener);
      host.removeEventListener("mouseover", onOver as EventListener);
      host.removeEventListener("mouseout", onOut as EventListener);
      host.removeEventListener("mousedown", onDown as EventListener);
      host.removeEventListener("mouseup", onUp as EventListener);
      if (container) {
        container.removeEventListener("mouseenter", onEnter);
        container.removeEventListener("mouseleave", onLeave);
      }
      window.removeEventListener("scroll", onScrollOrResize, { capture: true });
      window.removeEventListener("resize", onScrollOrResize);
      restoreCursor?.();
      restorePosition?.();
    };
  }, [targetSelector, hideDefaultCursor, hoverDuration, fullScreen, reduce]);

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
        "pointer-events-none left-0 top-0 h-0 w-0",
        fullScreen ? "fixed z-[9999]" : "absolute z-50",
        "-translate-x-1/2 -translate-y-1/2 [mix-blend-mode:difference]",
        spinClass,
        className,
      )}
      style={
        {
          "--hulian-tc-color": color,
          "--hulian-tc-spin": `${spinDuration}s`,
          scale: "var(--hulian-tc-scale, 1)",
          // 容器模式初始隐藏（指针进入容器才现身）；全屏模式恒显
          opacity: fullScreen ? undefined : 0,
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
