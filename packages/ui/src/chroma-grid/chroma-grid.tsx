"use client";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import type { ChromaGridItem, ChromaGridProps } from "./chroma-grid.types";

// 吸取自 React Bits ChromaGrid：一格卡片墙默认整体灰度暗化，光标周围以径向 mask
// 「揭示」出全彩窗口，跟随光标弹性移动；单卡 hover 另叠一道径向高光。
//
// 瑚琏化要点：
// 1. 去 gsap —— 光标阻尼跟随改用 motion 的 useSpring（damping → 弹簧刚度映射），
//    每帧只写 --x/--y CSS 变量驱动 mask，零逐帧重绘。
// 2. 颜色全吃 token —— 描边/渐变默认取 var(--color-chart-1..5)，替原始写死的品牌 hex。
// 3. reduced-motion：useReducedMotion 命中时光标直接吸附（spring 退化为即时），
//    且揭示窗淡入淡出不做动画；DOM 在两态下完全一致。
// 4. "use client"（用 ref/effect/pointer + motion value）。
// 5. 关键帧 hulian-chroma-grid 仅用于无 children 占位 demo 的卡片轻微入场（落 preset.css）。

const DEFAULT_DEMO_STYLE: Array<Omit<ChromaGridItem, "title" | "subtitle">> = [
  {
    handle: "@linyu",
    borderColor: "var(--color-chart-1)",
    gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
  },
  {
    handle: "@chenmo",
    borderColor: "var(--color-chart-2)",
    gradient: "linear-gradient(210deg, var(--color-chart-2), transparent)",
  },
  {
    handle: "@suli",
    borderColor: "var(--color-chart-3)",
    gradient: "linear-gradient(165deg, var(--color-chart-3), transparent)",
  },
  {
    handle: "@zhouye",
    borderColor: "var(--color-chart-4)",
    gradient: "linear-gradient(195deg, var(--color-chart-4), transparent)",
  },
  {
    handle: "@jinxi",
    borderColor: "var(--color-chart-5)",
    gradient: "linear-gradient(225deg, var(--color-chart-5), transparent)",
  },
  {
    handle: "@tangyan",
    borderColor: "var(--color-chart-1)",
    gradient: "linear-gradient(135deg, var(--color-chart-1), transparent)",
  },
];

// 常驻揭示 mask：中心透明（露出全彩）→ 外环渐黑（始终盖住光标圈外区域）。
const OVERLAY_MASK =
  "radial-gradient(circle var(--hl-chroma-r) at var(--x) var(--y)," +
  "transparent 0%,transparent 15%,rgba(0,0,0,0.1) 30%,rgba(0,0,0,0.22) 45%," +
  "rgba(0,0,0,0.35) 60%,rgba(0,0,0,0.5) 75%,rgba(0,0,0,0.68) 88%,#000 100%)";

// 反向淡出 mask：中心实色（盖住中部）→ 外环渐透。整层 opacity 随 revealed 切换：
// 离开时 opacity=1（连中部也灰度暗化），命中时淡出为 0（中部透出全彩揭示窗）。
const FADE_MASK =
  "radial-gradient(circle var(--hl-chroma-r) at var(--x) var(--y)," +
  "#fff 0%,#fff 15%,rgba(255,255,255,0.9) 30%,rgba(255,255,255,0.78) 45%," +
  "rgba(255,255,255,0.65) 60%,rgba(255,255,255,0.5) 75%,rgba(255,255,255,0.32) 88%,transparent 100%)";

