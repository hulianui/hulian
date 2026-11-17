"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import {
  PaperContext,
  usePaperContext,
  type FigureEntry,
  type CitationStore,
  type EquationEntry,
  type EquationStore,
  type PaperContextValue,
  type TermStore,
} from "./paper-context";
import { PaperExportHost, type ExportHandle } from "./paper-export";
import type { FigureSvgExportOptions, PaperMode, PaperProps } from "./paper.types";

// 论文容器：
//  · 持有图的注册表。图在挂载时登记 id 和「切到某个预设」的句柄，FigRef 按 id 找图；
//    图号按 DOM 顺序现算，和图注里 CSS 计数器给出的编号是同一个顺序。
//  · 持有呈现形态（阅读 / 打印）。浏览器打印前 flushSync 切到 print，保证打出来的是打印态
//    而不是读者此刻停在的那一步；打印完切回。
//  · 图注编号和公式编号都用 CSS 计数器（counter-reset 在这里，counter-increment 在每张图 / 每条自动编号的公式上），
//    服务端渲染和打印时都有号，不等 JS。FigRef / EqRef 按注册表里的 DOM 顺序取号，两边顺序一致。
//  · 正文衬线：论文是衬线排版的体裁。西文先用学术排版常见的 STIX Two Text / Times New Roman，
//    其余（中文、兜底）回落到 tokens 的 --hl-font-serif（#389）；没接 tokens 时落到 serif 通用族，
//    汉字由浏览器交给系统宋体。消费方用 --paper-font 整个替换。

