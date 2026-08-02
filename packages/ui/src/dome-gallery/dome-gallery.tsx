"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { DomeGalleryImage, DomeGalleryProps } from "./dome-gallery.types";

// 吸取自 React Bits DomeGallery：图片瓦片贴在一个 CSS 3D 半球内壁，拖拽旋转球体浏览，点击瓦片放大查看。
// 瑚琏化：① 去掉 @use-gesture/react 依赖，改用原生 PointerEvents + requestAnimationFrame 自搓拖拽 + 惯性滑行；
//        ② 去掉原版上百行命令式 DOM 克隆放大动画，改为 React 状态驱动 + motion(AnimatePresence) 的灯箱 overlay（DOM 两态一致）；
//        ③ 颜色全吃 token（边缘渐隐 / 中心遮罩走 var(--color-background)，瓦片占位走 chart token），无品牌写死色；
//        ④ reduced-motion → useReducedMotion() 关惯性/自转/放大过渡，但内容 DOM 不变（避 reveal 不可见坑）；
//        ⑤ "use client"（用 ref/effect/PointerEvents）；关键帧 hulian-dome-gallery 落 preset.css 供自转引用。

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};

interface Tile {
  src: string;
  alt: string;
  /** 经度角（横向，rotateY 基数） */
  lon: number;
  /** 纬度角（纵向，rotateX 基数） */
  lat: number;
}

/** 把图片池铺到球面瓦片上：经向 segments 列，纬向取中间几圈，循环填充、相邻去重。 */
function buildTiles(images: DomeGalleryImage[], segments: number): Tile[] {
  const cols = Math.max(4, Math.round(segments));
  // 纬向只取中间 5 圈，避开两极（两极瓦片会被严重挤压）
  const latRows = [-30, -15, 0, 15, 30];
  const lonStep = 360 / cols;

  const coords: { lon: number; lat: number }[] = [];
  for (let c = 0; c < cols; c++) {
    const lon = -180 + c * lonStep;
    // 奇偶列纬度错位，形成砖墙交错排布
    const rows = c % 2 === 0 ? latRows : latRows.map((y) => y + 7);
    for (const lat of rows) coords.push({ lon, lat });
  }

  const pool: { src: string; alt: string }[] =
    images.length === 0
      ? [{ src: "", alt: "" }]
      : images.map((im) =>
          typeof im === "string"
            ? { src: im, alt: "" }
            : { src: im.src ?? "", alt: im.alt ?? "" },
        );

  return coords.map((c, i) => {
    const img = pool[i % pool.length]!;
    return { src: img.src, alt: img.alt, lon: c.lon, lat: c.lat };
  });
}

/** 占位渐变（无 src 时显示），吃 chart token，明暗自适应 */
function placeholderBg(i: number): string {
  const chart = (i % 5) + 1;
  return `linear-gradient(135deg, var(--color-chart-${chart}) 0%, var(--color-muted) 140%)`;
}

