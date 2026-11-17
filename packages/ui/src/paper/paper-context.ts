"use client";
import { createContext, useContext } from "react";
import type { PaperContentLabels, PaperMode } from "./paper.types";

/** 一张已挂载的图在注册表里留下的句柄。 */
export interface FigureEntry {
  id: string;
  element: () => HTMLElement | null;
  has: (key: string) => boolean;
  select: (key: string) => void;
  /** 短暂描边，告诉读者「引用指的是这张图」。 */
  highlight: () => void;
}

export interface PaperContextValue {
  mode: PaperMode;
  setMode: (mode: PaperMode) => void;
  register: (entry: FigureEntry) => () => void;
  find: (id: string) => FigureEntry | undefined;
  /** 按文档顺序的图号（从 1 起）；未注册返回 undefined。 */
  numberOf: (id: string) => number | undefined;
  /** 注册表每变一次加一，让依赖图号的引用重新取号。 */
  revision: number;
  labels?: PaperContentLabels;
}

export const PaperContext = createContext<PaperContextValue | null>(null);

export function usePaperContext() {
  return useContext(PaperContext);
}
