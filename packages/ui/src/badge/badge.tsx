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

/**
 * 语义面配色（`variant="themed"`）：跟着主题走，与按钮 / 警示条同一套口径。
 */
const themedToneClass: Record<BadgeTone, string> = {
  neutral: "bg-surface-hover text-foreground",
  brand: "bg-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
};

/**
 * 信号色配色（`variant="signal"`，默认）：明暗两个主题下都是同一个实心色 + 白字（#295）。
 *
 * 为什么角标不该跟主题走：暗色下 `--color-danger` 会抬亮到 400 档（#fc5855），于是配套的
 * `-foreground` 必须翻成近黑才够对比 —— 落到角标上就是「红底黑字」，与所有人对通知红的
 * 肌肉记忆相反（Ant Design / MUI 的角标两个主题都是红底白字）。角标是**极小的实心标记**，
 * 颜色本身就是语义，不是一块要融进主题的语义面。
 *
 * 走 `var(--color-signal-*, <旧语义色>)` 而不是直接写 `bg-signal-danger`：这一族令牌是
 * `@hulianui/tokens` 0.10.0 才有的，而 tokens 与 ui 是两条独立版本线、消费方分别安装。
 * 直接用工具类的话，装了新 ui 却没升 tokens 的消费方会拿到一个 Tailwind 根本没生成的类 ——
 * 角标底色变透明、白字落在白底上直接消失，而且不报错。有兜底则退化成升级前的表现。
 * 待 tokens 下界能被强制之后可以简化成 `bg-signal-danger text-signal-danger-foreground`。
 */
const signalToneClass: Record<BadgeTone, string> = {
  // neutral 没有信号色：它本来就是「中性计数」而不是警示标记，两档一致地跟随主题
  neutral: "bg-surface-hover text-foreground",
  brand:
    "bg-[color:var(--color-signal-brand,var(--color-primary))] text-[color:var(--color-signal-brand-foreground,var(--color-primary-foreground))]",
  success:
    "bg-[color:var(--color-signal-success,var(--color-success))] text-[color:var(--color-signal-success-foreground,var(--color-success-foreground))]",
  warning:
    "bg-[color:var(--color-signal-warning,var(--color-warning))] text-[color:var(--color-signal-warning-foreground,var(--color-warning-foreground))]",
  danger:
    "bg-[color:var(--color-signal-danger,var(--color-danger))] text-[color:var(--color-signal-danger-foreground,var(--color-danger-foreground))]",
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
  variant = "signal",
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
    (variant === "signal" ? signalToneClass : themedToneClass)[tone],
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
