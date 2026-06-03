"use client";
// 自研 Carousel 轮播（零新依赖）。
// 机制：CSS scroll-snap 轨道（原生触摸/触控板拖拽免费）+ `current` 索引作单一真相源。
//   · 导航（箭头/圆点/键盘/autoplay）改 current → effect scrollTo(slide.offsetLeft 对齐)。
//   · 用户指针/触摸拖拽 → scroll settle(120ms 防抖) 回算最近 slide 同步 current（幂等，避免反馈环）。
// loop = 索引回绕（非克隆式无缝无限）：零依赖下克隆会与原生 snap 打架，回绕是诚实取舍。
// reduced-motion：关 autoplay + scrollTo behavior:"auto"（无平滑动画）。
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { CarouselProps } from "./carousel.types";

// 圆点宽度/颜色过渡复用 motion-token CSS 镜像（零散写 transition）。
const DOT_TRANSITION = {
  transitionProperty: "width, background-color, opacity",
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

const wrap = (n: number, len: number) => ((n % len) + len) % len;
const clamp = (n: number, len: number) => Math.min(Math.max(n, 0), len - 1);

export function Carousel({
  children,
  current,
  defaultCurrent = 0,
  onSelect,
  autoplay = false,
  autoplayInterval = 4000,
  loop = false,
  showArrows = true,
  showDots = true,
  "aria-label": ariaLabel = "轮播",
  className,
  slideClassName,
  ...rest
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;

  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const isControlled = current != null;
  const [internal, setInternal] = useState(() => clamp(defaultCurrent, Math.max(count, 1)));

  const active = count > 0 ? clamp(isControlled ? current! : internal, count) : 0;
  // 用 ref 镜像 active，供 interval/键盘/scroll 闭包读最新值（避免 stale closure）。
  const activeRef = useRef(active);
  activeRef.current = active;

  // 统一跳转：loop 回绕 / 否则夹取；幂等（与当前相同则不回调）。
  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      const target = loop ? wrap(next, count) : clamp(next, count);
      if (target === activeRef.current) return;
      if (!isControlled) setInternal(target);
      onSelect?.(target);
    },
    [count, loop, isControlled, onSelect],
  );

  const goNext = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  // active 变化 → 把轨道滚动到对应 slide（按其 offsetLeft 对齐，兼容任意 align/宽度）。
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const el = track.children[active] as HTMLElement | undefined;
    if (!el) return;
    track.scrollTo({ left: el.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  }, [active, reduce]);

  // 用户拖拽/原生 swipe → 滚动停稳后回算最近 slide 同步 current。
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const kids = Array.from(track.children) as HTMLElement[];
        let nearest = 0;
        let min = Infinity;
        kids.forEach((c, i) => {
          const d = Math.abs(c.offsetLeft - track.scrollLeft);
          if (d < min) {
            min = d;
            nearest = i;
          }
        });
        goTo(nearest);
      }, 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [goTo]);

  // 暂停闸（hover / focus / 拖拽时为 true）。
  const [paused, setPaused] = useState(false);

  // autoplay：reduced-motion / 单张 / 暂停时不启动；无 loop 到末张停。
  useEffect(() => {
    if (!autoplay || reduce || count <= 1 || paused) return;
    const id = setInterval(() => {
      const cur = activeRef.current;
      if (!loop && cur >= count - 1) return;
      goTo(cur + 1);
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, reduce, count, paused, loop, autoplayInterval, goTo]);

  // 指针拖拽（鼠标）：拖动时关 snap 直改 scrollLeft，松手复原由浏览器停靠 + settle 回算。
  const drag = useRef({ startX: 0, startLeft: 0, active: false });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (count <= 1 || e.pointerType === "touch") return; // 触摸交给原生 snap
    const track = trackRef.current;
    if (!track) return;
    drag.current = { startX: e.clientX, startLeft: track.scrollLeft, active: true };
    setDragging(true);
    setPaused(true);
    track.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const track = trackRef.current;
    if (!track) return;
    track.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    setPaused(false);
    trackRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    }
  };

  const hasControls = count > 1;
  const arrowBase =
    "absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn("relative overflow-hidden rounded-[var(--radius)]", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {/* 滚动轨道：scroll-snap mandatory；拖拽中关 snap。隐藏滚动条（视觉走圆点/箭头）。 */}
      <div
        ref={trackRef}
        className={cn(
          "flex w-full overflow-x-auto overscroll-x-contain",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          dragging
            ? "cursor-grabbing snap-none select-none"
            : "snap-x snap-mandatory",
          hasControls && "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`第 ${i + 1} / ${count} 张`}
            className={cn("min-w-0 shrink-0 basis-full snap-start", slideClassName)}
          >
            {slide}
          </div>
        ))}
      </div>

      {showArrows && hasControls && (
        <>
          <button
            type="button"
            aria-label="上一张"
            disabled={!loop && active === 0}
            onClick={goPrev}
            className={cn(arrowBase, "left-2")}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="下一张"
            disabled={!loop && active === count - 1}
            onClick={goNext}
            className={cn(arrowBase, "right-2")}
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </>
      )}

      {showDots && hasControls && (
        <div
          role="group"
          aria-label="幻灯片导航"
          className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2"
        >
          {slides.map((_, i) => {
            const on = i === active;
            return (
              <button
                key={i}
                type="button"
                aria-label={`转到第 ${i + 1} 张`}
                aria-current={on ? "true" : undefined}
                data-active={on ? "" : undefined}
                onClick={() => goTo(i)}
                style={DOT_TRANSITION}
                className={cn(
                  "h-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  on ? "w-5 bg-primary" : "w-2 bg-foreground/30 hover:bg-foreground/50",
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
