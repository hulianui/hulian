import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { ChevronRight } from "../_icons";
import {
  BUTTON_SIZE_CLASS,
  EFFECT_BUTTON_BASE_CLASS,
  renderAsElement,
} from "../button/button-base";
import type { InteractiveHoverButtonProps } from "./interactive-hover-button.types";

// 展开圆的**圆心**：等于静息层那颗圆点的中心 = 该档的水平内距 + 圆点半径（4px）。
// 三档内距不同（px-3 / px-4 / px-6），写死一个值只有 md 对得上，另两档的展开会从
// 圆点旁边冒出来。这是与上游那个 scale 魔数同一类的错，只是更隐蔽。
const DOT_ORIGIN: Record<string, string> = {
  sm: "1rem", // px-3(12px) + 4px
  md: "1.25rem", // px-4(16px) + 4px
  lg: "1.75rem", // px-6(24px) + 4px
};

// 吸取自 magicui.design Interactive Hover Button：静息是「小圆点 + 文案」，悬停时圆点扩成
// 整块底色，文案换成「文案 + 箭头」。落地页主 CTA 用。
//
// 瑚琏化最实质的一处是**换掉扩张的实现**。上游是把那颗 2px 的圆点 `scale(100.8)` 放大 ——
// 那是个按某个按钮宽度反推出来的魔数：按钮再宽一点（长文案、中文两行、lg 档）圆就盖不满，
// 边角露出静息底色，而且是**静默**的，只有实机看才发现。
//
// 这里改用 clip-path 的圆形裁切：`circle(150% at …)` 里的百分比按参照框的对角线解析，
// 所以「150%」对任何宽度都必然盖满，同时 clip-path 本身可过渡、只在合成层跑。
export const InteractiveHoverButton = forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(function InteractiveHoverButton(
  {
    background = "var(--color-primary)",
    foreground = "var(--color-primary-foreground)",
    dotColor,
    duration = "0.4s",
    icon,
    size = "md",
    className,
    children,
    style,
    render,
    ...props
  },
  ref,
) {
  const mergedStyle = {
    "--hulian-ihb-bg": background,
    "--hulian-ihb-fg": foreground,
    "--hulian-ihb-dot": dotColor ?? background,
    "--hulian-ihb-duration": duration,
    "--hulian-ihb-origin": DOT_ORIGIN[size] ?? DOT_ORIGIN.md,
    ...style,
  } as CSSProperties;

  // 共享 Button 的排布 / 尺寸 / 焦点环 / 禁用态；配色与圆角是自己的（胶囊 + 自绘底）。
  const mergedClassName = cn(
    EFFECT_BUTTON_BASE_CLASS,
    BUTTON_SIZE_CLASS[size],
    "group relative isolate cursor-pointer overflow-hidden rounded-full border border-border bg-surface text-foreground",
    className,
  );

  const inner = (
    <>
      {/* 静息层：小圆点 + 文案。它承载可访问名，所以不加 aria-hidden。 */}
      <span className="inline-flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full [background:var(--hulian-ihb-dot)]" />
        {children}
      </span>
      {/* 悬停层：整块底色 + 文案 + 箭头，圆形裁切从小圆点的位置扩开。
          文案在这里是第二份副本，故整层 aria-hidden —— 否则读屏把按钮名念两遍。
          焦点态与悬停同步展开：键盘用户看不到 hover，没有这条就只剩一个焦点环。 */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 inline-flex items-center justify-center gap-2",
          "[background:var(--hulian-ihb-bg)] [color:var(--hulian-ihb-fg)]",
          // 圆心咬住静息层那颗圆点的位置，于是视觉上就是「点长大了」。
          "[clip-path:circle(0.25rem_at_var(--hulian-ihb-origin)_50%)]",
          "group-hover:[clip-path:circle(150%_at_var(--hulian-ihb-origin)_50%)]",
          "group-focus-visible:[clip-path:circle(150%_at_var(--hulian-ihb-origin)_50%)]",
          "transition-[clip-path] duration-[var(--hulian-ihb-duration)] ease-out motion-reduce:transition-none",
        )}
      >
        {children}
        {icon === undefined ? <ChevronRight className="size-4 shrink-0" /> : icon}
      </span>
    </>
  );

  if (render) return renderAsElement(render, { ...props, ref }, mergedClassName, mergedStyle, inner);

  return (
    <button ref={ref} style={mergedStyle} className={mergedClassName} {...props}>
      {inner}
    </button>
  );
});
