"use client";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import type { LogLevel, LogViewerProps } from "./log-viewer.types";

// level → 正文字面色类（Tailwind @source 只扫字面量，禁动态拼）。
const LEVEL_CLASS: Record<LogLevel, string> = {
  info: "text-foreground",
  warn: "text-warning",
  error: "text-danger",
  debug: "text-muted",
  success: "text-success",
};

export function levelClass(level: LogLevel = "info"): string {
  return LEVEL_CLASS[level];
}

export function LogViewer({
  lines,
  showTimestamp = false,
  autoScroll = true,
  wrap = false,
  height = 320,
  className,
}: LogViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 每次渲染后贴底（新行追加即触发），与 Conversation 同法
  useEffect(() => {
    if (!autoScroll) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-auto rounded-[var(--radius)] border border-border bg-surface p-3 font-mono text-xs leading-relaxed",
        className,
      )}
      style={{ height }}
    >
      {lines.map((line, i) => {
        const level = line.level ?? "info";
        return (
          <div
            key={i}
            className={cn("flex gap-2", wrap ? "whitespace-pre-wrap" : "whitespace-pre")}
          >
            {showTimestamp && line.timestamp != null && (
              <span className="shrink-0 tabular-nums text-muted">{line.timestamp}</span>
            )}
            {line.source != null && <span className="shrink-0 text-muted">{line.source}</span>}
            <span className={cn("min-w-0", wrap ? "break-words" : "", levelClass(level))}>
              {line.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
