"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { CrosshairProps } from "./crosshair.types";

// 吸取自 React Bits Crosshair：鼠标跟随的全屏/容器准星十字线，lerp 平滑拖尾，
// 进入时一次抖动脉冲（原作用 SVG feTurbulence 噪声位移 + gsap 时间线在 link hover 触发）。
// 瑚琏化：
// 1. 去 gsap / 去 SVG feTurbulence —— 跟随用裸 requestAnimationFrame 做 lerp 插值（零依赖）；
//    「抖动」重构为零依赖 CSS 脉冲关键帧 hulian-crosshair（落 preset.css）。脉冲只动
//    filter(blur+brightness)，不碰 transform —— transform 被 RAF 每帧接管做平移，二者互不打架。
// 2. 颜色吃 token：默认 var(--color-primary)，自动明暗适配，替原作写死的 "white"。
// 3. 不再依赖外部 containerRef + 全屏 fixed —— 组件自渲染一个 absolute inset-0 铺满父级的
//    定位层，指针坐标相对自身 bounding box 计算，超出边界淡出，更适合卡片/区块内嵌。
// 4. reduced-motion：useReducedMotion 关掉脉冲，跟随仍保留（DOM 不变，仅停动画）。
// 5. "use client"（需 ref / 事件 / RAF）；十字线层 aria-hidden + pointer-events-none，不挡交互。
export function Crosshair({
  color = "var(--color-primary)",
  smoothing = 0.15,
  thickness = 1,
  pulseOnEnter = true,
  className,
  style,
}: CrosshairProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineXRef = useRef<HTMLDivElement>(null); // 竖线（动 X）
  const lineYRef = useRef<HTMLDivElement>(null); // 横线（动 Y）
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  // 目标坐标 + 已插值坐标存 ref，避免每帧 setState 触发重渲染（高频指针事件）。
  const target = useRef({ x: 0, y: 0 });
  const rendered = useRef({ x: 0, y: 0 });
  const seeded = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const amt = Math.min(Math.max(smoothing, 0.01), 1);

    const render = () => {
      rendered.current.x += (target.current.x - rendered.current.x) * amt;
      rendered.current.y += (target.current.y - rendered.current.y) * amt;
      const ly = lineYRef.current;
      const lx = lineXRef.current;
      if (ly) ly.style.transform = `translateY(${rendered.current.y}px)`;
      if (lx) lx.style.transform = `translateX(${rendered.current.x}px)`;
      rafRef.current = requestAnimationFrame(render);
    };

    const handleMove = (ev: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      const x = ev.clientX - bounds.left;
      const y = ev.clientY - bounds.top;
      const inside =
        ev.clientX >= bounds.left &&
        ev.clientX <= bounds.right &&
        ev.clientY >= bounds.top &&
        ev.clientY <= bounds.bottom;
      target.current.x = x;
      target.current.y = y;
      // 首次进入：把 rendered 跳到目标，避免从 (0,0) 长拖尾。
      if (!seeded.current && inside) {
        rendered.current.x = x;
        rendered.current.y = y;
        seeded.current = true;
      }
      setVisible(inside);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [smoothing]);

  const lineColor = color;
  const pulse =
    pulseOnEnter && !reduceMotion && visible
      ? "[animation:hulian-crosshair_0.5s_ease-out]"
      : undefined;

  return (
    <div
      aria-hidden
      ref={rootRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={style}
    >
      {/* 横线：满宽，1px 高，沿 Y 平移 */}
      <div
        ref={lineYRef}
        className={cn(
          "absolute left-0 top-0 w-full will-change-transform",
          "transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
          pulse,
        )}
        style={
          {
            height: `${thickness}px`,
            background: lineColor,
          } as CSSProperties
        }
      />
      {/* 竖线：满高，1px 宽，沿 X 平移 */}
      <div
        ref={lineXRef}
        className={cn(
          "absolute left-0 top-0 h-full will-change-transform",
          "transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
          pulse,
        )}
        style={
          {
            width: `${thickness}px`,
            background: lineColor,
          } as CSSProperties
        }
      />
    </div>
  );
}
