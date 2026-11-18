"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../button";
import { Maximize, Minimize } from "../_icons";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { overlayTransitions } from "../motion";
import { PAPER_FONT } from "./paper";
import { usePaperContext, type FigureEntry, type FigureView } from "./paper-context";
import { usePaperLabels } from "./paper-labels";
import type { FigureRenderContext, PaperPresenterProps, PresenterSlide } from "./paper.types";

// 答辩演示：全屏层里把每张图的预设串成一组幻灯片。
//  · 不搬 DOM：演示层从 Paper 注册表取每张图的画法（view()），用同一个「状态 → 画面」函数
//    在这里再画一遍。正文里的图状态不受影响，退出后读者还停在原来那一步。
//  · 图的 props 变了（语言切换、数据更新），图提交后会 touch 注册表的小 store，
//    这里用 useSyncExternalStore 订阅版本号重新取画法。
//  · 演示里图的控件照常可用：select 到某个预设就翻到对应那页（没有这一页则临时显示），
//    setState 给的值只覆盖当前页，翻页即还原 —— 演示层自己持有这份临时状态。
//  · 全屏层走 Base UI Dialog：role=dialog、aria-modal、焦点陷阱、Esc、滚动锁、
//    关闭后焦点回到触发按钮（或打开前聚焦的元素）都由它负责。

const PAGE_NEXT = new Set(["ArrowRight", "PageDown", " "]);
const PAGE_PREV = new Set(["ArrowLeft", "PageUp"]);

/** 这些地方的方向键 / 空格有自己的用处（移动光标、拖滑块、按按钮），不拿来翻页。 */
const KEEP_KEYS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"], [role="radiogroup"], [role="radio"], [role="tablist"], [role="listbox"], [role="menu"], [role="spinbutton"]';

function keepsKey(target: EventTarget | null, key: string): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest(KEEP_KEYS)) return true;
  // 空格在按钮 / 链接上是「按下它」。
  return key === " " && target.closest("button, a[href], [role=button]") !== null;
}

interface ResolvedSlide extends PresenterSlide {
  entry: FigureEntry;
  number: number;
}

function resolveSlides(entries: FigureEntry[], slides: readonly PresenterSlide[] | undefined): ResolvedSlide[] {
  const numbers = new Map(entries.map((e, i) => [e.id, i + 1]));
  if (!slides) {
    return entries.flatMap((entry, i) =>
      entry.view().present.map((state) => ({ figure: entry.id, state, entry, number: i + 1 })),
    );
  }
  const byId = new Map(entries.map((e) => [e.id, e]));
  const out: ResolvedSlide[] = [];
  for (const slide of slides) {
    const entry = byId.get(slide.figure);
    // 图挂载登记之前（首次渲染）注册表还是空的，此时不告警。
    if (!entry) {
      if (entries.length > 0) {
        warnOnce(`PaperPresenter:figure:${slide.figure}`, `[PaperPresenter] 找不到 id 为 "${slide.figure}" 的图，跳过这一页。`);
      }
      continue;
    }
    if (!(slide.state in entry.view().states)) {
      warnOnce(
        `PaperPresenter:state:${slide.figure}:${slide.state}`,
        `[PaperPresenter] 图 "${slide.figure}" 没有名为 "${slide.state}" 的预设，跳过这一页。`,
      );
      continue;
    }
    out.push({ ...slide, entry, number: numbers.get(slide.figure) ?? 0 });
  }
  return out;
}

/** 图的画法放进独立组件，并以图 id 为 key：渲染函数里若用了 hook，换图时不会和上一张串。 */
function Draw({ view, state, figure }: { view: FigureView; state: unknown; figure: FigureRenderContext<unknown> }) {
  return <>{view.render(state, figure)}</>;
}

function Controls({ view, figure }: { view: FigureView; figure: FigureRenderContext<unknown> }) {
  return <>{view.controls?.(figure)}</>;
}

