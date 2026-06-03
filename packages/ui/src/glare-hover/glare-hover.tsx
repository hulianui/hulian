import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { GlareHoverProps } from "./glare-hover.types";

// 吸取自 magicui.design / reactbits Glare Hover：悬停时一道斜向反光扫过。
// 瑚琏化：纯 CSS（RSC 安全，hover 不需 JS）；反光默认半透明白（玻璃光泽明暗皆宜，可 glareColor 覆盖）；
// group-hover 驱动覆盖层 translate-x，transition 控扫光。
export function GlareHover({
  children,
  glareColor = "rgba(255,255,255,0.45)",
  duration = "650ms",
  className,
  style,
  ...props
}: GlareHoverProps) {
  return (
    <div
      {...props}
      style={{ "--hulian-glare-color": glareColor, "--hulian-glare-duration": duration, ...style } as CSSProperties}
      className={cn("group relative overflow-hidden", className)}
    >
      {children}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-[150%] -skew-x-12",
          "bg-gradient-to-r from-transparent via-[var(--hulian-glare-color)] to-transparent",
          "transition-transform [transition-duration:var(--hulian-glare-duration,650ms)] ease-out",
          "group-hover:translate-x-[150%] motion-reduce:transition-none motion-reduce:group-hover:translate-x-[150%]",
        )}
      />
    </div>
  );
}
