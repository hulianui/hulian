"use client";
import { Wrench } from "../_icons";
import { cn } from "../lib/cn";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "../collapsible";
import { Dot } from "../dot";
import { Spinner } from "../spinner";
import type { DotTone } from "../dot";
import type { ToolCallProps, ToolCallStatus } from "./tool-call.types";
import { useComponentLocale } from "../config/locale";

// 工具调用卡：dogfood Collapsible(头部=工具名+状态，面板=参数/结果) + Dot(状态色) + Spinner(运行中)。
const statusTone: Record<ToolCallStatus, DotTone> = {
  pending: "neutral",
  running: "brand",
  success: "success",
  error: "danger",
};

export function ToolCall({
  name,
  status = "success",
  icon,
  input,
  output,
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: ToolCallProps) {
  const labels = useComponentLocale().toolCall;
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("rounded-[var(--radius)] border border-border bg-surface", className)}
    >
      <CollapsibleTrigger>
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-muted [&>svg]:size-4">
            {icon ?? <Wrench aria-hidden />}
          </span>
          <span className="truncate font-mono text-xs text-foreground">{name}</span>
          <span className="ml-1 flex items-center gap-1.5 text-xs font-normal text-muted">
            {status === "running" ? (
              <Spinner size="sm" tone="muted" />
            ) : (
              <Dot tone={statusTone[status]} />
            )}
            {labels[status]}
          </span>
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="space-y-2">
          {input != null && (
            <div>
              <p className="mb-1 text-xs font-medium text-foreground">{labels.input ?? "参数"}</p>
              <div className="text-xs">{input}</div>
            </div>
          )}
          {output != null && (
            <div>
              <p className="mb-1 text-xs font-medium text-foreground">{labels.output ?? "结果"}</p>
              <div className="text-xs">{output}</div>
            </div>
          )}
          {children}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
