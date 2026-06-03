import { cn } from "../lib/cn";
import type { KbdProps } from "./kbd.types";

// 纯皮肤 <kbd>（可 RSC）。组合键(⌘+K)靠并排多个 Kbd；keys 符号自动映射 YAGNI。
export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[min(var(--radius),0.375rem)] border border-border bg-surface-hover px-1.5 font-mono text-xs font-medium text-muted shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
