"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../button";
import { ChevronDown, ChevronUp } from "../_icons";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import { usePaperContext, type FigureView } from "./paper-context";
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
  presentStates,
  caption,
  hideCaption,
  hideDescription,
  collapsibleControls,
  defaultControlsCollapsed,
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
  const subKeysRef = useRef(subKeys);
  subKeysRef.current = subKeys;
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

  // 控件行可收起：首页那种「先看图」的场合，读者不必每次都被一排按钮挡着。
  // 收起后控件行里只剩「显示控件」按钮，位置和展开时一样贴右，手不会跑。
  const collapsible = Boolean(collapsibleControls) && controls !== undefined;
  const [controlsCollapsed, setControlsCollapsed] = useState(Boolean(defaultControlsCollapsed));

  // 演示层在图外重画这张图：每次渲染把最新的画法放进 ref，提交后通知订阅方。
  const view = useRef<FigureView>(null as unknown as FigureView);
  view.current = {
    states: states as Readonly<Record<string, unknown>>,
    present: (presentStates ?? keys).filter((k) => k in states),
    caption,
    describe: describe as FigureView["describe"],
    render: children as FigureView["render"],
    controls: controls as FigureView["controls"],
  };
  const touch = paper?.touchFigures;
  useEffect(() => {
    touch?.();
  });

  const liveRef = useRef<S>(current.value);

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
      view: () => view.current,
      getState: () => liveRef.current,
      setState: (value) => setState(value as S),
      subfigureIndex: (key) => subKeysRef.current.indexOf(key),
    });
  }, [register, id, select, highlight, setState]);

  const print = mode === "print";
  const printKey = printState !== undefined && printState in states ? printState : initialKey;
  // 预设内容可能随 props 更新：当前是某个预设时总取最新的那一份。
  const liveValue = current.key !== null && current.key in states ? states[current.key] : current.value;
  liveRef.current = liveValue;
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
        "group/figure relative mx-0 my-8 min-w-0 rounded-[var(--radius)] [counter-increment:paper-figure]",
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

      {!hideCaption ? (
        <figcaption className="mt-3 text-sm leading-relaxed">
          <span data-paper-figure-label="">
            {labels.figure} <span className="before:content-[counter(paper-figure)]" />
            {labels.separator}
          </span>
          {caption}
          {hasDescription && !hideDescription ? (
            <span data-paper-figure-state="" aria-live="polite" className="mt-1 block text-muted-foreground">
              {description}
            </span>
          ) : null}
        </figcaption>
      ) : null}

      {!print && controls ? (
        <div
          data-paper-figure-controls=""
          data-collapsed={collapsible && controlsCollapsed ? "" : undefined}
          // 收起时只是藏起来、不卸载：播放器（Stepper）的计时与状态活在控件里，
          // 卸载掉会把「收起来只看画面」变成「画面也停了」。
          // hidden 属性给读屏 / 角色查询用，hidden 类给没装 preflight 的消费方兜底。
          hidden={collapsible && controlsCollapsed}
          className={cn(
            "mt-3 flex flex-wrap items-center gap-2 font-sans text-sm text-muted-foreground print:hidden",
            collapsible && controlsCollapsed && "hidden",
          )}
        >
          {controls(shown)}
          {collapsible ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              aria-expanded
              aria-label={labels.hideControls}
              title={labels.hideControls}
              onClick={() => setControlsCollapsed(true)}
              className="ms-auto size-6 shrink-0 px-0"
            >
              <ChevronUp className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* 收起后不留一行占位：图是干净的，控件靠悬停 / 键盘聚焦唤回（触屏常显）。
          收起态在自动播放时仍然能看画面，只是不再有按钮压在图下。 */}
      {!print && collapsible && controlsCollapsed ? (
        <Button
          type="button"
          size="xs"
          variant="outline"
          aria-expanded={false}
          aria-label={labels.showControls}
          title={labels.showControls}
          onClick={() => setControlsCollapsed(false)}
          className="absolute right-2 top-2 z-10 size-7 shrink-0 px-0 opacity-0 shadow-sm transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100 group-hover/figure:opacity-100 group-focus-within/figure:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100 print:hidden"
        >
          <ChevronDown className="size-3.5" />
        </Button>
      ) : null}
    </figure>
  );
}
