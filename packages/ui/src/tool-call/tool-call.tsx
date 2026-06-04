"use client";
import { Wrench } from "../_icons";
import { cn } from "../lib/cn";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "../collapsible";
import { Dot } from "../dot";
import { Spinner } from "../spinner";
import type { DotTone } from "../dot";
import type { ToolCallProps, ToolCallStatus } from "./tool-call.types";

// 工具调用卡：dogfood Collapsible(头部=工具名+状态，面板=参数/结果) + Dot(状态色) + Spinner(运行中)。
const statusMeta: Record<ToolCallStatus, { tone: DotTone; label: string }> = {
  pending: { tone: "neutral", label: "等待" },
  running: { tone: "brand", label: "运行中" },
  success: { tone: "success", label: "完成" },
  error: { tone: "danger", label: "失败" },
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
  const meta = statusMeta[status];
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("rounded-[var(--radius)] border border-border bg-surface", className)}
    >
      <CollapsibleTrigger>
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-muted [&>svg]:size-4">{icon ?? <Wrench aria-hidden />}</span>
          <span className="truncate font-mono text-xs text-foreground">{name}</span>
          <span className="ml-1 flex items-center gap-1.5 text-xs font-normal text-muted">
            {status === "running" ? (
              <Spinner size="sm" tone="muted" />
            ) : (
              <Dot tone={meta.tone} />
            )}
            {meta.label}
          </span>
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="space-y-2">
          {input != null && (
            <div>
              <p className="mb-1 text-xs font-medium text-foreground">参数</p>
              <div className="text-xs">{input}</div>
            </div>
          )}
          {output != null && (
            <div>
              <p className="mb-1 text-xs font-medium text-foreground">结果</p>
              <div className="text-xs">{output}</div>
            </div>
          )}
          {children}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}
