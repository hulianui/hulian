"use client";
import { copy } from "./task-detail-frames.content";

// 任务详情右栏：执行过程帧回放。
// 按 RunFrame.kind 分发到 @hulianui/ui 的 AI 过程帧组件：
//   thinking → ThinkingBlock、tool → ToolCall、stream → StreamingText、event → 事件行。

import { ThinkingBlock, ToolCall, StreamingText, Text, cn } from "@hulianui/ui";
import type { RunFrame } from "../_data/types";

/** 事件帧里以 ⚠ 开头视为告警（failover 触发等）。 */
function isWarnEvent(text: string): boolean {
  return text.trimStart().startsWith("⚠");
}

export function TaskDetailFrames({ frames }: { frames: RunFrame[] }) {
  if (frames.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded-[var(--radius)] border border-dashed border-border">
        <Text size="sm" tone="muted">{copy("clickRunToReplayTheMultiAgent")}</Text>
      </div>
    );
  }
  return (
    <ol className="space-y-2.5">
      {frames.map((f, i) => {
        const key = `${f.kind}-${i}-${f.at}`;
        if (f.kind === "thinking") {
          return (
            <li key={key}>
              <ThinkingBlock title={copy("reasoning")} duration={`${(f.at / 1000).toFixed(1)}s`} defaultOpen>
                <Text size="sm" tone="muted">
                  {f.text}
                </Text>
              </ThinkingBlock>
            </li>
          );
        }
        if (f.kind === "tool") {
          return (
            <li key={key}>
              <ToolCall name="dispatch" status="success" output={f.text} />
            </li>
          );
        }
        if (f.kind === "stream") {
          return (
            <li
              key={key}
              className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2"
            >
              <StreamingText text={f.text} className="text-sm text-foreground" />
            </li>
          );
        }
        // event：普通事件行（告警态高亮）。
        const warn = isWarnEvent(f.text);
        return (
          <li
            key={key}
            className={cn(
              "flex items-start gap-2 rounded-[var(--radius)] px-3 py-2 text-sm",
              warn ? "bg-warning/10 text-warning" : "bg-surface-hover text-muted",
            )}
          >
            <span className="mt-0.5 shrink-0 tabular-nums text-[11px] opacity-70">
              {(f.at / 1000).toFixed(1)}s
            </span>
            <span className="leading-snug">{f.text}</span>
          </li>
        );
      })}
    </ol>
  );
}
