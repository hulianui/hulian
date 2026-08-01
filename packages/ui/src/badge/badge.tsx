import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { BadgePlacement, BadgeProps, BadgeTone } from "./badge.types";

// Badge = 计数 / 状态角标（区别于 Tag 状态标签 / Chip 令牌）：可独立成标，也可包裹子元素叠到角上。
// count 数字（带 max 溢出）/ dot 纯点 / content 自定义内容（如绿勾）三种形态。纯 CSS 渲染（无 hook，可 RSC）。
// 包裹模式角标带 ring-bg 描边，从宿主（图标/头像）上分离出来。仅消费语义 token，自动吃主题明暗。

/** 把计数格式化为展示文本：超过 max 显示 `max+`。导出供测试与外部复用。 */
export function formatCount(count: number, max?: number): string {
  return max != null && count > max ? `${max}+` : String(count);
}

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-surface-hover text-foreground",
  brand: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
};

const placementAnchor: Record<BadgePlacement, string> = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
};

// 各角位把角标中心拉到宿主边角上的基础位移（百分比，相对角标自身尺寸）。
const placementTranslate: Record<BadgePlacement, [number, number]> = {
  "top-right": [50, -50],
  "top-left": [-50, -50],
  "bottom-right": [50, 50],
  "bottom-left": [-50, 50],
};

export function Badge({
  count,
  max = 99,
  dot,
  content,
  showZero,
  invisible,
  tone = "danger",
  size = "md",
  placement = "top-right",
  offset,
  className,
  children,
  ...rest
}: BadgeProps) {
  const isContent = content != null;
  const isDot = !isContent && !!dot;
  const isCount = !isContent && !isDot && count != null;

  const showMark =
    !invisible && (isContent || isDot || (isCount && (count !== 0 || showZero)));

  const wrapping = children != null;

  const markSize = isDot
    ? size === "sm"
      ? "size-1.5"
      : "size-2"
    : size === "sm"
      ? "h-4 min-w-4 px-1 text-[10px]"
      : "h-5 min-w-5 px-1.5 text-[11px]";

  const markInner = isContent ? content : isCount ? formatCount(count!, max) : null;

  const markClassName = cn(
    "inline-flex items-center justify-center rounded-full font-medium leading-none tabular-nums",
    toneClass[tone],
    markSize,
  );

  // 包裹模式下用 inline transform 组合「角位基础位移 + offset 微调」，让 offset 不被 Tailwind translate 类覆盖。
  let markStyle: CSSProperties | undefined;
  if (wrapping) {
    const [tx, ty] = placementTranslate[placement];
    const ox = offset?.[0] ?? 0;
    const oy = offset?.[1] ?? 0;
    markStyle = { transform: `translate(calc(${tx}% + ${ox}px), calc(${ty}% + ${oy}px))` };
  }

  // 独立成标：角标自身就是根元素。
  if (!wrapping) {
    if (!showMark) return null;
    return (
      <span {...rest} className={cn(markClassName, className)} aria-hidden={isDot || undefined}>
        {markInner}
      </span>
    );
  }

  // 包裹模式：相对定位容器 + 绝对定位角标叠到角上。
  return (
    <span {...rest} className={cn("relative inline-flex", className)}>
      {children}
      {showMark && (
        <span
          className={cn(markClassName, "absolute z-10 ring-2 ring-bg", placementAnchor[placement])}
          style={markStyle}
          aria-hidden={isDot || undefined}
        >
          {markInner}
        </span>
      )}
    </span>
  );
}
