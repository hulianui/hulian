"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "../_icons";
import { cn } from "../lib/cn";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "../collapsible";
import { AnimatedShinyText } from "../animated-shiny-text";
import type { ThinkingBlockProps } from "./thinking-block.types";
import { useComponentLocale } from "../config/locale";

// 思考折叠块：dogfood Collapsible(自带 chevron + 平滑高度)，头部承载思考态。
// thinking 时标题转圈 + AnimatedShinyText 高光流动 + 默认展开；思考结束自动收起 chain-of-thought。
// 内部始终受控（避免 thinking 翻转改非受控 defaultOpen 触发 Base UI 警告）：
// open 透传 = 全受控；否则内部 state 跟随 thinking 生命周期自动开合，用户点击亦可手动切换。
export function ThinkingBlock({
  title,
  thinking,
  duration,
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: ThinkingBlockProps) {
  const labels = useComponentLocale().thinkingBlock;
  const resolvedTitle = title ?? labels.title;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? thinking ?? false);
  // thinking 翻转时同步开合：开始思考→展开，思考结束→自动收起（标准 agent UX）
  const prevThinking = useRef(thinking);
  useEffect(() => {
    if (isControlled) return;
    if (prevThinking.current !== thinking) {
      setInternalOpen(thinking ?? false);
      prevThinking.current = thinking;
    }
  }, [thinking, isControlled]);

  const resolvedOpen = isControlled ? open : internalOpen;
  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <Collapsible
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
      className={cn(
        "w-fit max-w-full rounded-[var(--radius)] border border-border bg-surface/60",
        className,
      )}
    >
      <CollapsibleTrigger>
        <span className="flex min-w-0 items-center gap-2">
          {thinking && <Loader2 className="size-4 shrink-0 animate-spin text-muted" aria-hidden />}
          {thinking ? (
            <AnimatedShinyText className="text-sm font-medium">{resolvedTitle}</AnimatedShinyText>
          ) : (
            <span className="truncate">{resolvedTitle}</span>
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
