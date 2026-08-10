import { memo } from "react";
import { cn } from "../lib/cn";
import type { KbdProps } from "./kbd.types";

// 纯皮肤 <kbd>（可 RSC）。组合键(⌘+K)靠并排多个 Kbd；keys 符号自动映射 YAGNI。
function KbdImpl({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[min(var(--radius),0.375rem)] border border-border bg-surface-hover px-1.5 font-mono text-xs font-medium text-muted-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
KbdImpl.displayName = "Kbd";

// 快捷键提示常成排渲染（命令面板、菜单项尾巴、帮助页），父级一动就整排重算。
// props 全是原语时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Kbd = memo(KbdImpl);
Kbd.displayName = "Kbd";
