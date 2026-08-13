"use client";
import { forwardRef, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import {
  BUTTON_SIZE_CLASS,
  EFFECT_BUTTON_BASE_CLASS,
  renderAsElement,
} from "../button/button-base";
import type {
  RippleButtonProps,
  RippleButtonTone,
  RippleButtonVariant,
} from "./ripple-button.types";

// 吸取自 magicui.design Ripple Button：点击落点扩散水波纹（Material 风），动画结束自移除。
// 瑚琏化：配色跟随 variant/tone；关键帧 hulian-button-ripple 落 preset.css；
// reduced-motion 下波纹 hidden（无意义动画直接不显）。状态驱动 → 必 "use client"。
// 关键：波纹 span 基础样式必须内联 transform: scale(0) —— 共享关键帧只有 to { scale(4); opacity: 0 }，
// 隐式 from 取元素当前样式；缺 scale(0) 时波纹出生即整钮大小的均匀白罩（无扩散边缘），视觉上等于"没有波纹"。
// 不可用 Tailwind 的 scale-0 类：v4 下它是独立 scale 属性，与关键帧的 transform 相乘 → 全程不可见。
interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}

/**
 * 配色档（#233）。
 *
 * **为什么这里另起一张表而不是直接调 `buttonVariants`**：那份表是给普通 Button 的，静息态里
 * 还带着 `shadow-sm` 与 `hover:bg-*`。阴影四个特效件一个都没有；而颜色 hover 更是与本件的底座
 * 冲突——`EFFECT_BUTTON_BASE_CLASS` 刻意不含 `transition-colors`（见 button-base.ts：特效件变的是
 * 背景动画不是颜色），挂上 `hover:bg-primary-hover` 会是一次无过渡的跳变。
 * 本件的交互反馈本来就由波纹 + `active:translate-y-px` 负责，那正是它存在的理由。
 * 取值集与色号仍与 Button 逐格对齐，只是砍掉阴影与 hover 两列。
 *
 * `defaultVariants` 落在 solid/brand 上，产出与 0.39.0 写死的 `bg-primary text-primary-foreground`
 * **逐字相同**——所以不传新 prop 的调用点类串一个字符都不变。这里不存在 #218 那个 cva 陷阱：
 * 那条陷阱是「想让『显式传默认值』与『没传』渲染得不一样」，而这里两者本来就该一样。
 */
