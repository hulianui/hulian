"use client";
import { forwardRef } from "react";
import { Search } from "../_icons";
import { Kbd } from "../kbd";
import { cn } from "../lib/cn";
import type { CommandTriggerProps } from "./command.types";

// 搜索框样子的命令面板入口：放大镜 + 占位文案 + 快捷键键帽，点一下打开 <Command>。
// 它长得像输入框但不是输入框 —— 真正的输入在面板里，这里只是一个按钮。做成按钮而不是只读 input：
// 读屏把它报成「按钮，搜索文档」，不会让人以为能直接在这里打字。

const SIZE = {
  sm: {
    h: "h-[var(--hl-control-h-sm,2rem)]",
    square: "max-sm:size-[var(--hl-control-h-sm,2rem)]",
    squareMd: "max-md:size-[var(--hl-control-h-sm,2rem)]",
  },
  md: {
    h: "h-[var(--hl-control-h-md,2.5rem)]",
    square: "max-sm:size-[var(--hl-control-h-md,2.5rem)]",
    squareMd: "max-md:size-[var(--hl-control-h-md,2.5rem)]",
  },
} as const;

// 收成图标钮的断点类：Tailwind 只认源码里完整出现的类名，故逐档写死。
const COLLAPSE = {
  sm: { box: "max-sm:justify-center max-sm:px-0", hide: "max-sm:hidden" },
  md: { box: "max-md:justify-center max-md:px-0", hide: "max-md:hidden" },
} as const;

export const CommandTrigger = forwardRef<HTMLButtonElement, CommandTriggerProps>(
  function CommandTrigger(
    {
      placeholder = "搜索…",
      shortcut = "⌘K",
      shape = "rounded",
      size = "md",
      collapseBelow = false,
      className,
      "aria-keyshortcuts": ariaKeyshortcuts,
      ...props
    },
    ref,
  ) {
    const s = SIZE[size];
    const c = collapseBelow ? COLLAPSE[collapseBelow] : null;
    const square = collapseBelow === "md" ? s.squareMd : collapseBelow === "sm" ? s.square : null;
    return (
      <button
        ref={ref}
        type="button"
        // 默认键帽是 ⌘K，与 Command 的 shortcut（⌘K / Ctrl+K）同一组键；自定义键帽时由调用方给。
        aria-keyshortcuts={ariaKeyshortcuts ?? (shortcut === "⌘K" ? "Meta+K Control+K" : undefined)}
        className={cn(
          "inline-flex shrink-0 items-center justify-between gap-2 border border-border/70 bg-muted/60 pl-3 pr-1.5 text-sm text-muted-foreground outline-none transition-colors",
          "hover:border-border hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
          shape === "pill" ? "rounded-full" : "rounded-[min(var(--radius),0.5rem)]",
          s.h,
          c?.box,
          square,
          className,
        )}
        {...props}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="size-4 shrink-0" aria-hidden />
          <span className={cn("truncate", c?.hide)}>{placeholder}</span>
        </span>
        {shortcut != null && (
          <Kbd tone="primary" className={cn("shrink-0", c?.hide)}>
            {shortcut}
          </Kbd>
        )}
      </button>
    );
  },
);
CommandTrigger.displayName = "CommandTrigger";
