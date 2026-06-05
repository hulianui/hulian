"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { StickerPeelProps } from "./sticker-peel.types";

// 吸取自 React Bits StickerPeel：一张可拖拽的贴纸，hover/按住时顶部卷边像真贴纸一样被揭起，
//   配落地投影 + 鼠标跟随高光，拖动时随速度轻微摆动、松手回正。
// 瑚琏化：去 gsap/Draggable + 去 SVG feSpecularLighting —— 拖拽用原生 PointerEvents（setPointerCapture
//   + 父容器边界夹回），卷边用 clip-path transition，高光改为跟随指针的径向渐变层；颜色走瑚琏 token
//   （foreground/border/var(--color-foreground)）；reduced-motion 关掉拖拽摆动与卷边过渡但保留可揭起；
//   关键帧无需新增（全部用 transition）。

const PAD = 10; // 卷边露出的内边距 px

export function StickerPeel({
  imageSrc,
  alt = "",
  width = 200,
  rotate = 30,
  peelBackHoverPct = 30,
  peelBackActivePct = 40,
  peelDirection = 0,
  shadowIntensity = 0.6,
  lightingIntensity = 0.4,
  initialPosition = "center",
  draggable = true,
  className,
  style,
  ...props
}: StickerPeelProps) {
  const reduce = useReducedMotion();

  const dragRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, startX: 0, startY: 0, ox: 0, oy: 0 });
  const [tilt, setTilt] = useState(0);

  // 初始落点
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    if (initialPosition === "center") {
      pos.current = { x: 0, y: 0 };
      el.style.transform = "translate3d(0,0,0)";
      return;
    }
    pos.current = { x: initialPosition.x, y: initialPosition.y };
    el.style.transform = `translate3d(${initialPosition.x}px,${initialPosition.y}px,0)`;
  }, [initialPosition]);

  const clampToBounds = useCallback((x: number, y: number) => {
    const el = dragRef.current;
    const bounds = el?.parentElement;
    if (!el || !bounds) return { x, y };
    const maxX = Math.max(0, bounds.clientWidth - el.offsetWidth);
    const maxY = Math.max(0, bounds.clientHeight - el.offsetHeight);
    return {
      x: Math.min(Math.max(x, 0), maxX),
      y: Math.min(Math.max(y, 0), maxY),
    };
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggable) return;
      const el = dragRef.current;
      if (!el) return;
      drag.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        ox: pos.current.x,
        oy: pos.current.y,
      };
      el.setPointerCapture?.(e.pointerId);
    },
    [draggable],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = dragRef.current;
      // 高光跟随指针（写入 CSS 变量供高光层定位）
      const cont = containerRef.current;
      if (cont) {
        const r = cont.getBoundingClientRect();
        cont.style.setProperty("--hulian-sticker-mx", `${e.clientX - r.left}px`);
        cont.style.setProperty("--hulian-sticker-my", `${e.clientY - r.top}px`);
      }
      if (!drag.current.active || !el) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      const next = clampToBounds(drag.current.ox + dx, drag.current.oy + dy);
      pos.current = next;
      el.style.transform = `translate3d(${next.x}px,${next.y}px,0)`;
      if (!reduce) setTilt(Math.max(-18, Math.min(18, dx * 0.12)));
    },
    [clampToBounds, reduce],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    dragRef.current?.releasePointerCapture?.(e.pointerId);
    setTilt(0);
  }, []);

  // 窗口缩放时把贴纸夹回边界内
  useEffect(() => {
    const onResize = () => {
      const el = dragRef.current;
      if (!el) return;
      const next = clampToBounds(pos.current.x, pos.current.y);
      pos.current = next;
      el.style.transform = `translate3d(${next.x}px,${next.y}px,0)`;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [clampToBounds]);

  const vars: CSSProperties = {
    "--hulian-sticker-w": `${width}px`,
    "--hulian-sticker-rotate": `${rotate}deg`,
    "--hulian-sticker-dir": `${peelDirection}deg`,
    "--hulian-sticker-hover": `${peelBackHoverPct}%`,
    "--hulian-sticker-active": `${peelBackActivePct}%`,
    "--hulian-sticker-start": `${-PAD}px`,
    "--hulian-sticker-end": `calc(100% + ${PAD}px)`,
    "--hulian-sticker-shadow": shadowIntensity,
    "--hulian-sticker-light": lightingIntensity,
    "--hulian-sticker-tilt": `${tilt}deg`,
  } as CSSProperties;

  // 卷边揭开时正面贴纸的下沉裁剪
  const mainClip =
    "[clip-path:polygon(var(--hulian-sticker-start)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-end),var(--hulian-sticker-start)_var(--hulian-sticker-end))]";

  const img = (extra?: string) => (
    <img
      src={imageSrc}
      alt={alt}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "block w-[var(--hulian-sticker-w)] select-none [rotate:var(--hulian-sticker-rotate)]",
        extra,
      )}
    />
  );

  return (
    <div
      {...props}
      ref={dragRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ ...vars, ...style }}
      className={cn(
        "group/sticker absolute touch-none select-none",
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        className,
      )}
    >
      <div
        ref={containerRef}
        className="relative [rotate:calc(var(--hulian-sticker-dir)+var(--hulian-sticker-tilt))] [transition:rotate_0.6s_ease-out] motion-reduce:[transition:none]"
      >
        {/* 正面贴纸：drop-shadow 落地投影 + 卷边时顶部下沉裁剪 */}
        <div
          className={cn(
            "relative [filter:drop-shadow(2px_4px_6px_rgba(0,0,0,var(--hulian-sticker-shadow)))]",
            "[transition:clip-path_0.6s_ease-out] will-change-[clip-path] motion-reduce:[transition:none]",
            mainClip,
            // hover / active 揭开
            "group-hover/sticker:[clip-path:polygon(var(--hulian-sticker-start)_var(--hulian-sticker-hover),var(--hulian-sticker-end)_var(--hulian-sticker-hover),var(--hulian-sticker-end)_var(--hulian-sticker-end),var(--hulian-sticker-start)_var(--hulian-sticker-end))]",
            "group-active/sticker:[clip-path:polygon(var(--hulian-sticker-start)_var(--hulian-sticker-active),var(--hulian-sticker-end)_var(--hulian-sticker-active),var(--hulian-sticker-end)_var(--hulian-sticker-end),var(--hulian-sticker-start)_var(--hulian-sticker-end))]",
          )}
        >
          {img("[transform:rotate(calc(-1*var(--hulian-sticker-dir)))]")}
          {/* 鼠标跟随高光层：径向渐变锚到指针位置，token 取 foreground */}
          {lightingIntensity > 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[var(--hulian-sticker-light)] mix-blend-soft-light [background:radial-gradient(120px_120px_at_var(--hulian-sticker-mx,_50%)_var(--hulian-sticker-my,_30%),var(--color-foreground),transparent_70%)]"
            />
          )}
        </div>

        {/* 翻起的背面卷边：默认收成一条线，hover/active 展开并下移露出 */}
        <div
          aria-hidden
          className={cn(
            "absolute left-0 top-[calc(-100%-2*10px)] h-full w-full [transform:scaleY(-1)]",
            "[transition:all_0.6s_ease-out] will-change-[clip-path,top] motion-reduce:[transition:none]",
            "[clip-path:polygon(var(--hulian-sticker-start)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-start),var(--hulian-sticker-start)_var(--hulian-sticker-start))]",
            "group-hover/sticker:[clip-path:polygon(var(--hulian-sticker-start)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-hover),var(--hulian-sticker-start)_var(--hulian-sticker-hover))]",
            "group-hover/sticker:[top:calc(-100%+2*var(--hulian-sticker-hover)-1px)]",
            "group-active/sticker:[clip-path:polygon(var(--hulian-sticker-start)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-start),var(--hulian-sticker-end)_var(--hulian-sticker-active),var(--hulian-sticker-start)_var(--hulian-sticker-active))]",
            "group-active/sticker:[top:calc(-100%+2*var(--hulian-sticker-active)-1px)]",
          )}
        >
          <div className="[filter:brightness(0.9)_contrast(1.05)] [transform:rotate(calc(-1*var(--hulian-sticker-dir)))]">
            {img()}
          </div>
        </div>
      </div>
    </div>
  );
}