const rippleColorVariants = cva("", {
  variants: {
    variant: {
      solid: "",
      // 与 Button 的 outline 同构：画布同色底 + 发丝边 + 正文色，语气色只改描边与文字。
      outline: "border border-hairline bg-surface text-foreground",
      ghost: "text-foreground",
      soft: "",
    },
    tone: { brand: "", neutral: "", success: "", warning: "", danger: "" },
  },
  compoundVariants: [
    { variant: "solid", tone: "brand", class: "bg-primary text-primary-foreground" },
    { variant: "solid", tone: "success", class: "bg-success text-success-foreground" },
    { variant: "solid", tone: "warning", class: "bg-warning text-warning-foreground" },
    { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground" },
    // neutral solid 走「反色」而不是灰底，同 Button：灰底实心与 outline 几乎不可分辨。
    { variant: "solid", tone: "neutral", class: "bg-foreground text-bg" },
    // outline / ghost 的 brand 与 neutral 就是各自的中性形态本身，无需追加类（同 Button）。
    { variant: "outline", tone: "success", class: "border-success text-success" },
    { variant: "outline", tone: "warning", class: "border-warning text-warning" },
    { variant: "outline", tone: "danger", class: "border-danger text-danger" },
    { variant: "ghost", tone: "success", class: "text-success" },
    { variant: "ghost", tone: "warning", class: "text-warning" },
    { variant: "ghost", tone: "danger", class: "text-danger" },
    // soft：12% 语义底 + 语义文字，与 Button / Tag / Chip 的 soft 同一口径。
    { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
    { variant: "soft", tone: "success", class: "bg-success/12 text-success" },
    { variant: "soft", tone: "warning", class: "bg-warning/12 text-warning" },
    { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
    { variant: "soft", tone: "neutral", class: "bg-foreground/8 text-foreground" },
  ],
  defaultVariants: { variant: "solid", tone: "brand" },
});

/**
 * 波纹默认色。实心档的波纹落在深底上，取该 tone 的**前景**色；其余档的波纹落在画布同色/浅色底上，
 * 取该 tone 的**本色**——反过来（浅底上用前景色）会得到一圈几乎看不见的白。
 * 变量名必须带 `--color-` 前缀：本库 `@theme` 里的真名如此，裸 `var(--primary)` 不解析。
 */
const RIPPLE_ON_SOLID: Record<RippleButtonTone, string> = {
  brand: "var(--color-primary-foreground)",
  neutral: "var(--color-bg)",
  success: "var(--color-success-foreground)",
  warning: "var(--color-warning-foreground)",
  danger: "var(--color-danger-foreground)",
};
const RIPPLE_TINT: Record<RippleButtonTone, string> = {
  brand: "var(--color-primary)",
  neutral: "var(--color-foreground)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
};

function defaultRippleColor(variant: RippleButtonVariant, tone: RippleButtonTone): string {
  return variant === "solid" ? RIPPLE_ON_SOLID[tone] : RIPPLE_TINT[tone];
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  function RippleButton(
    {
      variant = "solid",
      tone = "brand",
      rippleColor,
      duration = "600ms",
      size = "md",
      className,
      children,
      onClick,
      style,
      render,
      ...props
    },
    ref,
  ) {
    const [ripples, setRipples] = useState<Ripple[]>([]);
  const seq = useRef(0);
  const tint = rippleColor ?? defaultRippleColor(variant, tone);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    // 键盘激活 / 程序化 click() 没有真实坐标（detail === 0），波纹从按钮中心扩散而非左上角外。
    const cx = e.detail === 0 ? rect.width / 2 : e.clientX - rect.left;
    const cy = e.detail === 0 ? rect.height / 2 : e.clientY - rect.top;
    setRipples((prev) => [...prev, { key: seq.current++, size, x: cx - size / 2, y: cy - size / 2 }]);
    onClick?.(e);
  };

  const mergedStyle = { "--hulian-ripple-duration": duration, ...style } as CSSProperties;

  // 共享 Button 的排布 / 尺寸 / 焦点环 / 禁用态；波纹层是自己的（#126）。配色跟随 variant/tone（#233）。
  //
  // `overflow-hidden` 与底座里的 `inline-flex` 都是波纹能成立的前提，落到 <a> 上时必须一起过去：
  // <a> 默认是 `display: inline`，行内盒上的 overflow 裁不出圆角矩形，波纹会溢出成一片色块（#256）。
  // 两者都在这条串里，cloneElement 合并 className 时天然带过去，不需要额外处理。
  const mergedClassName = cn(
    EFFECT_BUTTON_BASE_CLASS,
    BUTTON_SIZE_CLASS[size],
    "relative cursor-pointer overflow-hidden rounded-[var(--radius)]",
    rippleColorVariants({ variant, tone }),
    "transition-transform duration-200 active:translate-y-px",
    className,
  );

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0">
        {ripples.map((r) => (
          <span
            key={r.key}
            className="absolute rounded-full opacity-50 [animation:hulian-button-ripple_var(--hulian-ripple-duration,600ms)_ease-out] motion-reduce:hidden"
            style={{ width: r.size, height: r.size, left: r.x, top: r.y, background: tint, transform: "scale(0)" }}
            onAnimationEnd={() => setRipples((prev) => prev.filter((p) => p.key !== r.key))}
          />
        ))}
      </span>
    </>
  );

  // render：渲染为自定义元素（<a>/<Link>）而非 button，用于「实心按钮样式的导航链接」。
  if (render)
    return renderAsElement(
      render,
      { ...props, onClick: handleClick, ref },
      mergedClassName,
      mergedStyle,
      inner,
    );

  return (
    <button ref={ref} {...props} onClick={handleClick} style={mergedStyle} className={mergedClassName}>
      {inner}
    </button>
  );
  },
);
