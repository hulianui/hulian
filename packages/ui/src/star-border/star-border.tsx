import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { StarBorderProps } from "./star-border.types";

// 吸取自 React Bits StarBorder：上下两道 radial-gradient 流星光带沿描边来回扫过，包裹一个内容容器（默认按钮）。
// 瑚琏化：纯 CSS（RSC 安全，无 hook）；光带色默认走 token var(--color-primary)、内壳用 bg-surface/border-border/text-foreground；
// 关键帧 hulian-star-border（translate 0%→-100% + opacity 1→0）落 preset.css，上/下带共用同一组关键帧：
// 两带都锚在 right:-250%（亮核初始在容器右外侧 +200%），下带 animation-direction: alternate 正放（亮核右→左扫入），
// 上带 alternate-reverse 先倒放（亮核从左外侧 -100% 左→右扫入），形成上下反向流光。
// 注意：CSS animation 简写里方向关键字只能出现一个，"alternate reverse" 两个词是非法值（整条声明被丢弃），必须用连字符的 alternate-reverse。
// reduced-motion 自动停（motion-reduce:[animation:none]）。
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
      {/* 下边光带：正放（translate 0→-100%），亮核从右外侧向左扫入 */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-[-12px] right-[-250%] z-0 h-1/2 w-[300%] rounded-[50%] opacity-70",
          "[animation:hulian-star-border_var(--hulian-star-speed)_linear_infinite_alternate]",
          "motion-reduce:[animation:none]",
        )}
        style={
          { background: gradient, "--hulian-star-speed": duration } as CSSProperties
        }
      />
      {/* 上边光带：倒放起步（translate -100%→0），亮核从左外侧向右扫入 */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-[-250%] top-[-12px] z-0 h-1/2 w-[300%] rounded-[50%] opacity-70",
          "[animation:hulian-star-border_var(--hulian-star-speed)_linear_infinite_alternate-reverse]",
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