export function DomeGallery({
  images,
  segments = 24,
  fit = 0.5,
  minRadius = 380,
  maxRadius = 1600,
  maxVerticalRotationDeg = 6,
  dragSensitivity = 18,
  dragDampening = 0.55,
  grayscale = true,
  imageBorderRadius = "16px",
  openedImageBorderRadius = "24px",
  overlayColor = "var(--color-background)",
  enlargeTransitionMs = 320,
  autoRotate = false,
  className,
  style,
  ...props
}: DomeGalleryProps &
  Omit<HTMLAttributes<HTMLDivElement>, "style" | "className">) {
  const reduce = useReducedMotion();
  const copy = useComponentLocale().domeGallery ?? zhCN.components!.domeGallery!;
  const resolvedImages = useMemo<DomeGalleryImage[]>(
    () =>
      images ??
      Array.from({ length: 14 }, (_, index) => ({
        src: "",
        alt: copy.image(index + 1),
      })),
    [copy, images],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  const [radius, setRadius] = useState(520);
  const [opened, setOpened] = useState<Tile | null>(null);

  const tiles = useMemo(
    () => buildTiles(resolvedImages, segments),
    [resolvedImages, segments],
  );

  // 旋转状态保存在 ref（高频更新走命令式 transform，避免 React 重渲染抖动）
  const rotation = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const startRot = useRef({ x: 0, y: 0 });
  const lastMove = useRef<{ x: number; y: number; t: number } | null>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    const el = sphereRef.current;
    if (!el) return;
    const { x, y } = rotation.current;
    el.style.transform = `translateZ(${-radius}px) rotateX(${x}deg) rotateY(${y}deg)`;
  }, [radius]);

  // 容器尺寸 → 半径（ResizeObserver）
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]!.contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const basis = Math.min(w, h);
      const r = clamp(Math.round(basis * fit), minRadius, maxRadius);
      setRadius(r);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, minRadius, maxRadius]);

  useEffect(() => {
    applyTransform();
  }, [applyTransform]);

  const stopInertia = useCallback(() => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    if (reduce) return;
    const d = clamp(dragDampening, 0, 1);
    const friction = 0.92 + 0.06 * d;
    const stopThreshold = 0.02;
    const step = () => {
      velocity.current.x *= friction;
      velocity.current.y *= friction;
      if (
        Math.abs(velocity.current.x) < stopThreshold &&
        Math.abs(velocity.current.y) < stopThreshold
      ) {
        rafId.current = null;
        return;
      }
      const nextX = clamp(
        rotation.current.x - velocity.current.y / dragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg,
      );
      const nextY = wrapAngleSigned(
        rotation.current.y + velocity.current.x / dragSensitivity,
      );
      rotation.current = { x: nextX, y: nextY };
      applyTransform();
      rafId.current = requestAnimationFrame(step);
    };
    stopInertia();
    rafId.current = requestAnimationFrame(step);
  }, [
    reduce,
    dragDampening,
    dragSensitivity,
    maxVerticalRotationDeg,
    applyTransform,
    stopInertia,
  ]);

  // 无拖拽时的缓慢自转
  useEffect(() => {
    if (!autoRotate || reduce) return;
    let id: number;
    const tick = () => {
      if (!dragging.current && rafId.current == null && !opened) {
        rotation.current = {
          ...rotation.current,
          y: wrapAngleSigned(rotation.current.y + 0.08),
        };
        applyTransform();
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [autoRotate, reduce, opened, applyTransform]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (opened) return;
      stopInertia();
      dragging.current = true;
      moved.current = false;
      startPos.current = { x: e.clientX, y: e.clientY };
      startRot.current = { ...rotation.current };
      lastMove.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      velocity.current = { x: 0, y: 0 };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* best effort */
      }
    },
    [opened, stopInertia],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current || !startPos.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (!moved.current && dx * dx + dy * dy > 16) moved.current = true;
      const nextX = clamp(
        startRot.current.x - dy / dragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg,
      );
      const nextY = wrapAngleSigned(startRot.current.y + dx / dragSensitivity);
      rotation.current = { x: nextX, y: nextY };
      applyTransform();

      const now = performance.now();
      const prev = lastMove.current;
      if (prev) {
        const dt = Math.max(1, now - prev.t);
        velocity.current = {
          x: ((e.clientX - prev.x) / dt) * 16,
          y: ((e.clientY - prev.y) / dt) * 16,
        };
      }
      lastMove.current = { x: e.clientX, y: e.clientY, t: now };
    },
    [dragSensitivity, maxVerticalRotationDeg, applyTransform],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* best effort */
      }
      if (
        moved.current &&
        (Math.abs(velocity.current.x) > 0.05 ||
          Math.abs(velocity.current.y) > 0.05)
      ) {
        startInertia();
      }
    },
    [startInertia],
  );

  const openTile = useCallback((tile: Tile) => {
    if (moved.current) return;
    setOpened(tile);
  }, []);

  useEffect(
    () => () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    },
    [],
  );

  const overlayMaskColor = overlayColor;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full w-full select-none overflow-hidden",
        className,
      )}
      style={style}
      {...props}
    >
      {/* 3D 舞台 */}
      <div
        className="absolute inset-0 grid touch-none place-items-center [contain:layout_paint_size]"
        style={{ perspective: `${radius * 2}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label={copy.label}
      >
        <div
          ref={sphereRef}
          className="relative [transform-style:preserve-3d] will-change-transform"
          style={{ transform: `translateZ(${-radius}px)` }}
        >
          {tiles.map((tile, i) => {
            const tileSize = (radius * 2 * Math.PI) / Math.max(4, segments);
            return (
              <button
                key={`${tile.lon},${tile.lat},${i}`}
                type="button"
                aria-label={tile.alt || copy.viewImage}
                onClick={() => openTile(tile)}
                className={cn(
                  "group absolute left-1/2 top-1/2 block cursor-pointer overflow-hidden",
                  "border border-border/40 bg-muted",
                  "outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
                style={{
                  width: tileSize,
                  height: tileSize,
                  marginLeft: -tileSize / 2,
                  marginTop: -tileSize / 2,
                  borderRadius: imageBorderRadius,
                  transform: `rotateY(${tile.lon}deg) rotateX(${tile.lat}deg) translateZ(${radius}px)`,
                  transition: reduce
                    ? "none"
                    : `transform ${enlargeTransitionMs}ms ease`,
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                }}
              >
                {tile.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tile.src}
                    alt={tile.alt}
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover transition-[filter] duration-300 group-hover:[filter:none]"
                    style={{ filter: grayscale ? "grayscale(1)" : "none" }}
                  />
                ) : (
                  <span
                    aria-hidden
                    className="pointer-events-none block h-full w-full"
                    style={{ backgroundImage: placeholderBg(i) }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 中心暗角 + 边缘渐隐：聚焦中部、柔化球缘，吃 token 底色 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, transparent 55%, ${overlayMaskColor} 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${overlayMaskColor}, transparent)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-24"
        style={{
          backgroundImage: `linear-gradient(to top, ${overlayMaskColor}, transparent)`,
        }}
      />

      {/* 放大查看灯箱：React 状态驱动 + motion 过渡（DOM 两态一致：reduce 时去过渡不去节点） */}
      <LazyMotionProvider>
        <AnimatePresence>
          {opened && (
            <m.div
              key="dg-viewer"
              className="absolute inset-0 z-20 flex items-center justify-center p-8 sm:p-16"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: enlargeTransitionMs / 1000 }}
              onClick={() => setOpened(null)}
              role="dialog"
              aria-modal="true"
              aria-label={opened.alt || copy.enlargedView}
            >
              <div
                aria-hidden
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: "color-mix(in oklch, var(--color-foreground) 40%, transparent)" }}
              />
              <m.div
                className="relative z-10 aspect-square w-full max-w-md overflow-hidden border border-border shadow-xl"
                style={{ borderRadius: openedImageBorderRadius }}
                initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduce ? undefined : { scale: 0.7, opacity: 0 }}
                transition={{ duration: enlargeTransitionMs / 1000, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {opened.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opened.src}
                    alt={opened.alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="block h-full w-full"
                    style={{ backgroundImage: placeholderBg(0) }}
                  />
                )}
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotionProvider>
    </div>
  );
}
