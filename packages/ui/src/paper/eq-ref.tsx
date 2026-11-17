"use client";
import { useEffect, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { navigatePaper } from "./paper-navigate";
import { usePaperContext } from "./paper-context";
import { usePaperLabels } from "./paper-labels";
import type { EqRefProps } from "./paper.types";

// 正文里的公式引用，和 FigRef 同一套手感：点击滚到公式（不在视野里时）并描边一下。
// 本体是 <a href="#id">：没有 JS 或不在 Paper 里时退化成普通锚点。不依赖 KaTeX，从主入口导出。
// 号从 Paper 的公式注册表按文档顺序取（要等公式挂载登记后才有），和公式右侧 CSS 计数器给的号一致；
// 手写覆盖的号原样显示。打印形态下去掉链接色和下划线。

const noopSubscribe = () => () => {};
const zero = () => 0;

export function EqRef({ to, children, className, onClick, ref, ...rest }: EqRefProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const print = paper?.mode === "print";
  const store = paper?.equations;

  const version = useSyncExternalStore(store?.subscribe ?? noopSubscribe, store?.version ?? zero, zero);
  const [label, setLabel] = useState<ReactNode>();
  useEffect(() => {
    if (children !== undefined || !store) return;
    const next = store.labelOf(to);
    setLabel(next);
    if (next === undefined && store.find(to)) {
      warnOnce(`EqRef:unnumbered:${to}`, `[EqRef] 公式 "${to}" 没有编号（number 为 null / false），引用里只有「${labels.equation}」。`);
    }
  }, [children, store, version, to, labels.equation]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (navigatePaper(paper, { kind: "equation", id: to }, "EqRef")) event.preventDefault();
  };

  return (
    <a
      {...rest}
      ref={ref}
      href={`#${to}`}
      data-eq-ref=""
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
      {children ?? (
        <>
          {labels.equation}
          {label !== undefined && label !== null ? <> ({label})</> : null}
        </>
      )}
    </a>
  );
}
