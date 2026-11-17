"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { mergeRefs } from "../lib/merge-refs";
import { warnOnce } from "../lib/warn-once";
import type { FigureRasterProps, RasterColor } from "./paper.types";

// 图里的一块栅格（热力图、注意力矩阵、显微照片）：
//  · 画面仍是一张 <svg>，栅格是其中的 <image>。作者的 draw 在离屏 canvas 上画，编码成 PNG
//    data URL 写进 href。所以坐标走 viewBox，演示层按舞台缩放、打印分图各画各的、导出 SVG 原样带走 ——
//    这三条链路都不用知道「这里有 canvas」。
//  · 为什么不直接放 <canvas>：canvas 进不了 SVG（除非 foreignObject，Safari 里配 viewBox 缩放有老问题，
//    导出也得特判），而拆成 HTML 混排会破掉「图的画面是单独一个 <svg>」的约定。
//  · 颜色：draw 里用 color("var(--color-chart-1)") 取色，在这个 <image> 自己的计算样式上解析，
//    所以导出槽里的 data-theme="light" 自然生效；页面切换明暗时重画。
//  · pixelated：数据栅格的一个像素就是一个数据格。编码时按整数倍最近邻放大，
//    Word、PDF 转换器这些不认 image-rendering 的地方也是锐利的方块。
//  · 在 layout effect 里画：浏览器打印前 Paper 用 flushSync 切到打印态，分图的栅格在打印快照之前就画好。
//  · 服务端渲染出没有 href 的 <image>，viewBox 已经占好位，不跳动。

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** 编码后的长边上限（像素）：pixelated 放大时不超过它。 */
const MAX_ENCODED = 4096;
/** pixelated 放大的目标：编码尺寸至少是 SVG 显示尺寸的这么多倍（高分屏、打印）。 */
const OVERSAMPLE = 3;

/**
 * 页面明暗变化（任一处 data-theme 改动、系统明暗切换）时通知。所有栅格共用一个观察者。
 * 只听 data-theme（tokens 的明暗开关）：听 class 的话，页面上任何悬停样式变化都会让栅格重新编码。
 */
const themeListeners = new Set<() => void>();
let stopThemeWatch: (() => void) | null = null;

function watchTheme(listener: () => void) {
  themeListeners.add(listener);
  if (!stopThemeWatch && typeof window !== "undefined") {
    const emit = () => {
      for (const l of themeListeners) l();
    };
    const observer = typeof MutationObserver === "undefined" ? null : new MutationObserver(emit);
    observer?.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"], subtree: true });
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", emit);
    stopThemeWatch = () => {
      observer?.disconnect();
      media?.removeEventListener?.("change", emit);
    };
  }
  return () => {
    themeListeners.delete(listener);
    if (themeListeners.size === 0) {
      stopThemeWatch?.();
      stopThemeWatch = null;
    }
  };
}

/** 在元素 el 的层叠上下文里把 CSS 颜色解析成 0–255 的 RGBA。 */
function createColorReader(el: SVGElement) {
  const cache = new Map<string, RasterColor>();
  let pixel: CanvasRenderingContext2D | null | undefined;
  return (css: string): RasterColor => {
    const hit = cache.get(css);
    if (hit) return hit;
    const before = el.style.getPropertyValue("color");
    el.style.setProperty("color", css);
    const computed = getComputedStyle(el).color;
    if (before) el.style.setProperty("color", before);
    else el.style.removeProperty("color");
    if (pixel === undefined) {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      pixel = c.getContext("2d", { willReadFrequently: true });
    }
    let out: RasterColor = [0, 0, 0, 0];
    if (pixel) {
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillStyle = "#000";
      pixel.fillStyle = computed;
      pixel.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data;
      out = [r, g, b, a];
    }
    cache.set(css, out);
    return out;
  };
}

export function FigureRaster({
  x = 0,
  y = 0,
  width,
  height,
  resolution,
  draw,
  pixelated = false,
  preserveAspectRatio = "none",
  className,
  style,
  ref,
  ...rest
}: FigureRasterProps) {
  const node = useRef<SVGImageElement>(null);
  const [cols, rows] = resolution;
  // 明暗切换时加一，触发重画。
  const [theme, setTheme] = useState(0);
  const bump = useCallback(() => setTheme((n) => n + 1), []);
  useEffect(() => watchTheme(bump), [bump]);

  useIsoLayoutEffect(() => {
    const el = node.current;
    if (!el) return;
    const w = Math.floor(cols);
    const h = Math.floor(rows);
    if (!(w > 0 && h > 0)) {
      warnOnce(`FigureRaster:resolution:${cols}x${rows}`, `[FigureRaster] resolution 必须是正整数，收到 [${cols}, ${rows}]。`);
      el.removeAttribute("href");
      return;
    }
    const source = document.createElement("canvas");
    source.width = w;
    source.height = h;
    const ctx = source.getContext("2d");
    if (!ctx) return;
    draw(ctx, { width: w, height: h, color: createColorReader(el) });

    let out = source;
    if (pixelated) {
      const target = Math.max(width, height) * OVERSAMPLE;
      const factor = Math.max(1, Math.min(Math.ceil(target / Math.max(w, h)), Math.floor(MAX_ENCODED / Math.max(w, h))));
      if (factor > 1) {
        out = document.createElement("canvas");
        out.width = w * factor;
        out.height = h * factor;
        const big = out.getContext("2d");
        if (big) {
          big.imageSmoothingEnabled = false;
          big.drawImage(source, 0, 0, out.width, out.height);
        } else {
          out = source;
        }
      }
    }
    el.setAttribute("href", out.toDataURL("image/png"));
  }, [cols, rows, draw, pixelated, width, height, theme]);

  return (
    <image
      {...rest}
      ref={mergeRefs<SVGImageElement>(ref, node)}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio={preserveAspectRatio}
      data-figure-raster=""
      className={cn(pixelated && "[image-rendering:pixelated]", className)}
      style={style}
    />
  );
}
