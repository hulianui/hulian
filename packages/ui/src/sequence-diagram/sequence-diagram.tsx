"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import { useComponentLocale } from "../config/locale-context";
import {
  analyzeSequence,
  type SequenceMessageRow,
  type SequenceNoteRow,
} from "./sequence-diagram-layout";
import type {
  SequenceDiagramProps,
  SequenceIssue,
  SequenceMessageKind,
} from "./sequence-diagram.types";

// 时序图（只读）：
//  · 三层同列网格叠放：生命线（aria-hidden）→ 参与者列头 <ul> → 消息与注释 <ol>。三层用同一个
//    grid-template-columns，所以消息箭头的两端天然落在生命线中心，不需要测量 DOM。
//  · 箭头两端要从「列中心」起止：一条消息占 span 列，左右各让出半列，即 padding-inline =
//    100% / (2 * span)。百分比 padding 相对网格区域宽度，正好是这 span 列的总宽。
//  · 箭头线画在 aria-hidden 的装饰层里；读屏念的是每个 <li> 里的「甲 发给 乙（同步调用）：文案」。
//  · 注释和消息同在 <ol> 里、各占一行，所以「数组顺序 = 时间顺序」对两者一视同仁。
//  · 副作用只有两件：量一下自己是否横向溢出——溢出时才进 Tab 顺序（键盘能左右滚），不溢出时不制造
//    一个什么也做不了的焦点；activeId 变化时把当前这一步横向滚进视野（只滚图自己，不动页面）。
//  · 配色走语义令牌、只作第二通道：同步 primary、异步 info、返回 muted，注释 warning-subtle。
//    类型首先靠线型和箭头形状区分，颜色去掉也读得出来。
//  · 动效：行按顺序淡入、箭头线从发送方一端伸到接收方，各只在挂载时播一次；全部挂在 motion-safe 下，
//    减弱动效时直接是终态。关键帧在 @hulianui/tokens 的 preset-core.css；消费方 tokens 版本过旧、
//    找不到关键帧时动画名无效，元素直接显示终态，不会卡在透明。

/** 第 i 行入场的延迟。超过 15 行不再往后错，长图不至于等半天。 */
const enterDelay = (i: number) => `${Math.min(i, 15) * 40}ms`;
const ENTER = "motion-safe:animate-[hulian-sequence-in_240ms_ease-out_both]";

const KIND_COLOR: Record<SequenceMessageKind, string> = {
  sync: "text-primary",
  async: "text-info",
  reply: "text-muted-foreground",
};

const DEFAULT_LABELS = {
  diagram: "时序图",
  participants: "参与者",
  messages: "消息",
  message: (from: string, to: string, kind: string) => `${from} 发给 ${to}（${kind}）：`,
  self: (from: string, kind: string) => `${from} 发给自己（${kind}）：`,
  kinds: { sync: "同步调用", async: "异步消息", reply: "返回" } as Record<SequenceMessageKind, string>,
  note: (targets: string[]) =>
    targets.length > 1 ? `注释（${targets[0]} 与 ${targets[1]} 之间）：` : `注释（${targets[0]}）：`,
  empty: "暂无消息",
};

function describeIssue(issue: SequenceIssue) {
  switch (issue.code) {
    case "duplicate-participant":
      return `participants[${issue.index}] 的 id "${issue.id}" 重复，这一列不画`;
    case "duplicate-item":
      return `messages[${issue.index}] 的 id "${issue.id}" 重复，这一条不画`;
    case "unknown-participant":
      return `messages[${issue.index}]（id "${issue.id}"）引用了不存在的参与者 "${issue.ref}"，这一条不画`;
  }
}

