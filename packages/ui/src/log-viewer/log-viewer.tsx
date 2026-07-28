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
  command: "text-primary font-medium",
};

export function levelClass(level: LogLevel = "info"): string {
  return LEVEL_CLASS[level];
}

// 判定「已在底部」的容差：亚像素与惯性滚动会让 scrollTop 差个零点几，卡死等号会永远判 false。
const BOTTOM_EPSILON = 8;

export function LogViewer({
  lines,
  showTimestamp = false,
  autoScroll = true,
  maxLines,
  wrap = false,
  height = 320,
  className,
}: LogViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 黏底：用户主动向上滚 → 停止跟随；滚回底部 → 恢复。默认 true，首次渲染即贴底。
  const stick = useRef(true);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_EPSILON;
  };

  // 每次渲染后按需贴底（新行追加即触发），与 Conversation 同法
  useEffect(() => {
    if (!autoScroll || !stick.current) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  // 截断只影响渲染，不动传进来的数组。
  const visible = maxLines && maxLines > 0 && lines.length > maxLines ? lines.slice(-maxLines) : lines;

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className={cn(
        "overflow-auto rounded-[var(--radius)] border border-border bg-surface p-3 font-mono text-xs leading-relaxed",
        className,
      )}
      style={{ height }}
    >
      {visible.map((line, i) => {
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
