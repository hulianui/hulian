"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import { usePaperContext } from "./paper-context";
import { letterOf, usePaperLabels } from "./paper-labels";
import type { FigureRenderContext, PaperFigureProps } from "./paper.types";

// 论文里的一张图：
//  · 状态是任意值，外加一组有名字的预设。正文引用、打印态、分图都只认预设名；
//    滑块之类的连续操作用 setState 直接给值，此时 stateKey 为 null。
//  · children 是「状态 → 画面」的函数。打印分图就是同一个函数在几个预设上各调一次，
//    所以画面必须只由 state 决定 —— 这是对写图的人唯一的硬约束。
//  · 打印形态下主图画 printState、分图展开、控件不渲染；@media print 再兜一层 print:hidden。
//  · 编号走 CSS 计数器，服务端渲染就有号；FigRef 用 Paper 注册表按 DOM 顺序取号，两边顺序一致。

const HIGHLIGHT_MS = 1200;

export function PaperFigure<S>({
  id,
  states,
  defaultState,
  printState,
  printSubfigures,
  caption,
  describe,
  subfigureLabel,
  children,
  controls,
  onStateChange,
  className,
  ref,
  ...rest
}: PaperFigureProps<S>) {
  const paper = usePaperContext();
  const labels = usePaperLabels();
  const mode = paper?.mode ?? "read";
  const keys = Object.keys(states);

  if (keys.length === 0) warnOnce(`PaperFigure:empty:${id}`, `[PaperFigure] 图 "${id}" 的 states 是空的。`);
  if (defaultState !== undefined && !(defaultState in states)) {
    warnOnce(`PaperFigure:default:${id}`, `[PaperFigure] 图 "${id}" 的 defaultState "${defaultState}" 不在 states 里，改用第一个预设。`);
  }
  if (printState !== undefined && !(printState in states)) {
    warnOnce(`PaperFigure:print:${id}`, `[PaperFigure] 图 "${id}" 的 printState "${printState}" 不在 states 里，改用初始预设。`);
  }
  const subKeys = (printSubfigures ?? []).filter((k) => {
    if (k in states) return true;
    warnOnce(`PaperFigure:sub:${id}:${k}`, `[PaperFigure] 图 "${id}" 的分图 "${k}" 不在 states 里，不画。`);
    return false;
  });

  const initialKey = defaultState !== undefined && defaultState in states ? defaultState : keys[0];
  const [current, setCurrent] = useState<{ key: string | null; value: S }>(() => ({
    key: initialKey ?? null,
    value: states[initialKey],
  }));

  const statesRef = useRef(states);
  statesRef.current = states;
  const onChangeRef = useRef(onStateChange);
  onChangeRef.current = onStateChange;

  const select = useCallback((key: string) => {
    const latest = statesRef.current;
    if (!(key in latest)) {
      warnOnce(`PaperFigure:select:${key}`, `[PaperFigure] 没有名为 "${key}" 的预设。`);
      return;
    }
    setCurrent({ key, value: latest[key] });
    onChangeRef.current?.(latest[key], key);
  }, []);

  const setState = useCallback((value: S) => {
    setCurrent({ key: null, value });
    onChangeRef.current?.(value, null);
  }, []);

  const [highlighted, setHighlighted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const highlight = useCallback(() => {
    clearTimeout(timer.current);
    setHighlighted(true);
    timer.current = setTimeout(() => setHighlighted(false), HIGHLIGHT_MS);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const node = useRef<HTMLElement | null>(null);
  const register = paper?.register;
  useEffect(() => {
    if (!register) return;
    return register({
      id,
      element: () => node.current,
      has: (key) => key in statesRef.current,
      select,
      highlight,
    });
  }, [register, id, select, highlight]);

  const print = mode === "print";
  const printKey = printState !== undefined && printState in states ? printState : initialKey;
  // 预设内容可能随 props 更新：当前是某个预设时总取最新的那一份。
  const liveValue = current.key !== null && current.key in states ? states[current.key] : current.value;
  const shownKey = print ? (printKey ?? null) : current.key;
  const shownValue = print ? states[printKey] : liveValue;

  const contextFor = (state: S, stateKey: string | null): FigureRenderContext<S> => ({
    state,
    stateKey,
    select,
    setState,
    mode,
  });
  const shown = contextFor(shownValue, shownKey);
  const description = describe?.(shownValue, shownKey);
  const hasDescription = description !== undefined && description !== null && description !== "";

  const labelOf = (key: string, index: number): ReactNode => {
    if (subfigureLabel) return subfigureLabel(key, index);
    const text = describe?.(states[key], key);
    return (
      <>
        ({letterOf(index)}){text ? <> {text}</> : null}
      </>
    );
  };

  return (
    <figure
      {...rest}
      id={id}
      ref={mergeRefs<HTMLElement>(ref, node)}
      data-paper-figure=""
      data-state={shownKey ?? undefined}
      data-highlight={highlighted ? "" : undefined}
      className={cn(
        "relative mx-0 my-8 min-w-0 rounded-[var(--radius)] [counter-increment:paper-figure]",
        "ring-offset-4 ring-offset-bg transition-shadow duration-300 data-[highlight]:ring-2 data-[highlight]:ring-primary/40",
        "motion-reduce:transition-none break-inside-avoid",
        className,
      )}
    >
      <div data-paper-figure-body="" className="min-w-0">
        {keys.length > 0 ? children(shownValue, shown) : null}
      </div>

      {print && subKeys.length > 0 ? (
        <div
          data-paper-subfigures=""
          className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 sm:grid-cols-3"
        >
          {subKeys.map((key, index) => (
            <div key={key} data-paper-subfigure={key} className="min-w-0">
              <div aria-hidden className="min-w-0">
                {children(states[key], contextFor(states[key], key))}
              </div>
              <div className="mt-1 text-center text-xs leading-snug">{labelOf(key, index)}</div>
            </div>
          ))}
        </div>
      ) : null}

      <figcaption className="mt-3 text-sm leading-relaxed">
        <span data-paper-figure-label="">
          {labels.figure} <span className="before:content-[counter(paper-figure)]" />
          {labels.separator}
        </span>
        {caption}
        {hasDescription ? (
          <span data-paper-figure-state="" aria-live="polite" className="mt-1 block text-muted-foreground">
            {description}
          </span>
        ) : null}
      </figcaption>

      {!print && controls ? (
        <div
          data-paper-figure-controls=""
          className="mt-3 flex flex-wrap items-center gap-2 font-sans text-sm text-muted-foreground print:hidden"
        >
          {controls(shown)}
        </div>
      ) : null}
    </figure>
  );
}
