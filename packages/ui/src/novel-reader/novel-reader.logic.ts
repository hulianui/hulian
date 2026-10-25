import type {
  NovelFontSize,
  NovelLineHeight,
  NovelMeasure,
  NovelMode,
  NovelPaper,
  NovelProgress,
  NovelTurn,
} from "./novel-reader.types";

export const NOVEL_PROGRESS_PREFIX = "hulian.novel-reader:";

export const NOVEL_FONT_CLASS: Record<NovelFontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const NOVEL_LINE_CLASS: Record<NovelLineHeight, string> = {
  snug: "leading-snug",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

export const NOVEL_MEASURE_CLASS: Record<NovelMeasure, string> = {
  narrow: "max-w-xl",
  normal: "max-w-2xl",
  wide: "max-w-3xl",
};

export function novelProgressStorageKey(persistKey: string): string {
  return `${NOVEL_PROGRESS_PREFIX}${persistKey}`;
}

export function novelCharCount(source: string): number {
  return [...source.replace(/\s+/gu, "")].length;
}

export function clampOffset(offset: number, length: number): number {
  if (!Number.isFinite(offset) || offset <= 0) return 0;
  const max = Math.max(0, length);
  return Math.min(max, Math.floor(offset));
}

/** 章内百分比。空章视为读完。 */
export function chapterProgressPercent(offset: number, length: number): number {
  if (length <= 0) return 100;
  return Math.round((clampOffset(offset, length) / length) * 100);
}

/** 全书章进度：第 index 章（0 起）在 count 章中的位置。 */
export function bookProgressPercent(index: number, count: number): number {
  if (count <= 0) return 0;
  const safe = Math.min(count - 1, Math.max(0, index));
  return Math.round(((safe + 1) / count) * 100);
}

export function parseNovelProgress(raw: string | null): NovelProgress | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<NovelProgress>;
    if (typeof data.chapterId !== "string" || data.chapterId.length === 0) return null;
    if (typeof data.charOffset !== "number" || !Number.isFinite(data.charOffset)) return null;
    return { chapterId: data.chapterId, charOffset: clampOffset(data.charOffset, Number.MAX_SAFE_INTEGER) };
  } catch {
    return null;
  }
}

export function resolveNovelTurn(turn: NovelTurn | undefined, mode: NovelMode | undefined): NovelTurn | undefined {
  if (turn) return turn;
  if (mode === "paginated") return "cover";
  if (mode === "scroll") return "scroll";
  return undefined;
}

export function pageCountFor(contentHeight: number, viewportHeight: number): number {
  if (viewportHeight <= 0 || contentHeight <= 0) return 1;
  return Math.max(1, Math.ceil(contentHeight / viewportHeight - 1e-3));
}

/** 字符偏移落到哪一页。页码只是视图，不写入进度。 */
export function pageForOffset(offset: number, length: number, pageCount: number): number {
  if (pageCount <= 1 || length <= 0) return 0;
  const ratio = clampOffset(offset, length) / length;
  return Math.min(pageCount - 1, Math.floor(ratio * pageCount));
}

/** 某一页开头对应的字符偏移。 */
export function offsetForPage(page: number, length: number, pageCount: number): number {
  if (pageCount <= 1 || length <= 0) return 0;
  const clamped = Math.min(pageCount - 1, Math.max(0, page));
  return Math.round((clamped / pageCount) * length);
}

/** 滚轮：向下 / 向右为向前。 */
export function directionFromWheel(deltaX: number, deltaY: number): -1 | 1 | 0 {
  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return 0;
  const dominant = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
  return dominant > 0 ? 1 : -1;
}

/**
 * 滑动：左滑、上滑为向前，右滑、下滑为向后。
 * 与滚轮同一套「向前 / 向后」，不是另一套水平翻书。
 */
export function directionFromSwipe(dx: number, dy: number, threshold = 48): -1 | 1 | 0 {
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return 0;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 1 : -1;
  return dy < 0 ? 1 : -1;
}

/** 点左右边缘翻页；中间带只负责唤出菜单，不翻页。 */
export function directionFromTap(xRatio: number, edge = 0.22): -1 | 0 | 1 {
  if (!Number.isFinite(xRatio)) return 0;
  if (xRatio < edge) return -1;
  if (xRatio > 1 - edge) return 1;
  return 0;
}

export type NovelKeyAction = "forward" | "back" | "chapter-next" | "chapter-prev" | "dismiss";

/** 方向键翻页，Alt+方向键或方括号翻章。 */
export function actionFromKey(key: string, altKey: boolean): NovelKeyAction | null {
  if (key === "Escape") return "dismiss";
  if (altKey && (key === "ArrowDown" || key === "ArrowRight")) return "chapter-next";
  if (altKey && (key === "ArrowUp" || key === "ArrowLeft")) return "chapter-prev";
  if (key === "]" || key === "】") return "chapter-next";
  if (key === "[" || key === "【") return "chapter-prev";
  if (key === "ArrowDown" || key === "ArrowRight" || key === "PageDown" || key === " ") return "forward";
  if (key === "ArrowUp" || key === "ArrowLeft" || key === "PageUp") return "back";
  return null;
}

export function paperPresentation(paper: NovelPaper): { theme?: "light" | "dark"; className: string } {
  switch (paper) {
    case "day":
      return { theme: "light", className: "bg-bg text-foreground" };
    case "eye":
      return { theme: "light", className: "bg-success/12 text-foreground" };
    case "night":
      return { theme: "dark", className: "bg-surface text-muted-foreground [&_p]:text-muted-foreground" };
    case "oled":
      return { theme: "dark", className: "bg-bg text-foreground" };
    default:
      return { className: "bg-bg text-foreground" };
  }
}

export function initialChapterId(
  chapters: ReadonlyArray<{ id: string }>,
  chapterId: string | undefined,
  defaultChapterId: string | undefined,
): string {
  if (chapterId && chapters.some((chapter) => chapter.id === chapterId)) return chapterId;
  if (defaultChapterId && chapters.some((chapter) => chapter.id === defaultChapterId)) return defaultChapterId;
  return chapters[0]?.id ?? "";
}
