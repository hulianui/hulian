"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { PaperContext, usePaperContext, type FigureEntry, type PaperContextValue } from "./paper-context";
import type { PaperMode, PaperProps } from "./paper.types";

// 论文容器：
//  · 持有图的注册表。图在挂载时登记 id 和「切到某个预设」的句柄，FigRef 按 id 找图；
//    图号按 DOM 顺序现算，和图注里 CSS 计数器给出的编号是同一个顺序。
//  · 持有呈现形态（阅读 / 打印）。浏览器打印前 flushSync 切到 print，保证打出来的是打印态
//    而不是读者此刻停在的那一步；打印完切回。
//  · 图注编号用 CSS 计数器（counter-reset 在这里，counter-increment 在每张图上），
//    服务端渲染和打印时都有号，不等 JS。
//  · 正文衬线：论文是衬线排版的体裁。tokens 刻意没有 --font-serif（#319），这里只在 Paper 内部
//    给一条默认字体栈，消费方用 --paper-font 覆盖。

const FONT = 'var(--paper-font, "STIX Two Text", "Times New Roman", "Songti SC", "SimSun", serif)';

function documentOrder(a: HTMLElement | null, b: HTMLElement | null) {
  if (!a || !b || a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

export function Paper({
  as: Tag = "article",
  mode,
  defaultMode = "read",
  onModeChange,
  labels,
  className,
  style,
  children,
  ref,
  ...rest
}: PaperProps) {
  const [innerMode, setInnerMode] = useState<PaperMode>(defaultMode);
  const [printing, setPrinting] = useState(false);
  const current: PaperMode = printing ? "print" : (mode ?? innerMode);

  const setMode = useCallback(
    (next: PaperMode) => {
      if (mode === undefined) setInnerMode(next);
      onModeChange?.(next);
    },
    [mode, onModeChange],
  );

  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const entries = useRef(new Map<string, FigureEntry>());
  const [revision, setRevision] = useState(0);

  const register = useCallback((entry: FigureEntry) => {
    const map = entries.current;
    if (map.has(entry.id) && map.get(entry.id) !== entry) {
      warnOnce(`Paper:duplicate:${entry.id}`, `[Paper] 图 id "${entry.id}" 重复，引用只会找到后挂载的那一张。`);
    }
    map.set(entry.id, entry);
    setRevision((r) => r + 1);
    return () => {
      if (map.get(entry.id) === entry) map.delete(entry.id);
      setRevision((r) => r + 1);
    };
  }, []);

  const find = useCallback((id: string) => entries.current.get(id), []);

  const numberOf = useCallback((id: string) => {
    const list = [...entries.current.values()].sort((a, b) => documentOrder(a.element(), b.element()));
    const index = list.findIndex((e) => e.id === id);
    return index < 0 ? undefined : index + 1;
  }, []);

  const value = useMemo<PaperContextValue>(
    () => ({ mode: current, setMode, register, find, numberOf, revision, labels }),
    [current, setMode, register, find, numberOf, revision, labels],
  );

  return (
    <PaperContext.Provider value={value}>
      <Tag
        {...rest}
        ref={ref}
        data-paper=""
        data-mode={current}
        className={cn("text-foreground [counter-reset:paper-figure]", className)}
        style={{ fontFamily: FONT, ...style } as CSSProperties}
      >
        {children}
      </Tag>
    </PaperContext.Provider>
  );
}

/**
 * 在 `Paper` 内部读写呈现形态，给自己做的工具栏用。
 * 在 `Paper` 外调用时返回 `read` 和一个空操作。
 */
export function usePaperMode(): [PaperMode, (mode: PaperMode) => void] {
  const ctx = usePaperContext();
  return [ctx?.mode ?? "read", ctx?.setMode ?? noop];
}

function noop() {}
