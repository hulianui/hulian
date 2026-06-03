import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { PulsatingButtonProps } from "./pulsating-button.types";

// 吸取自 magicui.design Pulsating Button：外扩淡出的脉冲光环（box-shadow 关键帧）。
// 瑚琏化：纯 CSS（RSC 安全）；底色 primary、光环色默认 primary 70%；关键帧 hulian-pulse-ring 落 preset.css。
export function PulsatingButton({
  pulseColor,
  duration = "1.5s",
  className,
  children,
  style,
  ...props
}: PulsatingButtonProps) {
  return (
    <button
      {...props}
      style={
        {
          "--hulian-pulse-duration": duration,
          ...(pulseColor ? { "--hulian-pulse-color": pulseColor } : {}),
          ...style,
        } as CSSProperties
      }
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[var(--radius)] bg-primary px-6 py-3 font-medium text-primary-foreground",
        "[animation:hulian-pulse-ring_var(--hulian-pulse-duration,1.5s)_ease-in-out_infinite] motion-reduce:[animation:none]",
        "transition-transform duration-200 active:translate-y-px",
        className,
      )}
    >
      <span className="relative">{children}</span>
    </button>
  );
}
