"use client";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsiblePanelProps,
} from "./collapsible.types";

// 根：透明转发 Base UI Collapsible.Root（open/defaultOpen/onOpenChange/disabled）。默认闭合。
export function Collapsible({ className, onOpenChange, ...props }: CollapsibleProps) {
  return (
    <BaseCollapsible.Root
      {...props}
      onOpenChange={onOpenChange ? (open) => onOpenChange(open) : undefined}
      className={cn("w-full", className)}
    />
  );
}

// Trigger（button，data-panel-open 驱动 chevron）。group 让 chevron 读父开合态。
export function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      {...props}
      className={cn(
        // min-h-11（44px）：Trigger 常配单行短文案，仅靠 py-2.5 只有 40px，低于触控目标推荐值。
        "group flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--radius)] px-3 py-2.5 text-left text-sm font-medium text-foreground outline-none transition-colors",
        "hover:bg-surface-hover",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className,
      )}
    >
      {children}
      <svg
        data-chevron
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </BaseCollapsible.Trigger>
  );
}

// Panel 本体零 padding（border-box 下 padding 会撑破塌零）；高度走 Base UI 内建
// --collapsible-panel-height 纯 CSS 过渡。时长/曲线复用 motion token CSS 镜像（同 Accordion/
// Dialog，零 motion 运行时）。内层 div 承载 padding 与正文皮肤；plain 时整层不渲染（#162）。
export function CollapsiblePanel({ className, children, plain = false, ...props }: CollapsiblePanelProps) {
  return (
    <BaseCollapsible.Panel
      {...props}
      style={{
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      }}
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden transition-[height]",
        "data-[starting-style]:h-0 data-[ending-style]:h-0",
        className,
      )}
    >
      {plain ? children : <div className="px-3 pb-3 pt-1 text-sm text-muted-foreground">{children}</div>}
    </BaseCollapsible.Panel>
  );
}
