"use client";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/cn";

// 全屏图片查看器 / Lightbox。实现要点：
// 1. 受控 index —— 外部传 index + onIndexChange，组件不自管当前页，翻页/点缩略图都回调出去。
// 2. 缩放/平移状态(scale/offset)是「视图态」而非「数据态」，切图(index 变)与开关(open 变)时必须重置，
//    否则上一张放大的残留会带到下一张。用 useEffect 监听 index/open 归零。
// 3. portal + 锁滚复用 dialog 模式：portal 到 document.body，open 时把 body.overflow 设 hidden 并在
//    卸载/关闭时还原(记录原值)。SSR 安全：mounted 标志确保只在浏览器侧 createPortal。
// 4. 缩放锚点已做指针锚定 —— 滚轮以光标处为不动点缩放(围绕指针调整 offset)，体验接近原生看图。
// 5. 性能：images 可能很多，只渲染当前 index 的大图(缩略图条用小尺寸 src 即原图，浏览器自行缓存)。
// 6. 无障碍：role=dialog + aria-modal，open 时把焦点移入面板，关闭后归还触发元素；Esc 关闭、← → 翻页、
//    +/- 缩放、双击 1x/2x 切换。

export interface ImageViewerImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ImageViewerImage[];
  index: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.4;
const DOUBLE_TAP_SCALE = 2;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

export function ImageViewer({
  open,
  onOpenChange,
  images,
  index,
  onIndexChange,
  className,
}: ImageViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // 大图加载态：切图时先置 false → 显示 spinner + 占位，onLoad 后淡入，消除「空白后突现」。
  const [loaded, setLoaded] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // 拖拽平移：记录起点指针与起点 offset，pointermove 时算增量
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; ox: number; oy: number } | null>(
    null,
  );

  const titleId = useId();
  const total = images.length;
  const current = images[index];

  // SSR 安全：仅浏览器侧 portal
  useEffect(() => setMounted(true), []);

  // 切图 / 开关 → 重置缩放与平移（视图态归零）+ 重置加载态
  useLayoutEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    // 缓存命中时 onLoad 可能早于挂载，这里同步用 img.complete 兜底，避免 spinner 卡住。
    const el = imgRef.current;
    setLoaded(!!el && el.complete && el.naturalWidth > 0);
  }, [index, open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const goPrev = useCallback(() => {
    if (index > 0) onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const goNext = useCallback(() => {
    if (index < total - 1) onIndexChange(index + 1);
  }, [index, total, onIndexChange]);

  // 以舞台中心为锚点的步进缩放（键盘 +/-）
  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = clamp(s + delta, MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // 锁滚 + 焦点管理（复用 dialog 思路）
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // 焦点移入面板
    const id = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(id);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // 键盘：Esc 关闭 / ← → 翻页 / +/- 缩放
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomBy(SCALE_STEP);
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomBy(-SCALE_STEP);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, goPrev, goNext, zoomBy]);

  // 滚轮缩放 —— 以光标处为锚点（指针锚定）。非被动监听以便 preventDefault 阻止页面滚动。
  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      // 指针相对舞台中心的位移
      const px = e.clientX - (rect.left + rect.width / 2);
      const py = e.clientY - (rect.top + rect.height / 2);
      setScale((prevScale) => {
        const factor = e.deltaY < 0 ? 1 + SCALE_STEP : 1 / (1 + SCALE_STEP);
        const nextScale = clamp(prevScale * factor, MIN_SCALE, MAX_SCALE);
        if (nextScale === MIN_SCALE) {
          setOffset({ x: 0, y: 0 });
          return MIN_SCALE;
        }
        // 让光标下的图像点缩放前后落在同一屏幕位置：
        // screen = center + offset + point*scale ⇒ 保持 screen 不变求新 offset
        const ratio = nextScale / prevScale;
        setOffset((o) => ({
          x: px - (px - o.x) * ratio,
          y: py - (py - o.y) * ratio,
        }));
        return nextScale;
      });
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [open]);

  // 双击：1x / 2x 切换
  const onDoubleClick = useCallback(() => {
    setScale((s) => {
      if (s > MIN_SCALE) {
        setOffset({ x: 0, y: 0 });
        return MIN_SCALE;
      }
      return DOUBLE_TAP_SCALE;
    });
  }, []);

  // 拖拽平移（仅放大后）
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scale <= MIN_SCALE) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    setOffset({ x: d.ox + (e.clientX - d.startX), y: d.oy + (e.clientY - d.startY) });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  };

  if (!mounted || !open || total === 0 || !current) return null;

  const imgStyle: CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
    cursor: scale > MIN_SCALE ? (dragRef.current ? "grabbing" : "grab") : "zoom-in",
    transition: dragRef.current ? "none" : "transform 160ms ease-out",
    touchAction: "none",
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={panelRef}
      tabIndex={-1}
      className={cn("fixed inset-0 z-50 flex flex-col bg-black/90 outline-none", className)}
    >
      {/* 顶部条：序号 + caption/alt + 关闭 */}
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 text-white">
        <div className="min-w-0 flex-1">
          <span id={titleId} className="text-sm font-medium tabular-nums">
            {index + 1} / {total}
          </span>
          {(current.caption ?? current.alt) && (
            <p className="mt-0.5 truncate text-xs text-white/70">{current.caption ?? current.alt}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="关闭图片查看器"
          onClick={close}
          className="grid size-9 place-items-center rounded-[var(--radius)] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 舞台：点空白处关闭；图片区域阻止冒泡 */}
      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {/* 加载中：spinner（图未就绪时显示，淡入图后消失） */}
        {!loaded && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
            <span className="size-9 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
          </div>
        )}

        {/* 仅渲染当前图（不一次性塞所有大图）。加载完成淡入。 */}
        <img
          key={current.src}
          ref={imgRef}
          src={current.src}
          alt={current.alt ?? ""}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onDoubleClick={onDoubleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={imgStyle}
          className={cn(
            "max-h-full max-w-full select-none object-contain transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />

        {/* 左右翻页 */}
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="上一张"
              disabled={index === 0}
              onClick={goPrev}
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="下一张"
              disabled={index === total - 1}
              onClick={goNext}
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 底部缩略图条 */}
      {total > 1 && (
        <div className="shrink-0 overflow-x-auto px-4 py-3">
          <div className="mx-auto flex w-max gap-2">
            {images.map((img, i) => (
              <button
                key={img.src + i}
                type="button"
                aria-label={`查看第 ${i + 1} 张`}
                aria-current={i === index}
                onClick={() => onIndexChange(i)}
                className={cn(
                  "h-14 w-20 shrink-0 overflow-hidden rounded-[var(--radius)] border-2 transition-opacity",
                  i === index ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <img src={img.src} alt="" draggable={false} className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
