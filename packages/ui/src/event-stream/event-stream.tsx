"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { EventStreamItem, EventStreamProps, EventStreamTone } from "./event-stream.types";

// 事件流时间线（"use client"·零依赖·纯 CSS）：
//
//  与既有 ThreadList / Timeline 的差异化（定位边界，勿混用）：
//   · ThreadList = 会话/话题列表。每项是一段可进入的对话，强调「读到哪了」。
//   · Timeline   = 里程碑叙事。稀疏、人工编排、每点都有分量。
//   · EventStream = 高频机器事件的连续流。密度大、语义色是主要信息载体、
//                   新条目会持续追加，强调「刚刚发生了什么、其中哪些不对劲」。
//
//  故本组件：条目紧凑（比 Timeline 密），色点承载语义（比 ThreadList 强），
//  支持 maxHeight 内滚 + live 新条目淡入 + detail 折叠。
//
//  时间不做格式化：时区、精度、相对/绝对是调用方的领域知识，
//  组件擅自 toLocaleString 只会在跨时区场景制造错误。

// 用语义色而非 chart-N：chart-* 是**图表分类色**，只保证彼此可区分，不承载
// "危险/正常"的含义 —— 拿它当状态色会出现 danger 渲染成橙色这类语义错位。
// 语义色在明暗主题下自动切值（semantic.css 的 danger-700 / danger-400）。
const TONE_DOT: Record<EventStreamTone, string> = {
  neutral: "bg-border",
  info: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const TONE_TEXT: Record<EventStreamTone, string> = {
  neutral: "text-muted",
  info: "text-foreground",
  success: "text-foreground",
  warning: "text-foreground",
  danger: "text-foreground",
};

function Row({
  item,
  side,
  clickable,
  onItemClick,
  isNew,
  expandedAll,
}: {
  item: EventStreamItem;
  side: "left" | "right";
  clickable: boolean;
  onItemClick: EventStreamProps["onItemClick"];
  isNew: boolean;
  expandedAll: boolean;
}) {
  const [open, setOpen] = useState(expandedAll);
  useEffect(() => setOpen(expandedAll), [expandedAll]);

  const tone: EventStreamTone = item.tone ?? "neutral";
  const hasDetail = item.detail != null;

  const toggle = () => {
    if (hasDetail) setOpen((v) => !v);
    if (clickable) onItemClick?.(item);
  };

  const interactive = hasDetail || clickable;

  return (
    <li
      data-tone={tone}
      className={cn(
        "group relative flex gap-3 py-2",
        side === "right" && "flex-row-reverse",
        isNew && "animate-[hulian-event-flash_420ms_ease-out]",
      )}
    >
      {/* 时间轴：色点 + 竖线。用 ::before 画线会被 overflow 裁掉，故用真实元素。 */}
      <div className={cn("relative flex w-14 shrink-0 flex-col items-center", side === "right" && "items-center")}>
        <span
          aria-hidden
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full ring-2 ring-bg",
            TONE_DOT[tone],
          )}
        />
        <span aria-hidden className="mt-1 w-px flex-1 bg-border/70 group-last:hidden" />
      </div>

      <div className={cn("min-w-0 flex-1", side === "right" && "text-right")}>
        <div
          {...(interactive
            ? {
                role: "button" as const,
                tabIndex: 0,
                onClick: toggle,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle();
                  }
                },
              }
            : {})}
          className={cn(
            "flex items-baseline gap-2 rounded-[var(--radius)] outline-none",
            side === "right" && "flex-row-reverse",
            interactive &&
              "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg",
          )}
        >
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted">{item.ts}</span>
          <span className={cn("min-w-0 flex-1 truncate text-sm", TONE_TEXT[tone])}>{item.title}</span>
          {item.meta != null && (
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted">{item.meta}</span>
          )}
        </div>

        {item.overridden != null && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1.5 text-xs text-muted",
              side === "right" && "flex-row-reverse",
            )}
          >
            <span
              aria-hidden
              className="inline-block size-1.5 shrink-0 rounded-full bg-warning"
            />
            <span className="min-w-0 truncate">已放行：{item.overridden}</span>
          </div>
        )}

        {hasDetail && open && (
          <div className="mt-1.5 rounded-[var(--radius)] bg-muted/50 px-2.5 py-2 text-xs leading-relaxed text-muted">
            {item.detail}
          </div>
        )}
      </div>
    </li>
  );
}

export function EventStream({
  items,
  maxHeight,
  emptyText = "暂无事件",
  onItemClick,
  live = false,
  side = "left",
  defaultExpanded = false,
  className,
}: EventStreamProps) {
  // 记住上一轮见过的 id，用来判断本轮哪些是新的。
  // 用 ref 而非 state：它只影响渲染样式，不该自己触发一次额外渲染。
  const seen = useRef<Set<string | number> | null>(null);
  const fresh = new Set<string | number>();

  if (live) {
    if (seen.current === null) {
      // 首帧全部视为已见，避免初次挂载时整屏一起闪
      seen.current = new Set(items.map((i) => i.id));
    } else {
      for (const i of items) {
        if (!seen.current.has(i.id)) fresh.add(i.id);
      }
      seen.current = new Set(items.map((i) => i.id));
    }
  }

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-[var(--radius)] border border-dashed border-border py-10 text-sm text-muted",
          className,
        )}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <ol
      className={cn("flex flex-col", maxHeight != null && "overflow-y-auto", className)}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      {items.map((item) => (
        <Row
          key={item.id}
          item={item}
          side={side}
          clickable={onItemClick != null}
          onItemClick={onItemClick}
          isNew={fresh.has(item.id)}
          expandedAll={defaultExpanded}
        />
      ))}
    </ol>
  );
}
