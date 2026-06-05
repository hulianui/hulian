"use client";
import { useCallback, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { MagicBentoItem, MagicBentoProps } from "./magic-bento.types";

// 吸取自 React Bits MagicBento：一组 bento 卡片网格，光标在网格上移动时卡片内部浮现径向聚光、
// 描边随光标接近而点亮、可选 3D 倾斜，营造「魔法便当」交互背景。
// 瑚琏化要点：
// 1. 去 gsap：原版用 gsap 时间线 + DOM 注入粒子；这里改为纯 CSS 变量 + 指针事件直接写 transform，零运行时依赖。
// 2. 光晕/描边/倾斜全走 CSS 变量（--hl-mb-*），指针移动只更新变量，不触发 React re-render（性能）。
// 3. 颜色吃 token：默认 glowColor=var(--color-primary)，卡片底/边/文字走 bg-surface/border-border/text-foreground，自动明暗适配。
// 4. reduced-motion：useReducedMotion() 或 disableAnimations 时不绑定指针交互，DOM 结构保持一致（卡片静态可见）。
// 5. 关键帧 hulian-magic-bento（描边光呼吸）落 preset.css，inline 引用并带 motion-reduce:[animation:none]。

const DEFAULT_ITEMS: MagicBentoItem[] = [
  { label: "Insights", title: "Analytics", description: "追踪用户行为", colSpan: 2 },
  { label: "Overview", title: "Dashboard", description: "集中式数据视图" },
  { label: "Teamwork", title: "Collaboration", description: "无缝协作" },
  { label: "Efficiency", title: "Automation", description: "精简工作流" },
  { label: "Connectivity", title: "Integration", description: "连接常用工具" },
  { label: "Protection", title: "Security", description: "企业级防护", colSpan: 2 },
];

const TILT_MAX = 8; // 倾斜最大角度（度）

interface CardStyle extends CSSProperties {
  "--hl-mb-glow"?: string;
  "--hl-mb-radius"?: string;
  gridColumn?: string;
  gridRow?: string;
}

export function MagicBento({
  items = DEFAULT_ITEMS,
  columns = 4,
  glowColor = "var(--color-primary)",
  spotlightRadius = 280,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = false,
  disableAnimations = false,
  className,
  style,
}: MagicBentoProps) {
  const reduceMotion = useReducedMotion();
  // 交互在 reduced-motion / disableAnimations 时整体禁用；DOM 不变，仅卡片保持静态。
  const interactive = !disableAnimations && !reduceMotion;

  // 指针移动：直接写 CSS 变量到当前卡片，不走 state，避免高频 re-render。
  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (enableSpotlight) {
        el.style.setProperty("--hl-mb-x", `${(x / rect.width) * 100}%`);
        el.style.setProperty("--hl-mb-y", `${(y / rect.height) * 100}%`);
        el.style.setProperty("--hl-mb-glow-intensity", "1");
      }

      if (enableTilt) {
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -TILT_MAX;
        const rotateY = ((x - cx) / cx) * TILT_MAX;
        el.style.setProperty(
          "--hl-mb-tilt",
          `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
        );
      }
    },
    [interactive, enableSpotlight, enableTilt],
  );

  const handlePointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      el.style.setProperty("--hl-mb-glow-intensity", "0");
      el.style.setProperty("--hl-mb-tilt", "perspective(900px) rotateX(0deg) rotateY(0deg)");
    },
    [],
  );

  return (
    <div
      className={cn("grid w-full gap-3", className)}
      style={
        {
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, i) => {
        const cardStyle: CardStyle = {
          "--hl-mb-glow": glowColor,
          "--hl-mb-radius": `${spotlightRadius}px`,
          gridColumn: item.colSpan ? `span ${item.colSpan}` : undefined,
          gridRow: item.rowSpan ? `span ${item.rowSpan}` : undefined,
          transform: "var(--hl-mb-tilt)",
        };

        return (
          <div
            key={i}
            data-magic-bento-card=""
            onPointerMove={interactive ? handlePointerMove : undefined}
            onPointerLeave={interactive ? handlePointerLeave : undefined}
            style={cardStyle}
            className={cn(
              "group relative isolate flex min-h-32 flex-col justify-between overflow-hidden rounded-xl",
              "border border-border bg-surface p-5 transition-transform duration-150 ease-out",
              // 描边光：呼吸关键帧，仅 hover 时点亮（border-glow 开关控制不透明度）
              enableBorderGlow &&
                "[animation:hulian-magic-bento_4s_ease-in-out_infinite] motion-reduce:[animation:none]",
            )}
          >
            {/* 径向聚光层：吃 --hl-mb-* 变量，跟随光标定位；强度变量 hover→1 离开→0。 */}
            {enableSpotlight && (
              <div
                aria-hidden
                data-magic-bento-spotlight=""
                className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300"
                style={{
                  opacity: "var(--hl-mb-glow-intensity, 0)",
                  background:
                    "radial-gradient(var(--hl-mb-radius,280px) circle at var(--hl-mb-x,50%) var(--hl-mb-y,50%), color-mix(in oklch, var(--hl-mb-glow) 22%, transparent), transparent 70%)",
                }}
              />
            )}
            {/* 描边光层：贴边一圈淡光，hover 时通过强度变量提亮。 */}
            {enableBorderGlow && (
              <div
                aria-hidden
                data-magic-bento-border=""
                className="pointer-events-none absolute inset-0 -z-10 rounded-xl transition-opacity duration-300"
                style={{
                  opacity: "var(--hl-mb-glow-intensity, 0)",
                  boxShadow:
                    "inset 0 0 0 1px color-mix(in oklch, var(--hl-mb-glow) 45%, transparent)",
                }}
              />
            )}

            {item.children ?? (
              <>
                {item.label != null && (
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">
                    {item.label}
                  </div>
                )}
                <div className="mt-auto">
                  {item.title != null && (
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  )}
                  {item.description != null && (
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