export function ChromaGrid({
  items,
  radius = 300,
  columns = 3,
  damping = 0.45,
  fadeOut = 0.6,
  className,
  style,
}: ChromaGridProps) {
  const locale = useComponentLocale().chromaGrid ?? zhCN.components!.chromaGrid!;
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const data = items?.length
    ? items
    : DEFAULT_DEMO_STYLE.map((item, index) => ({ ...item, ...locale.demo[index] }));

  // damping(0~1) 映射到弹簧刚度：越大越黏（刚度低）。reduce 时刚度极高=即时吸附。
  const stiffness = reduce ? 1000 : Math.max(40, 320 * (1 - Math.min(0.95, damping)));
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness, damping: 40 });
  const sy = useSpring(y, { stiffness, damping: 40 });

  // 揭示窗淡入/淡出由 overlay opacity 控制（光标在内=1，离开=0）。
  const [revealed, setRevealed] = useState(false);

  // 把弹簧值写到根节点的 --x/--y（不经 React 重渲，纯命令式）。
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const write = () => {
      el.style.setProperty("--x", `${sx.get()}px`);
      el.style.setProperty("--y", `${sy.get()}px`);
    };
    write();
    const u1 = sx.on("change", write);
    const u2 = sy.on("change", write);
    return () => {
      u1();
      u2();
    };
  }, [sx, sy]);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = rootRef.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
    setRevealed(true);
  };

  const handleLeave = () => setRevealed(false);

  const handleCardMove = (e: PointerEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleCardActivate = (url?: string) => {
    if (url && typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative mx-auto grid w-full max-w-5xl justify-center gap-3 p-4",
        className,
      )}
      style={
        {
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          "--hl-chroma-r": `${radius}px`,
          "--x": "50%",
          "--y": "50%",
          ...style,
        } as CSSProperties
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((c, i) => {
        const clickable = !!c.url;
        return (
          <article
            key={i}
            data-chroma-card=""
            onPointerMove={handleCardMove}
            onClick={() => handleCardActivate(c.url)}
            onKeyDown={(e) => {
              if (clickable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleCardActivate(c.url);
              }
            }}
            role={clickable ? "link" : undefined}
            tabIndex={clickable ? 0 : undefined}
            className={cn(
              "group/card relative flex flex-col overflow-hidden rounded-2xl border border-border",
              "transition-colors duration-300 hover:border-[var(--card-border)]",
              clickable ? "cursor-pointer" : "cursor-default",
              !c.children && i < 6 && "[animation:hulian-chroma-grid_0.5s_ease-out_backwards] motion-reduce:[animation:none]",
            )}
            style={
              {
                background: c.gradient ?? "var(--color-surface)",
                "--card-border": c.borderColor ?? "transparent",
                animationDelay: `${i * 60}ms`,
              } as CSSProperties
            }
          >
            {/* 单卡 hover 高光层：跟随卡内光标位置的径向白光 */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 z-[2] opacity-0",
                "transition-opacity duration-500 group-hover/card:opacity-100",
                "[background:radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.28),transparent_70%)]",
              )}
            />
            {c.children ?? (
              <>
                {c.image != null && (
                  <div className="relative z-[1] flex-1 p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.title ?? ""}
                      loading="lazy"
                      className="block h-full w-full rounded-xl object-cover"
                    />
                  </div>
                )}
                <footer className="relative z-[1] grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3 text-foreground">
                  {(c.title != null || c.handle != null) && (
                    <>
                      <h3 className="text-sm font-semibold leading-tight">{c.title}</h3>
                      {c.handle != null && (
                        <span className="text-xs text-muted">{c.handle}</span>
                      )}
                    </>
                  )}
                  {(c.subtitle != null || c.location != null) && (
                    <>
                      <p className="text-xs text-muted">{c.subtitle}</p>
                      {c.location != null && (
                        <span className="text-xs text-muted">{c.location}</span>
                      )}
                    </>
                  )}
                </footer>
              </>
            )}
          </article>
        );
      })}

      {/* 常驻揭示遮罩：把光标圈外区域灰度暗化（中心透明，露出全彩窗口）。 */}
      <div
        aria-hidden
        data-chroma-overlay=""
        className={cn(
          "pointer-events-none absolute inset-0 z-[3] rounded-2xl",
          "[backdrop-filter:grayscale(1)_brightness(0.78)] [-webkit-backdrop-filter:grayscale(1)_brightness(0.78)]",
        )}
        style={{ maskImage: OVERLAY_MASK, WebkitMaskImage: OVERLAY_MASK }}
      />
      {/* 淡出遮罩：离开时整片暗化（含中部），命中时淡出 0 透出揭示窗。 */}
      <div
        aria-hidden
        data-chroma-fade=""
        className={cn(
          "pointer-events-none absolute inset-0 z-[4] rounded-2xl",
          "[backdrop-filter:grayscale(1)_brightness(0.78)] [-webkit-backdrop-filter:grayscale(1)_brightness(0.78)]",
        )}
        style={{
          maskImage: FADE_MASK,
          WebkitMaskImage: FADE_MASK,
          opacity: revealed ? 0 : 1,
          transition: reduce ? "none" : `opacity ${revealed ? 0.25 : fadeOut}s ease`,
        }}
      />
    </div>
  );
}
