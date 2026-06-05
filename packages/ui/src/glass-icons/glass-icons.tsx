import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { GlassIconItem, GlassIconsProps } from "./glass-icons.types";

// 吸取自 React Bits GlassIcons：玻璃拟态图标按钮——背面一块 3D 旋转的彩色发光板 + 前面磨砂玻璃片（backdrop-blur + inset 高光边），
// hover/focus 时彩板抬升旋转、玻璃片向前推、标签滑出。
// 瑚琏化：去掉外部 .css，纯 Tailwind v4 token 类（chart/primary 配色随明暗主题，玻璃用 white/foreground token）；
// 配色预设映射到 var(--color-*)（带前缀方可解析）；纯 CSS transition（RSC 安全，无 "use client"）；
// reduced-motion 走 motion-reduce 停 transition，DOM 不变；语义 <button> + aria-label。

/** 预设语义色 → 瑚琏 token 渐变（带 --color- 前缀方可在 Tailwind v4 解析） */
const PRESET_GRADIENTS: Record<string, string> = {
  primary:
    "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 70%, black))",
  blue: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-2))",
  purple: "linear-gradient(135deg, var(--color-chart-4), var(--color-chart-5))",
  indigo: "linear-gradient(135deg, var(--color-chart-2), var(--color-chart-4))",
  green: "linear-gradient(135deg, var(--color-chart-2), var(--color-chart-3))",
  orange: "linear-gradient(135deg, var(--color-chart-3), var(--color-chart-1))",
  red: "linear-gradient(135deg, var(--color-chart-5), var(--color-chart-3))",
};

function backStyle(color: string | undefined): CSSProperties {
  const key = color ?? "primary";
  const preset = PRESET_GRADIENTS[key];
  return { background: preset ?? key };
}

export function GlassIcons({
  items,
  columns = 3,
  className,
  style,
  ...props
}: GlassIconsProps) {
  return (
    <div
      {...props}
      style={{ "--hulian-glass-cols": columns, ...style } as CSSProperties}
      className={cn(
        "grid gap-10 [grid-template-columns:repeat(2,minmax(0,1fr))]",
        "md:[grid-template-columns:repeat(var(--hulian-glass-cols),minmax(0,1fr))]",
        className,
      )}
    >
      {items.map((item: GlassIconItem, index) => (
        <button
          key={index}
          type="button"
          aria-label={item.label}
          onClick={item.onClick}
          className={cn(
            "group relative h-[4.5em] w-[4.5em] cursor-pointer border-none bg-transparent outline-none",
            "[perspective:24em] [transform-style:preserve-3d]",
            item.className,
          )}
        >
          {/* 背面彩色发光板：3D 旋转，hover/focus 抬升 */}
          <span
            aria-hidden="true"
            style={backStyle(item.color)}
            className={cn(
              "absolute inset-0 block rounded-[1.25em] [transform:rotate(15deg)] [transform-origin:100%_100%]",
              "shadow-lg [will-change:transform]",
              "transition-transform duration-300 ease-[cubic-bezier(0.83,0,0.17,1)]",
              "group-hover:[transform:rotate(25deg)_translate3d(-0.4em,-0.4em,0.5em)]",
              "group-focus-visible:[transform:rotate(25deg)_translate3d(-0.4em,-0.4em,0.5em)]",
              "motion-reduce:transition-none motion-reduce:group-hover:[transform:rotate(15deg)] motion-reduce:group-focus-visible:[transform:rotate(15deg)]",
            )}
          />
          {/* 前面磨砂玻璃片 */}
          <span
            className={cn(
              "absolute inset-0 flex rounded-[1.25em]",
              "bg-white/15 [box-shadow:0_0_0_0.1em_var(--color-hairline)_inset] [backdrop-filter:blur(0.75em)]",
              "[transform-origin:80%_50%] [will-change:transform]",
              "transition-transform duration-300 ease-[cubic-bezier(0.83,0,0.17,1)]",
              "group-hover:[transform:translate3d(0,0,2em)] group-focus-visible:[transform:translate3d(0,0,2em)]",
              "motion-reduce:transition-none motion-reduce:group-hover:[transform:none] motion-reduce:group-focus-visible:[transform:none]",
            )}
          >
            <span className="m-auto flex h-6 w-6 items-center justify-center text-foreground">
              {item.icon}
            </span>
          </span>
          {/* 标签：默认隐藏，hover/focus 滑出 */}
          <span
            className={cn(
              "absolute inset-x-0 top-full whitespace-nowrap text-center text-sm leading-8 text-foreground",
              "opacity-0 [transform:translateY(0)]",
              "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)]",
              "group-hover:opacity-100 group-hover:[transform:translateY(20%)]",
              "group-focus-visible:opacity-100 group-focus-visible:[transform:translateY(20%)]",
              "motion-reduce:transition-none",
            )}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
