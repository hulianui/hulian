"use client";

// 吸取自 magicui.design FlickeringGrid（canvas + RAF + ResizeObserver + IntersectionObserver）。
// 瑚琏化重点：
//   1. 颜色吃主题 token：默认从容器 computed `color` 解析 RGB（= text-foreground），
//      明暗切换自动跟随；`color` prop 覆盖时走与原版一致的离屏 canvas toRGBA 路径。
//   2. reduced-motion：matchMedia 为真 → 跳过 RAF，渲染单帧静态低透网格（无闪烁）。
//   3. SSR 安全：canvas / RAF / window 全在 useEffect，"use client" 声明。
//   4. DPR 自适应（devicePixelRatio），ResizeObserver 跟容器，IntersectionObserver 节流。
//   5. 卸载时清理所有 RAF + Observer。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { FlickeringGridProps } from "./flickering-grid.types";

// -------------------------------------------------------------------
// 辅助：把任意 CSS 颜色字符串解析为 "rgba(r, g, b," 前缀（不含透明度）。
// 通过 1×1 离屏 canvas fillStyle → getImageData 精确拿到 r/g/b。
// jsdom 下 getContext 返回 null 时回落 "rgba(0, 0, 0,"（安全兜底）。
// -------------------------------------------------------------------
function toRGBAPrefix(color: string): string {
  if (typeof window === "undefined") return "rgba(0, 0, 0,";
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "rgba(0, 0, 0,";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
  return `rgba(${r}, ${g}, ${b},`;
}

// -------------------------------------------------------------------
// 辅助：从容器 DOM 解析当前主题前景色 → "rgba(r, g, b," 前缀。
// 优先读 CSS 变量 --color-foreground（瑚琏 token），
// 回落 getComputedStyle(el).color（= CSS `color` 属性，通常由 text-foreground 设）。
// 如此明暗主题切换时颜色自动跟随，无需 JS 监听主题变更。
// -------------------------------------------------------------------
function resolveThemeColorPrefix(el: HTMLElement): string {
  const style = getComputedStyle(el);
  // 优先尝试瑚琏 token CSS 变量
  const cssVar = style.getPropertyValue("--color-foreground").trim();
  if (cssVar) {
    return toRGBAPrefix(cssVar);
  }
  // 回落：computed color（text-foreground Tailwind 类设置的 color 值）
  const computed = style.color;
  if (computed) {
    return toRGBAPrefix(computed);
  }
  return "rgba(0, 0, 0,";
}

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color,
  width,
  height,
  className,
  maxOpacity = 0.3,
  style,
  ...props
}: FlickeringGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver 控制：只在可见时跑 RAF（省电 / 省 CPU）。
  const [isInView, setIsInView] = useState(false);
  // 当前 canvas 尺寸（CSS px），驱动 canvas style，避免拉伸。
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // -------------------------------------------------------------------
  // 颜色前缀：prop color 优先，否则运行时从容器解析主题 token。
  // useMemo 在 SSR 时 toRGBAPrefix 里 window guard 会回落，安全。
  // 注意：主题切换（dark/light toggle）会改变 computed color，
  // 但此 memo 依赖 [color] 不含主题标志，因此主题切换后需要重新
  // 触发 effect（通过 canvasSize 变化或 ResizeObserver 触发）重新算。
  // 实际上 getComputedStyle 每次 effect 重跑都现取，保证正确。
  // -------------------------------------------------------------------
  const staticColorPrefix = useMemo(() => {
    if (color && typeof window !== "undefined") {
      return toRGBAPrefix(color);
    }
    return null; // null = 运行时从容器解析
  }, [color]);

  // -------------------------------------------------------------------
  // setupCanvas：初始化 canvas 物理尺寸（×DPR）、方格数组，返回 gridParams。
  // -------------------------------------------------------------------
  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cols = Math.ceil(w / (squareSize + gridGap));
      const rows = Math.ceil(h / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }
      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  // -------------------------------------------------------------------
  // updateSquares：按 deltaTime 随机翻转部分方格透明度（时间步归一化）。
  // -------------------------------------------------------------------
  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  // -------------------------------------------------------------------
  // drawGrid：清空 → 按每格 opacity 绘制矩形。
  // colorPrefix 传入而非闭包，便于每帧刷新（主题切换）。
  // -------------------------------------------------------------------
  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      canvasW: number,
      canvasH: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
      colorPrefix: string,
    ) => {
      ctx.clearRect(0, 0, canvasW, canvasH);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${colorPrefix}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr,
          );
        }
      }
    },
    [squareSize, gridGap],
  );

  // -------------------------------------------------------------------
  // 主 effect：canvas 初始化 + RAF 动画循环 + ResizeObserver + IntersectionObserver。
  // reduced-motion：prefers-reduced-motion:reduce → 跳过 RAF，只画一帧静态网格。
  // -------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // jsdom：无 2d context，安全退出

    // reduced-motion 检测
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number | null = null;
    let gridParams: ReturnType<typeof setupCanvas> | null = null;

    // 获取当前颜色前缀：prop color 优先，否则从容器解析主题 token。
    const getColorPrefix = () =>
      staticColorPrefix !== null ? staticColorPrefix : resolveThemeColorPrefix(container);

    const updateCanvasSize = () => {
      const newW = width ?? container.clientWidth;
      const newH = height ?? container.clientHeight;
      if (newW === 0 || newH === 0) return;
      setCanvasSize({ width: newW, height: newH });
      gridParams = setupCanvas(canvas, newW, newH);

      // reduced-motion：只画一帧静态网格，不启 RAF。
      if (prefersReduced && gridParams) {
        const cp = getColorPrefix();
        drawGrid(
          ctx,
          canvas.width,
          canvas.height,
          gridParams.cols,
          gridParams.rows,
          gridParams.squares,
          gridParams.dpr,
          cp,
        );
      }
    };

    updateCanvasSize();

    // reduced-motion 模式下不启 RAF
    if (!prefersReduced) {
      let lastTime = 0;

      const animate = (time: number) => {
        if (!isInView || !gridParams) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;

        updateSquares(gridParams.squares, deltaTime);
        const cp = getColorPrefix(); // 每帧现取：支持主题实时切换
        drawGrid(
          ctx,
          canvas.width,
          canvas.height,
          gridParams.cols,
          gridParams.rows,
          gridParams.squares,
          gridParams.dpr,
          cp,
        );
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
    }

    // ResizeObserver：容器尺寸变化时重算网格
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    // IntersectionObserver：页面不可见时暂停动画节省资源
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [
    setupCanvas,
    updateSquares,
    drawGrid,
    width,
    height,
    isInView,
    staticColorPrefix,
  ]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={style}
      className={cn("pointer-events-none h-full w-full", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          width: canvasSize.width || "100%",
          height: canvasSize.height || "100%",
        }}
      />
    </div>
  );
}
