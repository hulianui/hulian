"use client";
import { useCallback, useEffect, useId, useRef } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { BorderGlowProps } from "./border-glow.types";

// 吸取自 React Bits BorderGlow：指针靠近卡片边缘时，沿边框点亮一道彩色网格高光 + 外层霓虹光晕，
// 高亮弧跟随指针角度（conic-gradient mask）、强度随边缘贴近度（edge proximity）渐变；可选挂载时自动扫光一圈。
//
// 瑚琏化要点：
// 1. 颜色全走 token —— glowColor 默认 var(--color-chart-1)，网格色默认 chart-1/3/4，自动吃明暗主题（替原 hsl 写死的紫粉蓝）。
// 2. 去依赖 —— 原版自带独立 .css 文件 + JS 缓动；这里把 CSS 收进组件作用域 <style>（用 useId 隔离多实例），
//    扫光动画用 requestAnimationFrame 自实现缓动，零运行时依赖。
// 3. RSC —— 有指针/ref/RAF，标 "use client"。
// 4. reduced-motion —— useReducedMotion() gate 自动扫光；用户偏好减少动画时跳过 sweep（DOM 不变，静态可点亮）。

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInCubic(x: number) {
  return x * x * x;
}

interface AnimateOpts {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateOpts): () => void {
  let raf = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) raf = requestAnimationFrame(tick);
    else onEnd?.();
  }
  timer = setTimeout(() => {
    raf = requestAnimationFrame(tick);
  }, delay);
  return () => {
    if (timer) clearTimeout(timer);
    if (raf) cancelAnimationFrame(raf);
  };
}

