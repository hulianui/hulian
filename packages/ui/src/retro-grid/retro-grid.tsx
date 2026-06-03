import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { RetroGridProps } from "./retro-grid.types";

// 吸取自 magicui.design Retro Grid：perspective 容器 → rotateX 倾斜层 → 无限 translateY 滚动的网格层。
// 瑚琏化：纯 CSS（RSC 安全）；网格线 currentColor（根 text-border，可 className 覆盖）；
// 关键帧 hulian-retro-grid 落 @hulian/tokens preset.css（平移一个 cell-size 即无缝）；
// motion-reduce:[animation:none] 尊重 prefers-reduced-motion；几何 config 走内联 CSS 变量。
export function RetroGrid({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  duration = 12,
  className,
  style,
  ...props
}: RetroGridProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden text-border [perspective:200px]",
        className,
      )}
      style={
        {
          "--hulian-retro-grid-angle": `${angle}deg`,
          "--hulian-retro-grid-cell-size": `${cellSize}px`,
          "--hulian-retro-grid-opacity": `${opacity}`,
          "--hulian-retro-grid-duration": `${duration}s`,
          ...style,
        } as CSSProperties
      }
    >
      {/* 倾斜层：rotateX 透视 + 整体不透明度 */}
      <div
        className="absolute inset-0 [transform:rotateX(var(--hulian-retro-grid-angle,65deg))]"
        style={{ opacity: "var(--hulian-retro-grid-opacity, 0.5)" }}
      >
        {/* 滚动网格层：双向 currentColor 线 + 无限 translateY */}
        <div
          className={cn(
            "absolute [inset:0%_0px] [height:300%] [width:600%] [margin-left:-50%] [transform-origin:100%_0_0]",
            "[background-image:linear-gradient(to_right,currentColor_1px,transparent_0),linear-gradient(to_bottom,currentColor_1px,transparent_0)]",
            "[background-size:var(--hulian-retro-grid-cell-size,60px)_var(--hulian-retro-grid-cell-size,60px)]",
            "[animation:hulian-retro-grid_var(--hulian-retro-grid-duration,12s)_linear_infinite]",
            "motion-reduce:[animation:none]",
          )}
        />
      </div>
    </div>
  );
}
