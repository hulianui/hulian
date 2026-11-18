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
  /** 循环播放开关（播完最后一步回到第一步继续）。 */
  loop: "循环播放",
  /** 倍速按钮的无障碍名，按钮上显示的是 `1×` 这种值。 */
  speed: "播放速度",
  overview: "全部",
  steps: "步骤",
  /** 收起图下方的控件行。 */
  hideControls: "隐藏控件",
  /** 控件行收起后，重新展开的那个按钮。 */
  showControls: "显示控件",
  /** 隐藏演示界面的顶栏、页码与翻页条。 */
  hideChrome: "隐藏界面",
  /** 界面已隐藏时，把它唤回来的那个按钮。 */
  showChrome: "显示界面",
  presenter: "演示模式",
  exit: "退出",
  prevSlide: "上一页",
  nextSlide: "下一页",
  noSlides: "这篇论文里还没有可演示的图。",
  abstract: "摘要",
  references: "参考文献",
  equation: "公式",
  section: (n: string) => `第 ${n} 节`,
  outline: "目录",
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
