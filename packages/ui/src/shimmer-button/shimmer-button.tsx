import { cloneElement } from "react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { ShimmerButtonProps } from "./shimmer-button.types";

// 吸取自 magicui.design Shimmer Button：周边游走的高光火花（conic-gradient + container 查询 + 双关键帧）。
// 瑚琏化：纯 CSS（RSC 安全）；底色默认 var(--color-primary)、文字 primary-foreground、火花默认 primary-foreground；
// CSS 变量全 hulian- 前缀避与全局 --radius 冲突；关键帧 hulian-shimmer-slide/spin-around 落 preset.css；
// container-type 用内联 [container-type:size] 兜底（不依赖 TW v4 @container 工具类）。
export function ShimmerButton({
  shimmerColor = "var(--color-primary-foreground)",
  shimmerSize = "0.05em",
  shimmerDuration = "3s",
  borderRadius = "var(--radius)",
  background = "var(--color-primary)",
  className,
  children,
  style,
  render,
  ...props
}: ShimmerButtonProps) {
  const mergedStyle = {
    "--hulian-shimmer-spread": "90deg",
    "--hulian-shimmer-color": shimmerColor,
    "--hulian-shimmer-radius": borderRadius,
    "--hulian-shimmer-speed": shimmerDuration,
    "--hulian-shimmer-cut": shimmerSize,
    "--hulian-shimmer-bg": background,
    ...style,
  } as CSSProperties;

  const mergedClassName = cn(
    "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-border px-6 py-3 font-medium text-primary-foreground",
    "[border-radius:var(--hulian-shimmer-radius)] [background:var(--hulian-shimmer-bg)]",
    "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
    className,
  );

  const inner = (
    <>
      {/* 火花容器 */}
      <div className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
        <div className="absolute inset-0 aspect-square h-[100cqh] [animation:hulian-shimmer-slide_var(--hulian-shimmer-speed)_ease-in-out_infinite] motion-reduce:[animation:none]">
          <div className="absolute -inset-full w-auto rotate-0 [translate:0_0] [animation:hulian-spin-around_calc(var(--hulian-shimmer-speed)*2)_infinite_linear] [background:conic-gradient(from_calc(270deg-(var(--hulian-shimmer-spread)*0.5)),transparent_0,var(--hulian-shimmer-color)_var(--hulian-shimmer-spread),transparent_var(--hulian-shimmer-spread))] motion-reduce:[animation:none]" />
        </div>
      </div>
      {/* inline-flex + whitespace-nowrap：图标(preflight 下 svg=display:block)与文案同行居中，不掉行 */}
      <span className="relative z-10 inline-flex items-center justify-center whitespace-nowrap">{children}</span>
      {/* inset 高光 */}
      {/* 只有 box-shadow 在变，指名它而非 transition-all（300ms/ease-in-out 是这枚炫效按钮刻意的"缓慢发光"个性，保留） */}
      <div className="absolute inset-0 size-full rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff1f] transform-gpu transition-[box-shadow] duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />
      {/* backdrop 盖回底色只露边缘火花 */}
      <div className="absolute inset-[var(--hulian-shimmer-cut)] -z-20 [border-radius:var(--hulian-shimmer-radius)] [background:var(--hulian-shimmer-bg)]" />
    </>
  );

  // render：渲染为自定义元素（<a>/<Link>）而非 button，用于「闪光样式的链接」CTA。
  if (render) {
    const renderProps = render.props as Record<string, unknown>;
    return cloneElement(
      render,
      {
        ...props,
        style: { ...mergedStyle, ...((renderProps.style as CSSProperties) ?? {}) },
        className: cn(mergedClassName, renderProps.className as string | undefined),
      } as Record<string, unknown>,
      inner,
    );
  }

  return (
    <button style={mergedStyle} className={mergedClassName} {...props}>
      {inner}
    </button>
  );
}
