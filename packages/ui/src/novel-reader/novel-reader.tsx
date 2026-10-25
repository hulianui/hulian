"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "../button";
import { Drawer, DrawerContent } from "../drawer";
import { Empty } from "../empty";
import { Heading } from "../heading";
import { Markdown } from "../markdown";
import { Text } from "../text";
import { VirtualList } from "../virtual-list";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import {
  NOVEL_FONT_CLASS,
  NOVEL_LINE_CLASS,
  NOVEL_MEASURE_CLASS,
  actionFromKey,
  bookProgressPercent,
  chapterProgressPercent,
  clampOffset,
  directionFromSwipe,
  directionFromTap,
  directionFromWheel,
  novelCharCount,
  novelProgressStorageKey,
  offsetForPage,
  pageCountFor,
  pageForOffset,
  paperPresentation,
  parseNovelProgress,
  resolveNovelTurn,
} from "./novel-reader.logic";
import type {
  NovelFontSize,
  NovelLineHeight,
  NovelMeasure,
  NovelPaper,
  NovelReaderProps,
  NovelTurn,
} from "./novel-reader.types";

const FONT_OPTIONS: NovelFontSize[] = ["sm", "md", "lg", "xl"];
const LINE_OPTIONS: NovelLineHeight[] = ["snug", "normal", "relaxed", "loose"];
const MEASURE_OPTIONS: NovelMeasure[] = ["narrow", "normal", "wide"];
const PAPER_OPTIONS: NovelPaper[] = ["default", "day", "eye", "night", "oled"];
const TURN_OPTIONS: NovelTurn[] = ["simulation", "cover", "scroll"];
const STEP_GAP_MS = 280;

const FALLBACK = {
  catalog: "目录",
  settings: "阅读设置",
  previousChapter: "上一章",
  nextChapter: "下一章",
  chapterEnd: "本章完",
  fontSize: "字号",
  lineHeight: "行距",
  measure: "栏宽",
  paper: "背景",
  turn: "翻页",
  readingRegion: "正文",
  empty: "还没有章节",
  bookProgress: "全书",
  chapterProgress: "本章",
  turns: { scroll: "滚动", cover: "覆盖", simulation: "仿真" },
  papers: { default: "默认", day: "日间", eye: "护眼", night: "夜间", oled: "近黑" },
  fontSizes: { sm: "小", md: "标准", lg: "大", xl: "特大" },
  lineHeights: { snug: "紧", normal: "标准", relaxed: "松", loose: "更松" },
  measures: { narrow: "窄", normal: "标准", wide: "宽" },
  numbered: (index: number, title: string) => `第 ${index} 章 ${title}`,
  percent: (value: number) => `${value}%`,
  wordCount: (count: number) => `${count} 字`,
};

type Labels = typeof FALLBACK;

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = useState(fallback);
  const value = controlled !== undefined ? controlled : uncontrolled;
  const setValue = (next: T) => {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return [value, setValue] as const;
}

function canScroll(element: HTMLElement, direction: -1 | 1): boolean {
  if (element.clientHeight <= 0) return false;
  const max = element.scrollHeight - element.clientHeight;
  if (max <= 1) return false;
  return direction > 0 ? element.scrollTop < max - 1 : element.scrollTop > 1;
}

/** 零高度（jsdom / 尚未布局）视为量不到，调用方保持原偏移。 */
function offsetFromScroll(element: HTMLElement, length: number): number | null {
  if (element.clientHeight <= 0 || element.scrollHeight <= 0 || length <= 0) return null;
  const max = element.scrollHeight - element.clientHeight;
  if (max <= 0) return null;
  return clampOffset(Math.round((element.scrollTop / max) * length), length);
}

function applyScroll(element: HTMLElement, offset: number, length: number) {
  if (element.clientHeight <= 0 || element.scrollHeight <= 0 || length <= 0) return;
  const max = element.scrollHeight - element.clientHeight;
  if (max <= 0) return;
  element.scrollTop = (clampOffset(offset, length) / length) * max;
}

function interactiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input, textarea, select, [role='slider'], [contenteditable='true']"));
}

