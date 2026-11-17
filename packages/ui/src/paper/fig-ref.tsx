"use client";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { usePaperContext } from "./paper-context";
import { usePaperLabels } from "./paper-labels";
import type { FigRefProps } from "./paper.types";

// 正文里的图引用。点击：把目标图切到 state 预设 → 图不在视野里就滚过去 → 描边闪一下。
// 本体是 <a href="#id">：没有 JS 或不在 Paper 里时，退化成普通锚点跳转。
// 打印形态下去掉链接色和下划线，读起来就是正文里的「图 1(b)」。

function reveal(el: HTMLElement) {
  if (typeof el.getBoundingClientRect !== "function" || typeof el.scrollIntoView !== "function") return;
  const rect = el.getBoundingClientRect();
  const viewport = window.innerHeight;
  if (rect.top >= 0 && rect.bottom <= viewport) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: rect.height > viewport * 0.8 ? "start" : "center",
  });
}

export function FigRef({ to, state, children, className, onClick, ref, ...rest }: FigRefProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const print = paper?.mode === "print";

  // 图号要等图挂载登记后才知道；只有不传 children 时才用得上。
  const [number, setNumber] = useState<number>();
  const numberOf = paper?.numberOf;
  const revision = paper?.revision;
  useEffect(() => {
    if (children === undefined && numberOf) setNumber(numberOf(to));
  }, [children, numberOf, revision, to]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !paper) return;
    const entry = paper.find(to);
    if (!entry) {
      warnOnce(`FigRef:missing:${to}`, `[FigRef] 找不到 id 为 "${to}" 的图。`);
      return;
    }
    event.preventDefault();
    if (state !== undefined) {
      if (entry.has(state)) entry.select(state);
      else warnOnce(`FigRef:state:${to}:${state}`, `[FigRef] 图 "${to}" 没有名为 "${state}" 的预设。`);
    }
    const el = entry.element();
    if (el) reveal(el);
    entry.highlight();
  };

  return (
    <a
      {...rest}
      ref={ref}
      href={`#${to}`}
      data-fig-ref=""
      data-state={state}
      onClick={handleClick}
      className={cn(
        "rounded-sm",
        print
          ? "text-inherit no-underline"
          : "text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary",
        "print:text-inherit print:no-underline",
        className,
      )}
    >
      {children ?? `${labels.figure} ${number ?? ""}`.trim()}
    </a>
  );
}
