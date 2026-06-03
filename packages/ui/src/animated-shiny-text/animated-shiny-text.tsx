import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { AnimatedShinyTextProps } from "./animated-shiny-text.types";

// 吸取自 magicui.design Animated Shiny Text：muted 文字上一道高光横扫（bg-clip-text + 背景位置动画）。
// 瑚琏化：纯 CSS（RSC 安全）；底色 text-muted、高光 via-foreground/80（瑚琏 token，替 magicui 的 black/white 双写）；
// 关键帧 hulian-shiny-text 落 preset.css；常用于「✨ Introducing…」徽标文案。
export function AnimatedShinyText({
  children,
  shimmerWidth = 100,
  className,
  style,
  ...props
}: AnimatedShinyTextProps) {
  return (
    <span
      {...props}
      style={{ "--hulian-shiny-width": `${shimmerWidth}px`, ...style } as CSSProperties}
      className={cn(
        "mx-auto max-w-md text-muted",
        "bg-clip-text [background-size:var(--hulian-shiny-width)_100%] bg-no-repeat [background-position:0_0]",
        "[animation:hulian-shiny-text_5s_linear_infinite] motion-reduce:[animation:none]",
        "bg-gradient-to-r from-transparent via-foreground/80 to-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
