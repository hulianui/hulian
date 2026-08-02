"use client";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import type { TypingDotsProps } from "./typing-dots.types";

// 助手「正在输入」指示：三点交错弹跳（Tailwind 内置 animate-bounce + 延迟错峰，纯 CSS·RSC）。
// reduced-motion 停跳；role=status 让读屏播报。配合 ChatMessage loading 态。
export function TypingDots({ label, className, ...props }: TypingDotsProps) {
  const locale = useComponentLocale().typingDots ?? zhCN.components!.typingDots!;
  return (
    <span
      role="status"
      aria-label={label ?? locale.typing}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="size-1.5 animate-bounce rounded-full bg-muted motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}
