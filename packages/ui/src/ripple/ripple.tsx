import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { RippleProps } from "./ripple.types";

// 吸取自 magicui.design Ripple：N 个绝对居中、尺寸递增的圆环 div，逐圈延迟脉冲（scale + 淡出）。
// 瑚琏化：纯 CSS（RSC 安全）；边框 currentColor（根 text-border，可 className 覆盖）；
// 关键帧 hulian-ripple 落 @hulianui/tokens preset.css（含 translate(-50%,-50%) 居中 + scale + opacity）；
// 圆环静态 transform 也带 translate(-50%,-50%)，故 motion-reduce:[animation:none] 停后仍同心居中。
export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn("pointer-events-none absolute inset-0 text-border", className)}
    >
      {Array.from({ length: numCircles }).map((_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(mainCircleOpacity - i * 0.03, 0);
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
        return (
          <div
            key={i}
            className={cn(
              "absolute left-1/2 top-1/2 rounded-full border border-current [transform:translate(-50%,-50%)]",
              "[animation:hulian-ripple_3s_ease_infinite]",
              "motion-reduce:[animation:none]",
            )}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