function ProgressTrack({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("h-1 overflow-hidden rounded-full bg-border", className)}
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}

function ChoiceRow<T extends string>({
  label,
  value,
  options,
  names,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  names: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
      <Text size="sm" weight="medium">
        {label}
      </Text>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={value === option ? "solid" : "outline"}
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
          >
            {names[option]}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function NovelReader({
  title,
  author,
  chapters,
  chapterId: chapterIdProp,
  defaultChapterId,
  onChapterChange,
  turn: turnProp,
  defaultTurn,
  onTurnChange,
  mode,
  fontSize: fontSizeProp,
  defaultFontSize,
  onFontSizeChange,
  lineHeight: lineHeightProp,
  defaultLineHeight,
  onLineHeightChange,
  measure: measureProp,
  defaultMeasure,
  onMeasureChange,
  paper: paperProp,
  defaultPaper,
  onPaperChange,
  persistKey,
  onProgressChange,
  leading,
  trailing,
  className,
  ...rest
}: NovelReaderProps) {
  const labels: Labels = { ...FALLBACK, ...useComponentLocale().novelReader };
  const initialChapter =
    chapters.find((chapter) => chapter.id === (chapterIdProp ?? defaultChapterId))?.id ??
    chapters[0]?.id ??
    "";
  const [chapterId, setChapterId] = useControllable(chapterIdProp, initialChapter, onChapterChange);
  const [turn, setTurn] = useControllable(
    turnProp,
    defaultTurn ?? resolveNovelTurn(undefined, mode) ?? "scroll",
    onTurnChange,
  );
  const [fontSize, setFontSize] = useControllable(fontSizeProp, defaultFontSize ?? "md", onFontSizeChange);
  const [lineHeight, setLineHeight] = useControllable(
    lineHeightProp,
    defaultLineHeight ?? "relaxed",
    onLineHeightChange,
  );
  const [measure, setMeasure] = useControllable(measureProp, defaultMeasure ?? "normal", onMeasureChange);
  const [paper, setPaper] = useControllable(paperProp, defaultPaper ?? "default", onPaperChange);

  const [charOffset, setCharOffset] = useState(0);
  const [textLength, setTextLength] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [viewHeight, setViewHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const [chrome, setChrome] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [flipping, setFlipping] = useState(false);

  const offsetRef = useRef(0);
  const lengthRef = useRef(0);
  const chaptersRef = useRef(chapters);
  const indexRef = useRef(0);
  const turnRef = useRef(turn);
  const pageCountRef = useRef(1);
  const readyRef = useRef(false);
  const sheetRef = useRef(false);
  const stepAt = useRef(0);
  const projectingRef = useRef(false);
  const suppressClick = useRef(false);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const onProgressRef = useRef(onProgressChange);
  const flipSeen = useRef(false);
  const focusReaderAfterCatalog = useRef(false);
  const restoreCatalogOpener = useRef(false);
  const restoreSettingsOpener = useRef(false);

  chaptersRef.current = chapters;
  turnRef.current = turn;
  pageCountRef.current = pageCount;
  readyRef.current = ready;
  sheetRef.current = catalogOpen || settingsOpen;
  onProgressRef.current = onProgressChange;
  lengthRef.current = textLength;

  const active = chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0] ?? null;
  const index = active ? chapters.findIndex((chapter) => chapter.id === active.id) : -1;
  indexRef.current = index;
  const bookPercent = bookProgressPercent(Math.max(0, index), chapters.length);
  const chapterPercent = chapterProgressPercent(charOffset, textLength);
  const page = pageForOffset(charOffset, textLength, Math.max(1, pageCount));
  const paperView = paperPresentation(paper);
  const paged = turn !== "scroll";

  const commitOffset = (next: number, length = lengthRef.current) => {
    const limit = length > 0 ? length : Number.MAX_SAFE_INTEGER;
    const clamped = clampOffset(next, limit);
    offsetRef.current = clamped;
    setCharOffset(clamped);
  };

  const lockStep = () => {
    const now = Date.now();
    if (now - stepAt.current < STEP_GAP_MS) return false;
    stepAt.current = now;
    return true;
  };

  const projectScroll = (element: HTMLElement) => {
    projectingRef.current = true;
    applyScroll(element, offsetRef.current, lengthRef.current);
    queueMicrotask(() => {
      projectingRef.current = false;
    });
  };

  const goChapter = (nextIndex: number, offset: number, discrete = true) => {
    const next = chaptersRef.current[nextIndex];
    if (!next) return;
    if (discrete && !lockStep()) return;
    setChapterId(next.id);
    const clamped = clampOffset(offset, Number.MAX_SAFE_INTEGER);
    offsetRef.current = clamped;
    setCharOffset(clamped);
    setPageCount(1);
  };

  const step = (direction: -1 | 1) => {
    if (turnRef.current === "scroll") {
      const scroller = viewportRef.current;
      if (scroller && canScroll(scroller, direction)) {
        if (!lockStep()) return;
        scroller.scrollBy({ top: direction * Math.max(48, scroller.clientHeight * 0.86) });
        return;
      }
      goChapter(indexRef.current + direction, direction > 0 ? 0 : Number.MAX_SAFE_INTEGER);
      return;
    }
    const length = lengthRef.current;
    const pages = Math.max(1, pageCountRef.current);
    const current = pageForOffset(offsetRef.current, length, pages);
    const nextPage = current + direction;
    if (nextPage < 0) {
      goChapter(indexRef.current - 1, Number.MAX_SAFE_INTEGER);
      return;
    }
    if (nextPage >= pages) {
      goChapter(indexRef.current + 1, 0);
      return;
    }
    if (!lockStep()) return;
    commitOffset(offsetForPage(nextPage, length, pages), length);
  };

  const stepRef = useRef(step);
  stepRef.current = step;

  useLayoutEffect(() => {
    const list = chaptersRef.current;
    if (persistKey && typeof window !== "undefined") {
      const stored = parseNovelProgress(window.localStorage.getItem(novelProgressStorageKey(persistKey)));
      const known = stored ? list.some((chapter) => chapter.id === stored.chapterId) : false;
      if (stored && known) {
        if (chapterIdProp === undefined) setChapterId(stored.chapterId);
        if (chapterIdProp === undefined || chapterIdProp === stored.chapterId) {
          offsetRef.current = stored.charOffset;
          setCharOffset(stored.charOffset);
        }
      }
    }
    setReady(true);
    // 只在进入或更换存档键时读一次。章节数组的引用每轮渲染都可能变，不能放进依赖。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey]);

  useLayoutEffect(() => {
    const node = articleRef.current;
    const nextLength = [...(node?.textContent ?? "")].length;
    setTextLength(nextLength);
    lengthRef.current = nextLength;
    if (nextLength <= 0) return;
    const clamped = clampOffset(offsetRef.current, nextLength);
    if (clamped !== offsetRef.current) {
      offsetRef.current = clamped;
      setCharOffset(clamped);
    }
  }, [active?.id, active?.content, fontSize, lineHeight, measure]);

  useLayoutEffect(() => {
    if (!ready || !paged) return;
    const view = viewportRef.current;
    const column = view?.firstElementChild;
    if (!view || !(column instanceof HTMLElement)) return;
    const height = view.clientHeight;
    const contentHeight = column.scrollHeight;
    if (height <= 0 || contentHeight <= 0) {
      setViewHeight(0);
      setPageCount(1);
      return;
    }
    setViewHeight(height);
    setPageCount(pageCountFor(contentHeight, height));
  }, [ready, paged, active?.id, active?.content, fontSize, lineHeight, measure, textLength]);

  useLayoutEffect(() => {
    if (!ready || paged) return;
    const scroller = viewportRef.current;
    if (!scroller) return;
    projectScroll(scroller);
  }, [ready, paged, active?.id, fontSize, lineHeight, measure, textLength, catalogOpen, settingsOpen]);

  const activeId = active?.id ?? "";
  useEffect(() => {
    if (!ready || !persistKey || !activeId) return;
    const progress = { chapterId: activeId, charOffset };
    window.localStorage.setItem(novelProgressStorageKey(persistKey), JSON.stringify(progress));
    onProgressRef.current?.(progress);
  }, [ready, persistKey, activeId, charOffset]);

  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const direction = directionFromWheel(event.deltaX, event.deltaY);
      if (!direction) return;
      const scroller = viewportRef.current;
      if (turnRef.current === "scroll" && scroller && canScroll(scroller, direction)) return;
      event.preventDefault();
      stepRef.current(direction);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [active?.id]);

  useEffect(() => {
    const scroller = viewportRef.current;
    if (!scroller || paged) return;
    const onScroll = () => {
      if (projectingRef.current || !readyRef.current || sheetRef.current || turnRef.current !== "scroll") return;
      const next = offsetFromScroll(scroller, lengthRef.current);
      if (next == null || next === offsetRef.current) return;
      offsetRef.current = next;
      setCharOffset(next);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [paged, active?.id]);

  useEffect(() => {
    const view = viewportRef.current;
    if (!view) return;
    const projectViewport = () => {
      if (turnRef.current === "scroll") {
        projectScroll(view);
        return;
      }
      const column = view.firstElementChild;
      if (!(column instanceof HTMLElement)) return;
      const height = view.clientHeight;
      const contentHeight = column.scrollHeight;
      if (height <= 0 || contentHeight <= 0) return;
      const pages = pageCountFor(contentHeight, height);
      setViewHeight((current) => (current === height ? current : height));
      setPageCount((current) => (current === pages ? current : pages));
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(projectViewport);
    observer?.observe(view);
    window.addEventListener("resize", projectViewport);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", projectViewport);
    };
    // projectScroll 每次渲染都读 ref，观察器只跟当前视口走。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  useEffect(() => {
    if (turn !== "simulation") {
      flipSeen.current = false;
      return;
    }
    if (!flipSeen.current) {
      flipSeen.current = true;
      return;
    }
    setFlipping(true);
    const timer = window.setTimeout(() => setFlipping(false), 180);
    return () => window.clearTimeout(timer);
  }, [turn, page, active?.id]);

  useEffect(() => {
    if (catalogOpen) return;
    if (!focusReaderAfterCatalog.current && !restoreCatalogOpener.current) return;
    focusReaderAfterCatalog.current = false;
    restoreCatalogOpener.current = false;
    regionRef.current?.focus();
  }, [catalogOpen]);

  useEffect(() => {
    if (settingsOpen || !restoreSettingsOpener.current) return;
    restoreSettingsOpener.current = false;
    regionRef.current?.focus();
  }, [settingsOpen]);

  const openCatalog = () => {
    restoreCatalogOpener.current = true;
    setCatalogOpen(true);
  };

  const openSettings = () => {
    restoreSettingsOpener.current = true;
    setSettingsOpen(true);
  };

  const selectChapter = (id: string) => {
    setChapterId(id);
    offsetRef.current = 0;
    setCharOffset(0);
    focusReaderAfterCatalog.current = true;
    setCatalogOpen(false);
  };

  if (!active) {
    return (
      <div className={cn("flex h-full min-h-0 items-center justify-center", className)} {...rest}>
        <Empty title={labels.empty} icon={null} />
      </div>
    );
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || interactiveTarget(event.target)) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    const direction = directionFromSwipe(event.clientX - start.x, event.clientY - start.y);
    if (!direction) return;
    suppressClick.current = true;
    step(direction);
  };

  const atFirst = index <= 0;
  const atLast = index < 0 || index >= chapters.length - 1;

  const column = (
    <div className={cn("mx-auto flex w-full min-h-full flex-col px-6 py-8", NOVEL_MEASURE_CLASS[measure])}>
      {atFirst ? null : (
        <div data-novel-chapter-nav="start" className="mb-6">
          <Button
            type="button"
            variant="ghost"
            muted
            size="sm"
            onClick={() => goChapter(index - 1, Number.MAX_SAFE_INTEGER)}
          >
            {labels.previousChapter}
          </Button>
        </div>
      )}
      <article
        ref={articleRef}
        data-paper={paper}
        {...(paperView.theme ? { "data-theme": paperView.theme } : {})}
        className={cn(
          "flex-1 rounded-[var(--radius)] px-1",
          paperView.className,
          NOVEL_FONT_CLASS[fontSize],
          NOVEL_LINE_CLASS[lineHeight],
        )}
      >
        {title ? (
          <Text size="sm" tone="muted" className="mb-2">
            {title}
            {author ? <> · {author}</> : null}
          </Text>
        ) : null}
        <Heading level={1} size="xl">
          {labels.numbered(index + 1, active.title)}
        </Heading>
        <Markdown>{active.content}</Markdown>
      </article>
      <div
        data-novel-chapter-nav="end"
        className="mt-10 flex items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface/60 px-4 py-3"
      >
        <Text size="sm" tone="muted">
          {labels.chapterEnd}
        </Text>
        {atLast ? null : (
          <Button type="button" variant="outline" size="sm" onClick={() => goChapter(index + 1, 0)}>
            {labels.nextChapter}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div
      {...rest}
      ref={regionRef}
      role="region"
      tabIndex={0}
      aria-label={labels.readingRegion}
      data-novel-chapter={active.id}
      data-novel-offset={charOffset}
      data-turn={turn}
      className={cn(
        "relative h-full min-h-0 overflow-hidden text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
        paged ? "touch-none" : "touch-pan-y",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onClick={(event) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        if (interactiveTarget(event.target)) return;
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const direction = directionFromTap((event.clientX - rect.left) / rect.width);
        if (direction === 0) {
          setChrome((open) => !open);
          return;
        }
        step(direction);
      }}
      onKeyDown={(event) => {
        const typing =
          event.target instanceof Element &&
          Boolean(event.target.closest("input, textarea, select, [contenteditable='true']"));
        if (typing) return;
        const action = actionFromKey(event.key, event.altKey);
        if (!action) return;
        const onControl = interactiveTarget(event.target);
        if (onControl && action !== "chapter-next" && action !== "chapter-prev" && action !== "dismiss") return;
        event.preventDefault();
        if (action === "dismiss") {
          setChrome(false);
          setCatalogOpen(false);
          setSettingsOpen(false);
          return;
        }
        if (action === "chapter-next") goChapter(indexRef.current + 1, 0, false);
        else if (action === "chapter-prev") goChapter(indexRef.current - 1, 0, false);
        else if (action === "forward") step(1);
        else step(-1);
      }}
    >
      <div
        ref={viewportRef}
        data-novel-viewport=""
        className={cn("h-full", paged ? "overflow-hidden" : "overflow-y-auto")}
        style={paged ? { perspective: "800px" } : undefined}
      >
        <div
          className={cn(paged && "transition-transform duration-300 ease-out motion-reduce:transition-none")}
          style={
            paged && viewHeight > 0
              ? {
                  transform: flipping
                    ? `translateY(-${page * viewHeight}px) rotateX(8deg)`
                    : `translateY(-${page * viewHeight}px)`,
                }
              : undefined
          }
        >
          {column}
        </div>
      </div>

      {chrome ? null : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-px">
          <ProgressTrack label={labels.bookProgress} value={bookPercent} className="h-0.5 rounded-none" />
          <div className="flex items-center gap-2 bg-bg/80">
            <ProgressTrack label={labels.chapterProgress} value={chapterPercent} className="h-0.5 flex-1 rounded-none" />
            <Text size="xs" tone="muted" numeric className="pr-2">
              {labels.percent(chapterPercent)}
            </Text>
          </div>
        </div>
      )}

      {chrome ? (
        <div data-novel-chrome="" className="pointer-events-none absolute inset-0 z-20">
          <header className="pointer-events-auto absolute inset-x-0 top-0 flex flex-col gap-2 bg-surface/80 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="flex shrink-0 items-center gap-1">{leading}</div>
              <div className="min-w-0 flex-1">
                {title ? (
                  <Text size="sm" weight="medium" truncate>
                    {title}
                  </Text>
                ) : null}
                <Text size="xs" tone="muted" truncate>
                  {labels.numbered(index + 1, active.title)}
                </Text>
              </div>
              <div className="flex shrink-0 items-center gap-1">{trailing}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" disabled={index <= 0} onClick={() => goChapter(index - 1, 0)}>
                {labels.previousChapter}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={openCatalog}>
                {labels.catalog}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={index < 0 || index >= chapters.length - 1}
                onClick={() => goChapter(index + 1, 0)}
              >
                {labels.nextChapter}
              </Button>
            </div>
          </header>
          <footer className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-surface/80 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Text size="xs" tone="muted" className="w-8 shrink-0">
                {labels.bookProgress}
              </Text>
              <ProgressTrack label={labels.bookProgress} value={bookPercent} />
              <Text size="xs" numeric className="w-10 text-right">
                {labels.percent(bookPercent)}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text size="xs" tone="muted" className="w-8 shrink-0">
                {labels.chapterProgress}
              </Text>
              <ProgressTrack label={labels.chapterProgress} value={chapterPercent} />
              <Text size="xs" numeric className="w-10 text-right">
                {labels.percent(chapterPercent)}
              </Text>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" disabled={index <= 0} onClick={() => goChapter(index - 1, 0)}>
                {labels.previousChapter}
              </Button>
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="sm" onClick={openCatalog}>
                  {labels.catalog}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={openSettings}>
                  {labels.settings}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={index < 0 || index >= chapters.length - 1}
                onClick={() => goChapter(index + 1, 0)}
              >
                {labels.nextChapter}
              </Button>
            </div>
            <Text size="xs" tone="muted" className="text-center">
              {labels.wordCount(active.wordCount ?? novelCharCount(active.content))}
            </Text>
          </footer>
        </div>
      ) : null}

      <Drawer open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DrawerContent
          side="bottom"
          size="md"
          title={labels.catalog}
          className="bg-surface/80 backdrop-blur-md"
          backdropClassName="bg-foreground/15 backdrop-blur-none"
        >
          {chapters.length > 24 ? (
            <VirtualList
              items={chapters}
              itemHeight={40}
              height={240}
              getKey={(chapter) => chapter.id}
              renderItem={(chapter, chapterIndex) => (
                <Button
                  type="button"
                  variant={chapter.id === active.id ? "solid" : "ghost"}
                  className="w-full justify-start"
                  aria-current={chapter.id === active.id ? "page" : undefined}
                  onClick={() => selectChapter(chapter.id)}
                >
                  {labels.numbered(chapterIndex + 1, chapter.title)}
                </Button>
              )}
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {chapters.map((chapter, chapterIndex) => (
                <li key={chapter.id}>
                  <Button
                    type="button"
                    variant={chapter.id === active.id ? "solid" : "ghost"}
                    className="w-full justify-start"
                    aria-current={chapter.id === active.id ? "page" : undefined}
                    onClick={() => selectChapter(chapter.id)}
                  >
                    {labels.numbered(chapterIndex + 1, chapter.title)}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DrawerContent
          side="bottom"
          size="sm"
          title={labels.settings}
          // bg-surface/80 在生产 CSS 里先写成实色 var(--color-surface)，
          // 不过 color-mix(in lab) 检测时整块是不透明浅底。内联 color-mix 不走这条回退。
          // 遮罩保持透明、面板不模糊，当前句才能从 80% surface 后面透出来。
          className="backdrop-blur-none"
          backdropClassName="bg-transparent backdrop-blur-none"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)" }}
        >
          <div className="flex flex-col gap-4 pb-2">
            <ChoiceRow
              label={labels.turn}
              value={turn}
              options={TURN_OPTIONS}
              names={labels.turns}
              onChange={setTurn}
            />
            <ChoiceRow
              label={labels.fontSize}
              value={fontSize}
              options={FONT_OPTIONS}
              names={labels.fontSizes}
              onChange={setFontSize}
            />
            <ChoiceRow
              label={labels.lineHeight}
              value={lineHeight}
              options={LINE_OPTIONS}
              names={labels.lineHeights}
              onChange={setLineHeight}
            />
            <ChoiceRow
              label={labels.measure}
              value={measure}
              options={MEASURE_OPTIONS}
              names={labels.measures}
              onChange={setMeasure}
            />
            <ChoiceRow
              label={labels.paper}
              value={paper}
              options={PAPER_OPTIONS}
              names={labels.papers}
              onChange={setPaper}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
