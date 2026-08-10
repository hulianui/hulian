import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { pressableClass } from "../motion";
import type {
  ShieldBadgeGroupProps,
  ShieldBadgeProps,
  ShieldBadgeSize,
  ShieldBadgeShape,
  ShieldBadgeTone,
  ShieldBadgeVariant,
} from "./shield-badge.types";

// ShieldBadge = README 徽章（shields.io 风格的「左灰标签 + 右彩数值」双段贴纸）。
// 区别于库内三个近邻：Badge 是计数角标、Tag 是状态标签、Chip 是可操作令牌——
// 本组件的语义是「一条项目元信息（版本/许可证/下载量/CI 状态/星标）」，双段结构就是它的辨识度。
//
// 为什么不直接 <img src="https://img.shields.io/...">：远程图片不吃主题、暗色下发白、
// 首屏多一轮网络往返，且文档站门禁禁远程资源。这里用纯 CSS 渲染，明暗自动切、可选中复制、可缩放不糊。
// 纯展示零 hook（可 RSC），不联网取数——数值由调用方给（配 compactCount 格式化）。

const UNITS = [
  { limit: 1e12, suffix: "T" },
  { limit: 1e9, suffix: "B" },
  { limit: 1e6, suffix: "M" },
  { limit: 1e3, suffix: "k" },
] as const;

/**
 * 把星标数 / 下载量压成徽章里的紧凑写法：`999` / `1.5k` / `12k` / `3.4M`。
 * ≥10 的档取整（12k 而非 12.3k），<10 保留 digits 位并去掉末尾 0。
 *
 * 刻意不用 `Intl.NumberFormat(notation:"compact")`：它跟随 locale，zh-CN 下会输出「1.5万」，
 * 而 README 徽章是面向全球读者的固定写法。导出为纯函数便于单测与在徽章外复用。
 */
export function compactCount(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const n = Math.abs(value);

  for (let i = 0; i < UNITS.length; i++) {
    const { limit, suffix } = UNITS[i];
    if (n < limit) continue;
    const scaled = n / limit;
    const num = scaled >= 10 ? Math.round(scaled) : Number(scaled.toFixed(digits));
    // 进位兜底：999_999 / 1e3 = 999.999 → 四舍五入成 1000，须升到上一级单位写成 1M。
    if (num >= 1000 && i > 0) return `${sign}${num / 1000}${UNITS[i - 1].suffix}`;
    return `${sign}${num}${suffix}`;
  }
  return `${sign}${Math.round(n)}`;
}

const sizeClass: Record<ShieldBadgeSize, string> = {
  sm: "h-5 text-[11px]",
  md: "h-6 text-xs",
};

const segPad: Record<ShieldBadgeSize, string> = {
  sm: "gap-1 px-1.5",
  md: "gap-1.5 px-2",
};

const iconSize: Record<ShieldBadgeSize, string> = { sm: "size-3", md: "size-3.5" };

const shapeClass: Record<ShieldBadgeShape, string> = {
  rounded: "rounded-[calc(var(--radius)-0.25rem)]",
  square: "rounded-none",
  pill: "rounded-full",
};

// 左段（标签）皮肤。solid 用 --color-muted-foreground 实底：亮色是 gray-600（正好是 shields 的深灰观感），
// 暗色是 gray-400，配 text-bg 两态都是高对比——不写死灰值，跟着主题走。
const labelClass: Record<ShieldBadgeVariant, string> = {
  solid: "bg-muted-foreground text-bg",
  soft: "bg-surface-hover text-muted-foreground",
  outline: "text-muted-foreground",
};

// 右段（数值）皮肤 × 5 语气。
const valueClass: Record<ShieldBadgeVariant, Record<ShieldBadgeTone, string>> = {
  solid: {
    // neutral 是「没有状态色」的档，要比五色都平静：对齐 Tag 的 solid neutral，
    // 与左段 bg-muted-foreground 在明暗两态都拉得开（亮 gray-100 vs gray-600 / 暗 gray-800 vs gray-400）。
    // 别用 bg-foreground——暗色下会变成一块比彩色语气还刺眼的纯白。
    neutral: "bg-surface-hover text-foreground",
    brand: "bg-primary text-primary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  },
  soft: {
    neutral: "bg-surface text-foreground",
    brand: "bg-primary/12 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/12 text-warning",
    danger: "bg-danger/12 text-danger",
  },
  outline: {
    neutral: "text-foreground",
    brand: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  },
};

export function ShieldBadge({
  label,
  value,
  icon,
  tone = "brand",
  color,
  variant = "solid",
  size = "md",
  shape = "rounded",
  href,
  target,
  rel,
  className,
  ...rest
}: ShieldBadgeProps) {
  const hasLabel = label != null;
  const custom = resolveTone(color);

  // 自定义色逃生舱：三种皮肤各自的着色位置不同（实底/12% 柔填/纯文字）。
  const customStyle = custom
    ? variant === "solid"
      ? { backgroundColor: custom, color: "var(--color-primary-foreground)" }
      : variant === "soft"
        ? { backgroundColor: `color-mix(in oklab, ${custom} 12%, transparent)`, color: custom }
        : { color: custom }
    : undefined;

  const iconNode = icon != null && (
    <span className={cn("inline-flex shrink-0 items-center [&_svg]:size-full", iconSize[size])} aria-hidden>
      {icon}
    </span>
  );

  const labelSeg = hasLabel && (
    <span className={cn("inline-flex items-center", segPad[size], labelClass[variant])}>
      {iconNode}
      {label}
    </span>
  );

  const valueSeg = (
    <span
      className={cn(
        "inline-flex items-center font-semibold tabular-nums",
        segPad[size],
        !custom && valueClass[variant][tone],
        // soft / outline 两段同底色时靠分隔线读出「双段」结构；solid 靠色差自然分段。
        hasLabel && variant !== "solid" && "border-l border-border",
      )}
      style={customStyle}
    >
      {!hasLabel && iconNode}
      {value}
    </span>
  );

  const rootClass = cn(
    "inline-flex max-w-full items-stretch overflow-hidden whitespace-nowrap align-middle font-medium leading-none",
    sizeClass[size],
    shapeClass[shape],
    variant === "outline" && "border border-border",
    href &&
      cn(
        "outline-none hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        pressableClass,
      ),
    className,
  );

  const content = (
    <>
      {labelSeg}
      {valueSeg}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
        className={rootClass}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={rootClass} {...rest}>
      {content}
    </span>
  );
}

/** 徽章行容器：README 顶部那一排徽章，窄屏自动换行。 */
export function ShieldBadgeGroup({ gap = "sm", className, children, ...rest }: ShieldBadgeGroupProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center", gap === "md" ? "gap-2.5" : "gap-1.5", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
