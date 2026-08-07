import { forwardRef, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import { BUTTON_SIZE_CLASS, EFFECT_BUTTON_BASE_CLASS } from "../button/button-base";
import type { PulsatingButtonProps } from "./pulsating-button.types";

// 吸取自 magicui.design Pulsating Button：外扩淡出的脉冲光环（box-shadow 关键帧）。
// 瑚琏化：纯 CSS（RSC 安全）；底色 primary、光环色默认 primary 70%；关键帧 hulian-pulse-ring 落 preset.css。
export const PulsatingButton = forwardRef<HTMLButtonElement, PulsatingButtonProps>(
  function PulsatingButton(
    { pulseColor, duration = "1.5s", size = "md", className, children, style, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        {...props}
        style={
          {
            "--hulian-pulse-duration": duration,
            ...(pulseColor ? { "--hulian-pulse-color": pulseColor } : {}),
            ...style,
          } as CSSProperties
        }
        // 共享 Button 的排布 / 尺寸 / 焦点环 / 禁用态；脉冲光环是自己的（#126）。
        className={cn(
          EFFECT_BUTTON_BASE_CLASS,
          BUTTON_SIZE_CLASS[size],
          "relative cursor-pointer rounded-[var(--radius)] bg-primary text-primary-foreground",
          "[animation:hulian-pulse-ring_var(--hulian-pulse-duration,1.5s)_ease-in-out_infinite] motion-reduce:[animation:none]",
          "transition-transform duration-200 active:translate-y-px",
          className,
        )}
      >
        <span className="relative">{children}</span>
      </button>
    );
  },
);
