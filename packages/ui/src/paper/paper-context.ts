"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { FigureRenderContext, FigureSvgExportOptions, PaperContentLabels, PaperMode } from "./paper.types";

/**
 * 一张图此刻的「画法」：演示层等图外的消费方拿它在别处重画同一张图。
 * 每次图渲染都会刷新（读的是最新 props），所以只能在渲染期间现取，不要缓存。
 */
export interface FigureView {
  states: Readonly<Record<string, unknown>>;
  /** 演示时依次展示的预设名（已剔除不在 states 里的）。 */
  present: readonly string[];
  caption: ReactNode;
  describe?: (state: unknown, key: string | null) => ReactNode;
  render: (state: unknown, figure: FigureRenderContext<unknown>) => ReactNode;
  controls?: (figure: FigureRenderContext<unknown>) => ReactNode;
}

/** 一张已挂载的图在注册表里留下的句柄。 */
export interface FigureEntry {
  id: string;
  element: () => HTMLElement | null;
  has: (key: string) => boolean;
  select: (key: string) => void;
  /** 短暂描边，告诉读者「引用指的是这张图」。 */
  highlight: () => void;
  view: () => FigureView;
  /** 此刻阅读形态下的状态值（公式项点击时据此算下一个状态）。 */
  getState: () => unknown;
  /** 直接给状态值，等同图内控件的 setState。 */
  setState: (value: unknown) => void;
}

/** 参考文献编号：Bibliography 登记条目顺序，Cite 按 id 取号。 */
export interface CitationStore {
  subscribe: (listener: () => void) => () => void;
  /** id → 编号（从 1 起）。每次登记都换一个新 Map，可以直接当快照比较。 */
  get: () => ReadonlyMap<string, number>;
  /** 登记一份文献列表，返回注销函数。 */
  register: (ids: readonly string[]) => () => void;
  /** 让某一条文献描边闪一下。 */
  highlight: (id: string) => void;
}

/** 公式此刻怎么编号：自动（占 CSS 计数器的一个号）、手写覆盖、或不编号（label 为 null）。 */
export type EquationNumbering = { auto: true } | { auto: false; label: ReactNode };

/** 一条已挂载的公式在注册表里留下的句柄。没有 id 的公式也登记：自动编号要按文档顺序数全部公式。 */
export interface EquationEntry {
  id: string | undefined;
  element: () => HTMLElement | null;
  /** 读最新的 props，所以注册一次即可。 */
  numbering: () => EquationNumbering;
  highlight: () => void;
}

/** 公式注册表：EqRef 按 id 找公式、按文档顺序取号（与 CSS 计数器 paper-equation 的顺序一致）。 */
export interface EquationStore {
  subscribe: (listener: () => void) => () => void;
  /** 注册、注销、任一公式重新渲染都会加一。 */
  version: () => number;
  register: (entry: EquationEntry) => () => void;
  /** 公式提交后调用：编号方式可能变了，通知引用重新取号。 */
  touch: () => void;
  find: (id: string) => EquationEntry | undefined;
  /** 公式此刻显示的编号：自动号是数字，手写覆盖原样返回；不编号或找不到时 undefined。 */
  labelOf: (id: string) => ReactNode | undefined;
}

/** 公式项与图控件之间「当前高亮哪一项」的共享状态。 */
export interface TermStore {
  subscribe: (listener: () => void) => () => void;
  get: () => string | null;
  set: (name: string | null) => void;
}

export interface PaperContextValue {
  mode: PaperMode;
  /** Paper 的根元素。挂在 body 下的演示层靠它取 Paper 的计算字体（`--paper-font` 等覆盖传不过 portal）。 */
  root: () => HTMLElement | null;
  setMode: (mode: PaperMode) => void;
  register: (entry: FigureEntry) => () => void;
  find: (id: string) => FigureEntry | undefined;
  /** 按文档顺序的图号（从 1 起）；未注册返回 undefined。 */
  numberOf: (id: string) => number | undefined;
  /** 注册表每变一次加一，让依赖图号的引用重新取号。 */
  revision: number;
  labels?: PaperContentLabels;
  /** 按文档顺序列出已注册的图。 */
  figures: () => FigureEntry[];
  /**
   * 图内容的版本号：注册、注销、任一张图重新渲染都会加一。
   * 给 `useSyncExternalStore` 用，图外重画图的地方（演示层）靠它跟上图的最新 props。
   */
  subscribeFigures: (listener: () => void) => () => void;
  figuresVersion: () => number;
  /** 图在每次提交后调用，通知订阅方重新取 `view()`。 */
  touchFigures: () => void;
  /** 参考文献编号，见 `Cite` / `Bibliography`。 */
  citations: CitationStore;
  /** 公式注册表，见 `EqRef`。 */
  equations: EquationStore;
  /** 公式项的双向高亮，见 `usePaperTerm`。 */
  terms: TermStore;
  /** 见 `usePaperExport`。 */
  exportFigureSvg: (id: string, stateKey: string, options?: FigureSvgExportOptions) => Promise<string>;
}

export const PaperContext = createContext<PaperContextValue | null>(null);

export function usePaperContext() {
  return useContext(PaperContext);
}
