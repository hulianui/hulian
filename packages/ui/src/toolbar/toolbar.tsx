"use client";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { Toggle } from "@base-ui/react/toggle";
import { cn } from "../lib/cn";
import type {
  ToolbarProps,
  ToolbarButtonProps,
  ToolbarToggleProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
} from "./toolbar.types";

// 容器 role=toolbar，键盘漫游内置。本批做 Root/Button/Group/Separator（Link/Input YAGNI）。
export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <BaseToolbar.Root
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius)] border border-border bg-surface p-1",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
    />
  );
}

export function ToolbarButton({ className, ...props }: ToolbarButtonProps) {
  return (
    <BaseToolbar.Button
      {...props}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2.5 text-sm text-foreground outline-none transition-colors",
        "hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "data-[pressed]:bg-surface-hover disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    />
  );
}

// 可切换工具按钮（加粗/斜体/对齐等）：Toolbar.Button 渲染为 Base UI Toggle，
// 自带 data-pressed=开。选中态用主色填充，明确区别于 hover（仅底色微变），否则「选中」与「悬浮」无法分辨。
export function ToolbarToggle({
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  ...props
}: ToolbarToggleProps) {
  return (
    <BaseToolbar.Button
      {...props}
      render={
        <Toggle
          pressed={pressed}
          defaultPressed={defaultPressed}
          onPressedChange={onPressedChange}
        />
      }
      className={cn(
        "inline-flex h-8 items-center justify-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2.5 text-sm text-foreground outline-none transition-colors",
        "hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "data-[pressed]:bg-primary data-[pressed]:text-primary-foreground data-[pressed]:hover:bg-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    />
  );
}

export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <BaseToolbar.Group {...props} className={cn("inline-flex items-center gap-1", className)} />;
}

// 水平 toolbar 内的分隔符是竖线（separator 自身 orientation=vertical），默认竖。
export function ToolbarSeparator({ className, orientation = "vertical", ...props }: ToolbarSeparatorProps) {
  return (
    <BaseToolbar.Separator
      orientation={orientation}
      {...props}
      className={cn(
        "mx-1 shrink-0 bg-border",
        "data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-px",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        className,
      )}
    />
  );
}
