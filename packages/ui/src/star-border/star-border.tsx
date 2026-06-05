import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { StarBorderProps } from "./star-border.types";

// 吸取自 React Bits StarBorder：上下两道 radial-gradient 流星光带沿描边来回扫过，包裹一个内容容器（默认按钮）。
// 瑚琏化：纯 CSS（RSC 安全，无 hook）；光带色默认走 token var(--color-primary)、内壳用 bg-surface/border-border/text-foreground；
// 关键帧 hulian-star-border 落 preset.css，上/下带共用同一组关键帧靠 reverse 方向区分；reduced-motion 自动停（motion-reduce:[animation:none]）。
export function StarBorder({
  as: Component = "button",
  color = "var(--color-primary)",
  speed = 6,
  thickness = 1,
  className,
  style,
  children,
  ...props
}: StarBorderProps) {
  const gradient = `radial-gradient(circle, ${color}, transparent 10%)`;
  const duration = `${speed}s`;

  return (
    <Component
      {...props}
      className={cn(
        "relative inline-block overflow-hidden rounded-[20px]",
        className,
      )}
      style={{ padding: `${thickness}px 0`, ...style } as CSSProperties}
    >
      {/* 下边光带：从右向左扫（reverse 方向） */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-[-12px] right-[-250%] z-0 h-1/2 w-[300%] rounded-[50%] opacity-70",
          "[animation:hulian-star-border_var(--hulian-star-speed)_linear_infinite_alternate_reverse]",
          "motion-reduce:[animation:none]",
        )}
        style={
          { background: gradient, "--hulian-star-speed": duration } as CSSProperties
        }
      />
      {/* 上边光带：从左向右扫 */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-[-250%] top-[-12px] z-0 h-1/2 w-[300%] rounded-[50%] opacity-70",
          "[animation:hulian-star-border_var(--hulian-star-speed)_linear_infinite_alternate]",
          "motion-reduce:[animation:none]",
        )}
        style={
          { background: gradient, "--hulian-star-speed": duration } as CSSProperties
        }
      />
      <span className="relative z-[1] block rounded-[20px] border border-border bg-surface px-[26px] py-4 text-center text-foreground">
        {children}
      </span>
    </Component>
  );
}
