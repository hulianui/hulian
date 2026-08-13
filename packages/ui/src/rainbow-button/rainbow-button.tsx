import { forwardRef, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import {
  BUTTON_SIZE_CLASS,
  EFFECT_BUTTON_BASE_CLASS,
  renderAsElement,
} from "../button/button-base";
import type { RainbowButtonProps } from "./rainbow-button.types";

// 吸取自 magicui.design Rainbow Button：流动彩虹底色 + 底部模糊彩虹光晕。
// 瑚琏化：纯 CSS（RSC 安全）；彩虹用 chart-1..4 token（吃明暗，替 magicui 写死 hsl）；
// 关键帧 hulian-rainbow 落 preset.css（bg-size 200% 平移）。
const RAINBOW =
  "linear-gradient(90deg, var(--color-chart-1), var(--color-chart-2), var(--color-chart-3), var(--color-chart-4), var(--color-chart-1))";

export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton(
    { speed = "3s", size = "md", className, children, style, render, ...props },
    ref,
  ) {
    const flow = {
      backgroundImage: RAINBOW,
      backgroundSize: "200%",
      animation: `hulian-rainbow ${speed} linear infinite`,
    } as const;

    const mergedStyle = { "--hulian-rainbow-speed": speed, ...flow, ...style } as CSSProperties;

    // 共享 Button 的排布 / 尺寸 / 焦点环 / 禁用态；底色是自己的流动彩虹，不共享配色（#126）。
    // `relative` 不只是习惯：底部光晕是绝对定位的兄弟层，落到 <a> 上时这条必须跟着过去，
    // 否则光晕会去找最近的定位祖先，跑到页面某处（#256）。
    const mergedClassName = cn(
      EFFECT_BUTTON_BASE_CLASS,
      BUTTON_SIZE_CLASS[size],
      "group relative cursor-pointer rounded-[var(--radius)] text-primary-foreground",
      "[animation:hulian-rainbow_var(--hulian-rainbow-speed,3s)_linear_infinite] [background-size:200%] motion-reduce:[animation:none]",
      "transition-transform duration-200 active:translate-y-px",
      className,
    );

    const inner = (
      <>
        {/* 底部模糊彩虹光晕 */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1.5 left-1/2 -z-10 h-2/5 w-3/5 -translate-x-1/2 rounded-full blur-lg [animation:hulian-rainbow_var(--hulian-rainbow-speed,3s)_linear_infinite] [background-size:200%] motion-reduce:[animation:none]"
          style={flow}
        />
        <span className="relative">{children}</span>
      </>
    );

    // render：渲染为自定义元素（<a>/<Link>）而非 button，用于「彩虹样式的链接」CTA。
    if (render) return renderAsElement(render, { ...props, ref }, mergedClassName, mergedStyle, inner);

    return (
      <button ref={ref} {...props} style={mergedStyle} className={mergedClassName}>
        {inner}
      </button>
    );
  },
);