function ArrowHead({
  kind,
  className,
  style,
}: {
  kind: SequenceMessageKind;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 10 10"
      aria-hidden
      style={style}
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

function MessageArrow({ row, delay }: { row: SequenceMessageRow; delay: string }) {
  const dashed = row.kind === "reply";
  const color = KIND_COLOR[row.kind];
  if (row.direction === "self") {
    return (
      <span
        aria-hidden
        data-sequence-arrow=""
        className={cn("relative mt-1 block h-4 w-8", color, ENTER)}
        style={{ animationDelay: delay }}
      >
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
    <span aria-hidden data-sequence-arrow="" className={cn("relative mt-1 block h-2.5", color)}>
      <span
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-[1.5px] border-current",
          dashed ? "border-dashed" : "border-solid",
          // 从发送方那一端伸出去
          row.direction === "right" ? "origin-left" : "origin-right",
          "motion-safe:animate-[hulian-sequence-draw_320ms_ease-out_both]",
        )}
        style={{ animationDelay: delay }}
      />
      <ArrowHead
        kind={row.kind}
        className={cn(
          row.direction === "right" ? "top-0 -right-px" : "top-0 -left-px rotate-180",
          "motion-safe:animate-[hulian-sequence-in_160ms_ease-out_both]",
        )}
        style={{ animationDelay: `calc(${delay} + 240ms)` }}
      />
    </span>
  );
}

/** 横跨两条生命线的注释，两端各越过生命线 1.5rem，看得出它罩住了这两条线。 */
function notePadding(row: SequenceNoteRow): CSSProperties {
  if (row.targets.length === 1) return {};
  return { paddingInline: `max(0px, calc(${100 / (row.span * 2)}% - 1.5rem))` };
}

export function SequenceDiagram({
  participants,
  messages,
  title,
  autoNumber = false,
  activeId,
  minColumnWidth = 160,
  className,
  ref,
  ...rest
}: SequenceDiagramProps) {
  const locale = useComponentLocale().sequenceDiagram;
  const labels = { ...DEFAULT_LABELS, ...locale, kinds: { ...DEFAULT_LABELS.kinds, ...locale?.kinds } };
  const { participants: columnsOf, rows, issues } = analyzeSequence(participants, messages);
  for (const issue of issues) {
    warnOnce(`SequenceDiagram:${issue.code}`, `[SequenceDiagram] ${describeIssue(issue)}。`);
  }
  const nameOf = (index: number) => columnsOf[index]?.label ?? "";
  const columns = Math.max(columnsOf.length, 1);
  const grid: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(${minColumnWidth}px, 1fr))`,
  };

  const [node, setNode] = useState<HTMLElement | null>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return;
    const measure = () => setScrollable(node.scrollWidth - node.clientWidth > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, [node]);

  // activeId 变了（不含首次挂载）才滚：横向把当前这一步滚进图的可视区，不碰页面的纵向滚动。
  const previousActive = useRef(activeId);
  useEffect(() => {
    if (previousActive.current === activeId) return;
    previousActive.current = activeId;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    const target = node.querySelector<HTMLElement>("[data-active]");
    if (!target) return;
    const box = node.getBoundingClientRect();
    const item = target.getBoundingClientRect();
    if (item.left >= box.left && item.right <= box.right) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    node.scrollTo({
      left: node.scrollLeft + item.left - box.left - Math.max(0, (box.width - item.width) / 2),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [activeId, node]);

  return (
    <figure
      {...rest}
      ref={mergeRefs<HTMLElement>(ref, setNode)}
      aria-label={title ?? labels.diagram}
      tabIndex={scrollable ? 0 : undefined}
      data-sequence-diagram=""
      data-scrollable={scrollable ? "" : undefined}
      className={cn(
        "m-0 min-w-0 overflow-x-auto rounded-[var(--radius)] text-foreground outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className,
      )}
    >
      <div className="relative pb-4" style={{ minWidth: columns * minColumnWidth }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 grid" style={grid}>
          {columnsOf.map((p) => (
            <span key={p.id} data-sequence-lifeline="" className="mx-auto h-full w-px bg-border" />
          ))}
        </div>

        {columnsOf.length > 0 ? (
          <ul aria-label={labels.participants} className="relative m-0 grid list-none p-0" style={grid}>
            {columnsOf.map((p) => (
              <li key={p.id} data-sequence-participant="" className="flex min-w-0 justify-center px-2">
                <span className="flex min-w-0 max-w-full flex-col items-center rounded-[var(--radius)] border border-border border-t-2 border-t-primary bg-surface px-3 py-2 text-center shadow-xs">
                  <span className="max-w-full text-sm font-medium [overflow-wrap:anywhere]">{p.label}</span>
                  {p.description ? (
                    <span className="max-w-full text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      {p.description}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {rows.length === 0 ? (
          <p data-sequence-empty="" className="relative m-0 mt-3 px-2 py-6 text-center text-sm text-muted-foreground">
            {labels.empty}
          </p>
        ) : (
          <ol aria-label={labels.messages} className="relative m-0 mt-3 grid list-none gap-y-1 p-0" style={grid}>
            {rows.map((row, i) => {
              const id = row.type === "note" ? row.note.id : row.message.id;
              const active = activeId != null && id === activeId;
              const placement: CSSProperties = {
                gridColumn: `${row.start + 1} / span ${row.span}`,
                gridRow: i + 1,
              };
              const activeProps = active ? { "data-active": "", "aria-current": "step" as const } : {};

              if (row.type === "note") {
                const single = row.targets.length === 1;
                return (
                  <li
                    key={id}
                    data-sequence-note=""
                    {...activeProps}
                    className={cn("flex min-w-0 justify-center py-1", single && "px-2", ENTER)}
                    style={{ ...placement, ...notePadding(row), animationDelay: enterDelay(i) }}
                  >
                    <span
                      className={cn(
                        "block min-w-0 rounded-[var(--radius)] border border-warning-border bg-warning-subtle px-2.5 py-1.5 text-sm leading-snug text-foreground transition-shadow duration-150 [overflow-wrap:anywhere]",
                        single ? "max-w-full" : "w-full text-center",
                        active && "ring-2 ring-primary",
                      )}
                    >
                      <span className="sr-only">{labels.note(row.targets.map(nameOf))}</span>
                      {row.note.label}
                    </span>
                  </li>
                );
              }

              const self = row.direction === "self";
              const kind = labels.kinds[row.kind];
              const route = self
                ? labels.self(nameOf(row.fromIndex), kind)
                : labels.message(nameOf(row.fromIndex), nameOf(row.toIndex), kind);
              return (
                <li
                  key={id}
                  data-sequence-message=""
                  data-kind={row.kind}
                  data-direction={row.direction}
                  {...activeProps}
                  className={cn("min-w-0 py-1.5", ENTER)}
                  style={{
                    ...placement,
                    animationDelay: enterDelay(i),
                    // 起点生命线在第一列中心 = 区域宽度的 1/(2*span)。自调用只让左边，右边留给文案。
                    ...(self
                      ? { paddingLeft: `${100 / (row.span * 2)}%` }
                      : { paddingInline: `${100 / (row.span * 2)}%` }),
                  }}
                >
                  <span
                    className={cn(
                      "block rounded-[min(var(--radius),0.375rem)] text-sm leading-snug transition-colors duration-150 [overflow-wrap:anywhere]",
                      self ? "pl-2 text-left" : "px-2 text-center",
                      row.kind === "reply" ? "text-muted-foreground" : "text-foreground",
                      active && "bg-primary-subtle font-medium text-primary",
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
                  <MessageArrow row={row} delay={enterDelay(i)} />
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </figure>
  );
}
