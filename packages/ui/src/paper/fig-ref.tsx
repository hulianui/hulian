"use client";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "../lib/cn";
import { navigatePaper } from "./paper-navigate";
import { usePaperContext } from "./paper-context";
import { letterOf, usePaperLabels } from "./paper-labels";
import type { FigRefProps } from "./paper.types";

// 正文里的图引用。点击：把目标图切到 state 预设 → 图不在视野里就滚过去 → 描边闪一下。
// 本体是 <a href="#id">：没有 JS 或不在 Paper 里时，退化成普通锚点跳转。
// 打印形态下去掉链接色和下划线，读起来就是正文里的「图 1(b)」。
// 导航本身在 paper-navigate 里，和 SecRef / EqRef / usePaperNavigate 共用一套。

export function FigRef({ to, state, children, className, onClick, ref, ...rest }: FigRefProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const print = paper?.mode === "print";

  // 图号要等图挂载登记后才知道；只有不传 children 时才用得上。
  // state 是这张图的打印分图之一时，号后面跟分图字母「图 1(b)」，与打印版的分图编号一致。
  const [number, setNumber] = useState<number>();
  const [sub, setSub] = useState(-1);
  const numberOf = paper?.numberOf;
  const findFigure = paper?.find;
  const revision = paper?.revision;
  useEffect(() => {
    if (children !== undefined || !numberOf || !findFigure) return;
    setNumber(numberOf(to));
    setSub(state === undefined ? -1 : (findFigure(to)?.subfigureIndex(state) ?? -1));
  }, [children, numberOf, findFigure, revision, to, state]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (navigatePaper(paper, { kind: "figure", id: to, state }, "FigRef")) event.preventDefault();
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
      {children ?? `${labels.figure} ${number ?? ""}${number !== undefined && sub >= 0 ? `(${letterOf(sub)})` : ""}`.trim()}
    </a>
  );
}