export function PaperPresenter({
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  slides,
  controls = true,
  hideChrome = false,
  onSlideChange,
  className,
}: PaperPresenterProps) {
  const paper = usePaperContext();
  const labels = usePaperLabels();

  if (!paper) warnOnce("PaperPresenter:outside", "[PaperPresenter] 必须放在 Paper 里，否则找不到要演示的图。");

  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  // 界面（标题栏、页码、翻页条）可以收掉只看画面；放映中随时能切回来。
  const [chromeShown, setChromeShown] = useState(!hideChrome);
  const isOpen = open ?? innerOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const subscribe = paper?.subscribeFigures ?? noopSubscribe;
  const getVersion = paper?.figuresVersion ?? zero;
  // 关着的时候不订阅：图每次提交都会 touch，没必要让一个看不见的组件跟着重渲染。
  const version = useSyncExternalStore(isOpen ? subscribe : noopSubscribe, getVersion, zero);

  const list = useMemo(
    () => (isOpen && paper ? resolveSlides(paper.figures(), slides) : []),
    // version 变 = 图登记、注销或重新渲染过，要重新取画法。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, paper, slides, version],
  );

  const [index, setIndex] = useState(0);
  // 演示里用控件 setState 出来的临时状态，只属于当前页。
  const [override, setOverride] = useState<{ key: string | null; value: unknown } | null>(null);

  const last = list.length - 1;
  const at = Math.min(Math.max(index, 0), Math.max(last, 0));
  const slide: ResolvedSlide | undefined = list[at];

  const go = useCallback((next: number) => {
    setOverride(null);
    setIndex(next);
  }, []);

  // 每次打开都从第一页讲起。
  useEffect(() => {
    if (isOpen) go(0);
  }, [isOpen, go]);

  // 演示层经 portal 挂在 body 下，继承不到 Paper 所处位置的两样东西，打开时从 Paper 根元素抄过来：
  //  · 字体：外层设的 --paper-font / --hl-font-serif、写在 Paper 上的 font 类 / style —— 取计算值；
  //  · 主题岛：Paper 最近的带 data-theme 的祖先（含 Paper 自己）。<html> 上的全局主题本来就继承得到，不抄。
  //    演示期间主题岛被切换（页面上任何 data-theme 变化）时跟着重抄。
  // 首帧仍是全局值，但弹层正处在淡入的起始态（opacity 0），看不到切换。
  const [paperFont, setPaperFont] = useState<string | null>(null);
  const [paperTheme, setPaperTheme] = useState<string | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    const read = () => {
      const el = paper?.root();
      setPaperFont(el ? getComputedStyle(el).fontFamily || null : null);
      const island = el?.closest("[data-theme]");
      setPaperTheme(island && island !== document.documentElement ? island.getAttribute("data-theme") : null);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"], subtree: true });
    return () => observer.disconnect();
  }, [isOpen, paper]);

  const slideFigure = slide?.figure;
  const slideState = slide?.state;
  const onSlideChangeRef = useLatest(onSlideChange);
  useEffect(() => {
    if (!isOpen || slideFigure === undefined || slideState === undefined) return;
    onSlideChangeRef.current?.({ figure: slideFigure, state: slideState }, at);
  }, [isOpen, slideFigure, slideState, at, onSlideChangeRef]);

  const view = slide?.entry.view();
  const value = override ? override.value : view?.states[slide!.state];
  const stateKey = override ? override.key : (slide?.state ?? null);

  const figure: FigureRenderContext<unknown> | undefined =
    slide && view
      ? {
          state: value,
          stateKey,
          mode: "read",
          presenting: true,
          select: (key) => {
            const j = list.findIndex((s) => s.figure === slide.figure && s.state === key);
            if (j > -1) go(j);
            else if (key in view.states) setOverride({ key, value: view.states[key] });
            else warnOnce(`PaperPresenter:select:${key}`, `[PaperPresenter] 没有名为 "${key}" 的预设。`);
          },
          setState: (next) => setOverride({ key: null, value: next }),
        }
      : undefined;

  // 打开后焦点落在「下一页」：讲的人第一下多半是往后翻。只有一页时它是禁用的，交给默认（第一个可聚焦元素）。
  const nextButton = useRef<HTMLButtonElement>(null);
  const initialFocus = () => {
    const el = nextButton.current;
    return el && !el.disabled ? el : true;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const next = PAGE_NEXT.has(event.key);
    const prev = PAGE_PREV.has(event.key);
    if (!next && !prev) return;
    if (keepsKey(event.target, event.key)) return;
    event.preventDefault();
    if (next && at < last) go(at + 1);
    if (prev && at > 0) go(at - 1);
  };

  const description = view && figure ? view.describe?.(value, stateKey) : undefined;
  const hasDescription = description !== undefined && description !== null && description !== "";
  const figureLabel = slide ? `${labels.figure} ${slide.number}` : null;
  const progress = list.length > 0 ? ((at + 1) / list.length) * 100 : 0;
  const controlsNode: ReactNode =
    controls && view?.controls && figure ? <Controls key={slide!.figure} view={view} figure={figure} /> : null;

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={(next) => setOpen(next)}>
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal>
        <BaseDialog.Popup
          aria-label={labels.presenter}
          initialFocus={initialFocus}
          data-paper-presenter=""
          data-theme={paperTheme ?? undefined}
          onKeyDown={onKeyDown}
          className={cn(
            "fixed inset-0 z-[var(--hl-z-overlay,50)] grid gap-3 bg-bg text-foreground outline-none",
            chromeShown ? "grid-rows-[auto_minmax(0,1fr)_auto]" : "grid-rows-[minmax(0,1fr)]",
            "px-[max(1rem,env(safe-area-inset-left))] pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-[max(0.875rem,env(safe-area-inset-top))] sm:gap-4",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 print:hidden",
            className,
          )}
          style={{ ...overlayTransitions.popup, fontFamily: paperFont ?? PAPER_FONT } as CSSProperties}
        >
          {chromeShown ? (
            <header className="flex min-w-0 items-center gap-3 font-sans text-sm">
              <div className="min-w-0 flex-1 truncate">
                {title ? <span className="font-semibold text-foreground">{title}</span> : null}
                {figureLabel ? (
                  <span className={cn("text-muted-foreground", title ? "ml-2" : undefined)}>{figureLabel}</span>
                ) : null}
              </div>
              <span data-paper-presenter-counter="" className="shrink-0 tabular-nums text-muted-foreground">
                {list.length > 0 ? `${at + 1} / ${list.length}` : null}
              </span>
              <Button
                size="sm"
                variant="ghost"
                aria-label={labels.hideChrome}
                title={labels.hideChrome}
                onClick={() => setChromeShown(false)}
                className="shrink-0"
              >
                <Minimize className="size-4" />
              </Button>
              <BaseDialog.Close render={<Button size="sm" variant="outline" />}>
                {labels.exit}
                <kbd aria-hidden className="ml-1.5 font-sans text-xs text-muted-foreground">Esc</kbd>
              </BaseDialog.Close>
            </header>
          ) : null}

          <div data-paper-presenter-stage="" className="flex min-h-0 flex-col items-center gap-3 overflow-auto">
            {slide && view && figure ? (
              <>
                <div
                  data-paper-presenter-figure={slide.figure}
                  data-state={stateKey ?? undefined}
                  className={cn(
                    "flex min-h-0 w-full max-w-[min(100%,1200px)] flex-1 items-center justify-center",
                    // 图一般是 w-full h-auto 的 SVG：在这里改成按舞台高度撑满，宽度跟着 viewBox 比例走。
                    "[&>svg]:h-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:max-w-full",
                  )}
                >
                  <Draw key={slide.figure} view={view} state={value} figure={figure} />
                </div>
                <p className="m-0 w-full max-w-[72ch] shrink-0 text-base leading-relaxed sm:text-lg">
                  <span data-paper-figure-label="">
                    {figureLabel}
                    {labels.separator}
                  </span>
                  {view.caption}
                  {hasDescription ? (
                    <span data-paper-figure-state="" aria-live="polite" className="mt-1 block text-muted-foreground">
                      {description}
                    </span>
                  ) : null}
                </p>
                {controlsNode ? (
                  <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 font-sans text-sm text-muted-foreground">
                    {controlsNode}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="m-auto font-sans text-sm text-muted-foreground">{labels.noSlides}</p>
            )}
          </div>

          {chromeShown ? (
            <footer className="flex items-center gap-3 font-sans text-sm">
              <Button size="sm" variant="outline" onClick={() => go(at - 1)} disabled={at <= 0}>
                ← {labels.prevSlide}
              </Button>
              <div aria-hidden className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Button ref={nextButton} size="sm" onClick={() => go(at + 1)} disabled={at >= last}>
                {labels.nextSlide} →
              </Button>
            </footer>
          ) : null}
          {chromeShown ? null : (
            <Button
              size="sm"
              variant="outline"
              aria-label={labels.showChrome}
              title={labels.showChrome}
              onClick={() => setChromeShown(true)}
              className="absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-10 size-9 px-0 text-muted-foreground"
            >
              <Maximize className="size-4" />
            </Button>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function noopSubscribe() {
  return () => {};
}

function zero() {
  return 0;
}
