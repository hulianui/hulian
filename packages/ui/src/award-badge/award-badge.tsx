import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { pressableClass } from "../motion";
import { laurelLeaves, laurelStemPath } from "./laurel-geometry";
import type { AwardBadgeProps, AwardBadgeSize, AwardBadgeTone } from "./award-badge.types";

// AwardBadge = 桂冠奖章：左边桂冠圈名次，右边「小字前缀 + 粗体主标题」两行。
// 对标 GitHub Trending「#1 Repository Of The Day」/ Product Hunt「#1 Product of the Day」那类
// 贴在 README 顶部与官网首页的荣誉牌。
//
// 与 ShieldBadge 的分工：ShieldBadge 是一行元信息（版本/许可证/CI），密集、可排一排；
// AwardBadge 是**一枚**荣誉，尺寸更大、只出现一次、自带徽记——两者不要互相顶替。
//
// 桂冠是算出来的（laurel-geometry 纯函数），不是贴图：吃 currentColor 随主题/语气变色，
// 任意缩放不糊，零图片请求。纯展示零 hook（可 RSC）。

const LEAVES = laurelLeaves();
const STEM = laurelStemPath();

/** 桂冠：左枝按几何算，右枝对左枝做镜像（viewBox 宽 100，故 translate(100) scale(-1,1)）。 */
function Laurel({ className }: { className?: string }) {
  const branch = (
    <>
      <path d={STEM} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      {LEAVES.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          rx={leaf.rx}
          ry={leaf.ry}
          transform={`rotate(${leaf.rotate} ${leaf.x} ${leaf.y})`}
        />
      ))}
    </>
  );
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden>
      <g>{branch}</g>
      <g transform="translate(100 0) scale(-1 1)">{branch}</g>
    </svg>
  );
}

const toneColor: Record<AwardBadgeTone, string> = {
  brand: "var(--color-primary)",
  neutral: "var(--color-foreground)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
};

const rootSize: Record<AwardBadgeSize, string> = {
  sm: "gap-2.5 px-3 py-1.5",
  md: "gap-3 px-4 py-2.5",
  lg: "gap-3.5 px-5 py-3",
};

const emblemSize: Record<AwardBadgeSize, string> = { sm: "size-8", md: "size-10", lg: "size-12" };
const rankSize: Record<AwardBadgeSize, string> = { sm: "text-sm", md: "text-base", lg: "text-lg" };
const kickerSize: Record<AwardBadgeSize, string> = {
  sm: "text-[9px]",
  md: "text-[10px]",
  lg: "text-[11px]",
};
const titleSize: Record<AwardBadgeSize, string> = { sm: "text-xs", md: "text-base", lg: "text-lg" };

export function AwardBadge({
  title,
  kicker,
  rank,
  emblem,
  wreath = true,
  variant = "outline",
  tone = "brand",
  color,
  size = "md",
  href,
  target,
  rel,
  className,
  ...rest
}: AwardBadgeProps) {
  const accent = resolveTone(color) ?? toneColor[tone];

  // 三皮肤都把 accent 落到 color 上，桂冠 / 边框吃 currentColor 自动跟随。
  const style =
    variant === "solid"
      ? { backgroundColor: accent, borderColor: accent, color: "var(--color-primary-foreground)" }
      : variant === "soft"
        ? {
            color: accent,
            backgroundColor: `color-mix(in oklab, ${accent} 10%, transparent)`,
            borderColor: `color-mix(in oklab, ${accent} 24%, transparent)`,
          }
        : { color: accent, borderColor: accent };

  const emblemNode = (emblem != null || wreath || rank != null) && (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", emblemSize[size])}
      aria-hidden
    >
      {emblem ?? (
        <>
          {wreath && <Laurel className="absolute inset-0 size-full" />}
          {rank != null && (
            <span className={cn("relative font-bold leading-none tabular-nums", rankSize[size])}>
              {rank}
            </span>
          )}
        </>
      )}
    </span>
  );

  const rootClass = cn(
    "inline-flex items-center rounded-[var(--radius)] border-2 text-left align-middle",
    rootSize[size],
    href &&
      cn(
        "outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressableClass,
      ),
    className,
  );

  const content = (
    <>
      {emblemNode}
      <span className="flex min-w-0 flex-col gap-0.5">
        {kicker != null && (
          <span className={cn("font-semibold uppercase tracking-[0.14em] opacity-70", kickerSize[size])}>
            {kicker}
          </span>
        )}
        <span className={cn("font-bold leading-tight", titleSize[size])}>{title}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
        className={rootClass}
        style={style}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={rootClass} style={style} {...rest}>
      {content}
    </span>
  );
}