export function BorderGlow({
  children,
  className,
  edgeSensitivity = 30,
  glowColor = "var(--color-chart-1)",
  backgroundColor = "oklch(0.16 0.02 280)",
  borderRadius = 28,
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  animated = false,
  colors = DEFAULT_COLORS,
  fillOpacity = 0.5,
  style,
  ...props
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // 每实例唯一作用域类名，避免多张卡片的 ::before/::after CSS 互相串色。
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const scope = `bg-${uid}`;

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const { width, height } = el.getBoundingClientRect();
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [],
  );

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const { width, height } = el.getBoundingClientRect();
      const dx = x - width / 2;
      const dy = y - height / 2;
      if (dx === 0 && dy === 0) return 0;
      let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty(
        "--bg-edge-proximity",
        `${(getEdgeProximity(card, x, y) * 100).toFixed(3)}`,
      );
      card.style.setProperty(
        "--bg-cursor-angle",
        `${getCursorAngle(card, x, y).toFixed(3)}deg`,
      );
    },
    [getEdgeProximity, getCursorAngle],
  );

  // 挂载自动扫光：reduced-motion 时跳过（DOM 不变，仍可指针点亮）。
  useEffect(() => {
    if (!animated || reduce) return;
    const card = cardRef.current;
    if (!card) return;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add("bg-sweep-active");
    card.style.setProperty("--bg-cursor-angle", `${angleStart}deg`);

    const cancels = [
      animateValue({
        duration: 500,
        onUpdate: (v) => card.style.setProperty("--bg-edge-proximity", `${v}`),
      }),
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: (v) =>
          card.style.setProperty(
            "--bg-cursor-angle",
            `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
          ),
      }),
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: (v) =>
          card.style.setProperty(
            "--bg-cursor-angle",
            `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
          ),
      }),
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (v) => card.style.setProperty("--bg-edge-proximity", `${v}`),
        onEnd: () => card.classList.remove("bg-sweep-active"),
      }),
    ];
    return () => {
      cancels.forEach((c) => c());
      card.classList.remove("bg-sweep-active");
    };
  }, [animated, reduce]);

  // 构建发光档位 box-shadow（内/外双圈各 7 档透明度），颜色用 color-mix 调透明度。
  const glowAlpha = (pct: number) =>
    `color-mix(in srgb, ${glowColor} ${Math.min(pct * glowIntensity, 100)}%, transparent)`;

  // 7 个 radial-gradient 网格层，循环映射取色。
  const grad = (suffix: "border-box" | "padding-box") =>
    GRADIENT_POSITIONS.map((pos, i) => {
      const c = colors[Math.min(COLOR_MAP[i] ?? 0, colors.length - 1)] ?? DEFAULT_COLORS[0];
      return `radial-gradient(at ${pos}, ${c} 0px, transparent 50%) ${suffix}`;
    }).join(",\n    ");

  const baseColor = colors[0] ?? DEFAULT_COLORS[0];

  // 作用域 CSS：忠实复刻原 conic-gradient mask + mask-composite 边缘点亮逻辑，
  // 唯一前缀 scope 隔离多实例，变量改 --bg-* 前缀避免与宿主撞名。
  const css = `
.${scope}{
  --bg-edge-proximity:0;
  --bg-cursor-angle:45deg;
  --bg-edge-sensitivity:${edgeSensitivity};
  --bg-color-sensitivity:calc(var(--bg-edge-sensitivity) + 20);
  --bg-border-radius:${borderRadius}px;
  --bg-glow-padding:${glowRadius}px;
  --bg-cone-spread:${coneSpread};
  --bg-fill-opacity:${fillOpacity};
  position:relative;
  border-radius:var(--bg-border-radius);
  isolation:isolate;
  transform:translate3d(0,0,0.01px);
  display:grid;
  border:1px solid color-mix(in srgb, var(--color-foreground) 15%, transparent);
  background:${backgroundColor};
  overflow:visible;
}
.${scope}::before,.${scope}::after,.${scope} > .bg-edge-light{
  content:"";position:absolute;inset:0;border-radius:inherit;
  transition:opacity .25s ease-out;z-index:-1;
}
.${scope}:not(:hover):not(.bg-sweep-active)::before,
.${scope}:not(:hover):not(.bg-sweep-active)::after,
.${scope}:not(:hover):not(.bg-sweep-active) > .bg-edge-light{
  opacity:0;transition:opacity .75s ease-in-out;
}
.${scope}::before{
  border:1px solid transparent;
  background:
    linear-gradient(${backgroundColor} 0 100%) padding-box,
    linear-gradient(transparent 0% 100%) border-box,
    ${grad("border-box")},
    linear-gradient(${baseColor} 0 100%) border-box;
  opacity:calc((var(--bg-edge-proximity) - var(--bg-color-sensitivity)) / (100 - var(--bg-color-sensitivity)));
  -webkit-mask-image:conic-gradient(from var(--bg-cursor-angle) at center,
    black calc(var(--bg-cone-spread) * 1%),
    transparent calc((var(--bg-cone-spread) + 15) * 1%),
    transparent calc((100 - var(--bg-cone-spread) - 15) * 1%),
    black calc((100 - var(--bg-cone-spread)) * 1%));
  mask-image:conic-gradient(from var(--bg-cursor-angle) at center,
    black calc(var(--bg-cone-spread) * 1%),
    transparent calc((var(--bg-cone-spread) + 15) * 1%),
    transparent calc((100 - var(--bg-cone-spread) - 15) * 1%),
    black calc((100 - var(--bg-cone-spread)) * 1%));
}
.${scope}::after{
  border:1px solid transparent;
  background:
    ${grad("padding-box")},
    linear-gradient(${baseColor} 0 100%) padding-box;
  -webkit-mask-image:
    linear-gradient(to bottom, black, black),
    radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%),
    radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%),
    radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%),
    radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%),
    radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%),
    conic-gradient(from var(--bg-cursor-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%);
  mask-image:
    linear-gradient(to bottom, black, black),
    radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%),
    radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%),
    radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%),
    radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%),
    radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%),
    conic-gradient(from var(--bg-cursor-angle) at center, transparent 5%, black 15%, black 85%, transparent 95%);
  -webkit-mask-composite:source-out, source-over, source-over, source-over, source-over, source-over;
  mask-composite:subtract, add, add, add, add, add;
  opacity:calc(var(--bg-fill-opacity) * (var(--bg-edge-proximity) - var(--bg-color-sensitivity)) / (100 - var(--bg-color-sensitivity)));
  mix-blend-mode:soft-light;
}
.${scope} > .bg-edge-light{
  inset:calc(var(--bg-glow-padding) * -1);
  pointer-events:none;z-index:1;
  -webkit-mask-image:conic-gradient(from var(--bg-cursor-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%);
  mask-image:conic-gradient(from var(--bg-cursor-angle) at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%);
  opacity:calc((var(--bg-edge-proximity) - var(--bg-edge-sensitivity)) / (100 - var(--bg-edge-sensitivity)));
  mix-blend-mode:plus-lighter;
}
.${scope} > .bg-edge-light::before{
  content:"";position:absolute;inset:var(--bg-glow-padding);border-radius:inherit;
  box-shadow:
    inset 0 0 0 1px ${glowAlpha(100)},
    inset 0 0 1px 0 ${glowAlpha(60)},
    inset 0 0 3px 0 ${glowAlpha(50)},
    inset 0 0 6px 0 ${glowAlpha(40)},
    inset 0 0 15px 0 ${glowAlpha(30)},
    inset 0 0 25px 2px ${glowAlpha(20)},
    inset 0 0 50px 2px ${glowAlpha(10)},
    0 0 1px 0 ${glowAlpha(60)},
    0 0 3px 0 ${glowAlpha(50)},
    0 0 6px 0 ${glowAlpha(40)},
    0 0 15px 0 ${glowAlpha(30)},
    0 0 25px 2px ${glowAlpha(20)},
    0 0 50px 2px ${glowAlpha(10)};
}
.${scope} > .bg-inner{
  display:flex;flex-direction:column;position:relative;overflow:auto;z-index:1;
}
`;

  return (
    <div
      {...props}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={cn(scope, "border-glow", className)}
      style={style as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <span className="bg-edge-light" aria-hidden />
      <div className="bg-inner">{children}</div>
    </div>
  );
}
