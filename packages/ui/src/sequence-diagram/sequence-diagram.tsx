"use client";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { layoutSequence, type SequenceRow } from "./sequence-diagram-layout";
import type { SequenceDiagramProps, SequenceMessageKind } from "./sequence-diagram.types";

// 时序图（只读首片）：
//  · 三层同列网格叠放：生命线（aria-hidden）→ 参与者列头 <ul> → 消息 <ol>。三层用同一个
//    grid-template-columns，所以消息箭头的两端天然落在生命线中心，不需要测量 DOM。
//  · 箭头两端要从「列中心」起止：一条消息占 span 列，左右各让出半列，即 padding-inline =
//    100% / (2 * span)。百分比 padding 相对网格区域宽度，正好是这 span 列的总宽。
//  · 箭头线画在 aria-hidden 的装饰层里；读屏念的是每个 <li> 里的「甲 发给 乙（同步调用）：文案」。
//  · "use client" 只为了读 ConfigProvider 的文案（Context hook），组件本身无状态、无副作用。

const DEFAULT_LABELS = {
  diagram: "时序图",
  participants: "参与者",
  messages: "消息",
  message: (from: string, to: string, kind: string) => `${from} 发给 ${to}（${kind}）：`,
  self: (from: string, kind: string) => `${from} 发给自己（${kind}）：`,
  kinds: { sync: "同步调用", async: "异步消息", reply: "返回" } as Record<SequenceMessageKind, string>,
};

function ArrowHead({ kind, className }: { kind: SequenceMessageKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden
      className={cn("absolute size-2.5 overflow-visible", className)}
    >
      {kind === "sync" ? (
        <path d="M0 0.5 L10 5 L0 9.5 Z" fill="currentColor" />
      ) : (
        <path
          d="M1 1 L9.5 5 L1 9"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function MessageArrow({ row }: { row: SequenceRow }) {
  const dashed = row.kind === "reply";
  if (row.direction === "self") {
    return (
      <span aria-hidden data-sequence-arrow="" className="relative mt-1 block h-4 w-8">
        <span
          className={cn(
            "absolute inset-0 rounded-r-sm border-[1.5px] border-l-0 border-current",
            dashed && "border-dashed",
          )}
        />
        <ArrowHead kind={row.kind} className="-bottom-[4.25px] -left-px rotate-180" />
      </span>
    );
  }
  return (
    <span aria-hidden data-sequence-arrow="" className="relative mt-1 block h-2.5">
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-[1.5px] border-current",
          dashed ? "border-dashed" : "border-solid",
        )}
      />
      <ArrowHead
        kind={row.kind}
        className={row.direction === "right" ? "top-0 -right-px" : "top-0 -left-px rotate-180"}
      />
    </span>
  );
}

export function SequenceDiagram({
  participants,
  messages,
  title,
  autoNumber = false,
  activeId,
  minColumnWidth = 160,
  className,
  ...rest
}: SequenceDiagramProps) {
  const locale = useComponentLocale().sequenceDiagram;
  const labels = { ...DEFAULT_LABELS, ...locale, kinds: { ...DEFAULT_LABELS.kinds, ...locale?.kinds } };
  const rows = layoutSequence(participants, messages);
  const nameOf = (index: number) => participants[index]?.label ?? "";
  const columns = Math.max(participants.length, 1);
  const grid: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(${minColumnWidth}px, 1fr))`,
  };

  return (
    <figure
      {...rest}
      aria-label={title ?? labels.diagram}
      data-sequence-diagram=""
      className={cn("m-0 min-w-0 overflow-x-auto text-foreground", className)}
    >
      <div className="relative pb-4" style={{ minWidth: columns * minColumnWidth }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 grid" style={grid}>
          {participants.map((p) => (
            <span key={p.id} data-sequence-lifeline="" className="mx-auto h-full w-px bg-border" />
          ))}
        </div>

        <ul aria-label={labels.participants} className="relative m-0 grid list-none p-0" style={grid}>
          {participants.map((p) => (
            <li key={p.id} className="flex justify-center px-2">
              <span className="flex max-w-full flex-col items-center rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-center shadow-xs">
                <span className="text-sm font-medium break-words">{p.label}</span>
                {p.description ? (
                  <span className="text-xs text-muted-foreground break-words">{p.description}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <ol aria-label={labels.messages} className="relative m-0 mt-3 grid list-none gap-y-1 p-0" style={grid}>
          {rows.map((row, i) => {
            const active = activeId != null && row.message.id === activeId;
            const self = row.direction === "self";
            const kind = labels.kinds[row.kind];
            const route = self
              ? labels.self(nameOf(row.fromIndex), kind)
              : labels.message(nameOf(row.fromIndex), nameOf(row.toIndex), kind);
            return (
              <li
                key={row.message.id}
                data-sequence-message=""
                data-kind={row.kind}
                data-direction={row.direction}
                {...(active ? { "data-active": "", "aria-current": "step" as const } : {})}
                className={cn(
                  "min-w-0 py-1.5",
                  row.kind === "reply" ? "text-muted-foreground" : "text-foreground",
                  active && "text-primary",
                )}
                style={{
                  gridColumn: `${row.start + 1} / span ${row.span}`,
                  gridRow: i + 1,
                  // 起点生命线在第一列中心 = 区域宽度的 1/(2*span)。自调用只让左边，右边留给文案。
                  ...(self
                    ? { paddingLeft: `${100 / (row.span * 2)}%` }
                    : { paddingInline: `${100 / (row.span * 2)}%` }),
                }}
              >
                <span
                  className={cn(
                    "block text-sm leading-snug break-words",
                    self ? "pl-2 text-left" : "px-2 text-center",
                    active && "font-medium",
                  )}
                >
                  <span className="sr-only">
                    {autoNumber ? `${row.number}. ` : ""}
                    {route}
                  </span>
                  {autoNumber ? (
                    <span
                      aria-hidden
                      className={cn(
                        "mr-1.5 inline-flex size-5 items-center justify-center rounded-full align-[1px] text-xs tabular-nums",
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {row.number}
                    </span>
                  ) : null}
                  {row.message.label}
                </span>
                <MessageArrow row={row} />
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
