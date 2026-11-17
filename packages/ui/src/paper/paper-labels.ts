"use client";
import { useComponentLocale } from "../config/locale-context";
import { usePaperContext } from "./paper-context";

const DEFAULT_LABELS = {
  figure: "图",
  separator: "：",
  prev: "上一步",
  next: "下一步",
  play: "播放",
  pause: "暂停",
  overview: "全部",
  steps: "步骤",
  presenter: "演示模式",
  exit: "退出",
  prevSlide: "上一页",
  nextSlide: "下一页",
  noSlides: "这篇论文里还没有可演示的图。",
  abstract: "摘要",
  references: "参考文献",
};

export type PaperLabels = typeof DEFAULT_LABELS;

export function usePaperLabels(): PaperLabels {
  const locale = useComponentLocale().paper;
  const content = usePaperContext()?.labels;
  return { ...DEFAULT_LABELS, ...locale, ...stripUndefined(content) };
}

function stripUndefined<T extends object>(value: T | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** 第 i 张分图 / 第 i 步的字母：a, b, … z, aa, ab … */
export function letterOf(index: number): string {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}