export const PAPER_FONT = 'var(--paper-font, "STIX Two Text", "Times New Roman", var(--hl-font-serif, serif))';

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

  // 图内容的小 store：图外重画图的地方（演示层）用 useSyncExternalStore 订阅。
  // 版本号只增不减；没有订阅者时 touch 只是加一个数，不触发任何渲染。
  const version = useRef(0);
  const listeners = useRef(new Set<() => void>());
  const touchFigures = useCallback(() => {
    version.current += 1;
    for (const listener of listeners.current) listener();
  }, []);
  const subscribeFigures = useCallback((listener: () => void) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);
  const figuresVersion = useCallback(() => version.current, []);

  const register = useCallback((entry: FigureEntry) => {
    const map = entries.current;
    if (map.has(entry.id) && map.get(entry.id) !== entry) {
      warnOnce(`Paper:duplicate:${entry.id}`, `[Paper] 图 id "${entry.id}" 重复，引用只会找到后挂载的那一张。`);
    }
    map.set(entry.id, entry);
    setRevision((r) => r + 1);
    touchFigures();
    return () => {
      if (map.get(entry.id) === entry) map.delete(entry.id);
      setRevision((r) => r + 1);
      touchFigures();
    };
  }, [touchFigures]);

  const find = useCallback((id: string) => entries.current.get(id), []);

  const figures = useCallback(
    () => [...entries.current.values()].sort((a, b) => documentOrder(a.element(), b.element())),
    [],
  );

  const numberOf = useCallback(
    (id: string) => {
      const index = figures().findIndex((e) => e.id === id);
      return index < 0 ? undefined : index + 1;
    },
    [figures],
  );

  // 公式项高亮：悬停 / 聚焦公式里的项或图的控件时写入，两边各自订阅，不让整篇论文重渲染。
  const [terms] = useState<TermStore>(() => {
    let active: string | null = null;
    const subs = new Set<() => void>();
    return {
      subscribe(listener) {
        subs.add(listener);
        return () => {
          subs.delete(listener);
        };
      },
      get: () => active,
      set(name) {
        if (name === active) return;
        active = name;
        for (const listener of subs) listener();
      },
    };
  });

  // 公式注册表：所有公式都登记（自动编号要数全部），EqRef 订阅版本号重新取号。
  const [equations] = useState<EquationStore>(() => {
    const entries = new Set<EquationEntry>();
    const subs = new Set<() => void>();
    let version = 0;
    const find = (id: string) => {
      let hit: EquationEntry | undefined;
      for (const entry of entries) if (entry.id === id) hit = entry;
      return hit;
    };
    const emit = () => {
      version += 1;
      for (const listener of subs) listener();
    };
    return {
      subscribe(listener) {
        subs.add(listener);
        return () => {
          subs.delete(listener);
        };
      },
      version: () => version,
      register(entry) {
        if (entry.id !== undefined) {
          for (const other of entries) {
            if (other.id === entry.id) {
              warnOnce(`Paper:equation:${entry.id}`, `[Paper] 公式 id "${entry.id}" 重复，EqRef 只会找到后挂载的那一条。`);
            }
          }
        }
        entries.add(entry);
        emit();
        return () => {
          entries.delete(entry);
          emit();
        };
      },
      touch: emit,
      find,
      labelOf(id) {
        const target = find(id);
        if (!target) return undefined;
        let n = 0;
        for (const entry of [...entries].sort((a, b) => documentOrder(a.element(), b.element()))) {
          const numbering = entry.numbering();
          if (numbering.auto) n += 1;
          if (entry === target) return numbering.auto ? n : (numbering.label ?? undefined);
        }
        return undefined;
      },
    };
  });

  // 参考文献编号：同一篇论文只该有一份 Bibliography，登记第二份时告警，后登记的生效。
  const [citations] = useState<CitationStore>(() => {
    let map: ReadonlyMap<string, number> = new Map();
    let owner: symbol | null = null;
    const subs = new Set<() => void>();
    const emit = () => {
      for (const listener of subs) listener();
    };
    return {
      subscribe(listener) {
        subs.add(listener);
        return () => {
          subs.delete(listener);
        };
      },
      get: () => map,
      register(ids) {
        const me = Symbol("bibliography");
        if (owner) warnOnce("Paper:bibliography", "[Paper] 同一个 Paper 里有不止一份 Bibliography，Cite 只按最后登记的那份编号。");
        owner = me;
        map = new Map(ids.map((id, i) => [id, i + 1]));
        emit();
        return () => {
          if (owner !== me) return;
          owner = null;
          map = new Map();
          emit();
        };
      },
      highlight(id) {
        const el = typeof document === "undefined" ? null : document.getElementById(id);
        if (!el?.hasAttribute("data-paper-reference")) return;
        el.setAttribute("data-highlight", "");
        setTimeout(() => el.removeAttribute("data-highlight"), 1200);
      },
    };
  });

  const exportHandle = useRef<ExportHandle | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const root = useCallback(() => rootRef.current, []);
  const tagRef = useMemo(() => mergeRefs<HTMLElement>(rootRef, ref), [ref]);
  const exportFigureSvg = useCallback((id: string, stateKey: string, options: FigureSvgExportOptions = {}) => {
    const entry = entries.current.get(id);
    if (!entry) return Promise.reject(new Error(`[Paper] 找不到 id 为 "${id}" 的图，无法导出。`));
    if (!entry.has(stateKey)) {
      return Promise.reject(new Error(`[Paper] 图 "${id}" 没有名为 "${stateKey}" 的预设，无法导出。`));
    }
    const host = exportHandle.current;
    if (!host) return Promise.reject(new Error("[Paper] Paper 还没挂载，无法导出。"));
    return host.run(entry, stateKey, options);
  }, []);

  const value = useMemo<PaperContextValue>(
    () => ({
      mode: current,
      root,
      setMode,
      register,
      find,
      numberOf,
      revision,
      labels,
      figures,
      subscribeFigures,
      figuresVersion,
      touchFigures,
      exportFigureSvg,
      terms,
      citations,
      equations,
    }),
    [
      current,
      root,
      setMode,
      register,
      find,
      numberOf,
      revision,
      labels,
      figures,
      subscribeFigures,
      figuresVersion,
      touchFigures,
      exportFigureSvg,
      terms,
      citations,
      equations,
    ],
  );

  return (
    <PaperContext.Provider value={value}>
      <Tag
        {...rest}
        ref={tagRef}
        data-paper=""
        data-mode={current}
        className={cn("text-foreground [counter-reset:paper-figure_paper-equation]", className)}
        style={{ fontFamily: PAPER_FONT, ...style } as CSSProperties}
      >
        {children}
        <PaperExportHost handle={exportHandle} />
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
