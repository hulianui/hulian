"use client";
import { Loader2 } from "../_icons";
import { cn } from "../lib/cn";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "../collapsible";
import { AnimatedShinyText } from "../animated-shiny-text";
import type { ThinkingBlockProps } from "./thinking-block.types";

// 思考折叠块：dogfood Collapsible(自带 chevron + 平滑高度)，头部承载思考态。
// thinking 时标题转圈 + AnimatedShinyText 高光流动 + 默认展开；收起后 chain-of-thought 隐藏。
export function ThinkingBlock({
  title = "思考过程",
  thinking,
  duration,
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: ThinkingBlockProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen ?? thinking}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("rounded-[var(--radius)] border border-border bg-surface/60", className)}
    >
      <CollapsibleTrigger>
        <span className="flex min-w-0 items-center gap-2">
          {thinking && <Loader2 className="size-4 shrink-0 animate-spin text-muted" aria-hidden />}
          {thinking ? (
            <AnimatedShinyText className="text-sm font-medium">{title}</AnimatedShinyText>
          ) : (
            <span className="truncate">{title}</span>
          )}
          {duration && <span className="text-xs font-normal text-muted">{duration}</span>}
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="leading-relaxed">{children}</div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
