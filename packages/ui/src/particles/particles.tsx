"use client";

// 吸取自 magicui.design Particles：canvas RAF 浮动粒子场 + 鼠标靠近磁吸位移。
// 瑚琏化要点：
//   1. 颜色吃主题：不传 color 时读 CSS var(--color-foreground)（瑚琏 token），
//      监听 data-theme MutationObserver 随明暗切换自动更新。
//   2. reduced-motion：prefersReducedMotion 为真时不启动 RAF，只渲染静止一帧。
//   3. SSR 安全："use client" + 所有随机/RAF/BOM 全在 useEffect 内。
//   4. DPR 自适应（devicePixelRatio）；ResizeObserver 监听容器。
//   5. 卸载时 cancelAnimationFrame + disconnect ResizeObserver + disconnect MutationObserver。

import { useCallback, useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import type { ParticlesProps } from "./particles.types";

// ── 内部类型 ──────────────────────────────────────────────────────────────────

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────

/**
 * 将多种格式颜色字符串解析为 [r, g, b]。
 * 支持 #rrggbb / #rgb / rgb(r,g,b) / rgba(r,g,b,a)。
 * 解析失败返回 [255, 255, 255]（白色兜底）。
 */
function parseColorToRgb(raw: string): [number, number, number] {
  const str = raw.trim();
  if (!str) return [255, 255, 255];

  // 首选：离屏 1×1 canvas 让浏览器解析任意 CSS 颜色（含 oklch / color() 等现代色彩空间）。
  // 这是关键——瑚琏 token 是 oklch 格式，手动正则解析不了，会落到白色兜底导致默认色不可见。
  if (typeof document !== "undefined") {
    try {
      const off = document.createElement("canvas");
      off.width = off.height = 1;
      const ctx = off.getContext("2d");
      if (ctx) {
        ctx.fillStyle = str;
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return [d[0]!, d[1]!, d[2]!];
      }
    } catch {
      /* SSR / 无 canvas → 落到下方手动解析 */
    }
  }

  // 兜底：rgb() / rgba()
  const rgbMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
  }

  // 兜底：#hex
  let hex = str.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length === 6) {
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  return [255, 255, 255];
}

/**
 * 从挂载 DOM 节点读取瑚琏主题前景色 token。
 * 按优先级：CSS var --color-foreground → computed color。
 * 返回 `rgb(r, g, b)` 格式字符串，供 parseColorToRgb 消费。
 */
function readForegroundColor(el: HTMLElement): string {
  const style = window.getComputedStyle(el);
  // 直接返回 --color-foreground token 原值（瑚琏 token 是合法 oklch CSS 颜色），
  // 交给 parseColorToRgb 的离屏 canvas 解析；没有 token 时退到 computed color。
  const tokenVal = style.getPropertyValue("--color-foreground").trim();
  return tokenVal || style.color || "rgb(255, 255, 255)";
}

// remapValue: 将 value 从 [start1, end1] 线性映射到 [start2, end2]，结果最小为 0
function remapValue(v: number, s1: number, e1: number, s2: number, e2: number): number {
  const r = ((v - s1) * (e2 - s2)) / (e1 - s1) + s2;
  return r > 0 ? r : 0;
}

// ── 组件 ─────────────────────────────────────────────────────────────────────

export function Particles({
  className,
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color,
  vx = 0,
  vy = 0,
  refresh,
}: ParticlesProps) {
  // refs —— 不触发重渲染的运行时状态
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const circlesRef = useRef<Circle[]>([]);
  const canvasSize = useRef({ w: 0, h: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  // 缓存当前实际使用的 rgb，避免每帧重读 CSS
  const rgbRef = useRef<[number, number, number]>([255, 255, 255]);

  // ── 颜色解析 ──────────────────────────────────────────────────────────────

  const resolveColor = useCallback(() => {
    if (!containerRef.current) return;
    const raw = color ?? readForegroundColor(containerRef.current);
    rgbRef.current = parseColorToRgb(raw);
  }, [color]);

  // ── Canvas 工具 ────────────────────────────────────────────────────────────

  const makeCircle = useCallback((): Circle => {
    const { w, h } = canvasSize.current;
    return {
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.random() * h),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    };
  }, [size]);

  const drawCircle = useCallback(
    (circle: Circle, update = false) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const [r, g, b] = rgbRef.current;
      const { x, y, translateX, translateY, size: s, alpha } = circle;
      const dpr = window.devicePixelRatio || 1;
      ctx.translate(translateX, translateY);
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
      // 还原 transform（保留 dpr scale）
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) {
        circlesRef.current.push(circle);
      }
    },
    [],
  );

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
  }, []);

  // ── 初始化 / 尺寸变更 ─────────────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!container || !canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvasSize.current = { w, h };

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // 重绘粒子
    circlesRef.current = [];
    for (let i = 0; i < quantity; i++) {
      drawCircle(makeCircle());
    }
  }, [quantity, drawCircle, makeCircle]);

  // ── RAF 动画帧 ─────────────────────────────────────────────────────────────

  // 用 stable ref 存 animate，避免 RAF 回调里持有旧闭包
  const animateRef = useRef<() => void>(() => {});

  const animate = useCallback(() => {
    clearCanvas();
    const { w, h } = canvasSize.current;

    circlesRef.current.forEach((circle, i) => {
      // 边缘淡入淡出
      const edge = [
        circle.x + circle.translateX - circle.size,
        w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        h - circle.y - circle.translateY - circle.size,
      ];
      const closest = Math.min(...edge);
      const remap = parseFloat(remapValue(closest, 0, 20, 0, 1).toFixed(2));

      if (remap > 1) {
        circle.alpha = Math.min(circle.alpha + 0.02, circle.targetAlpha);
      } else {
        circle.alpha = circle.targetAlpha * remap;
      }

      // 漂移
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;

      // 鼠标磁吸（staticity 越大越不动，ease 越大越迟钝）
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

      drawCircle(circle, true);

      // 超出边界 → 回收重建
      if (
        circle.x < -circle.size ||
        circle.x > w + circle.size ||
        circle.y < -circle.size ||
        circle.y > h + circle.size
      ) {
        circlesRef.current.splice(i, 1);
        drawCircle(makeCircle());
      }
    });

    rafRef.current = window.requestAnimationFrame(animateRef.current);
  }, [clearCanvas, vx, vy, staticity, ease, drawCircle, makeCircle]);

  // 每次 animate 引用更新时同步到 stable ref，RAF 回调始终用最新版本
  animateRef.current = animate;

  // ── 鼠标位置（canvas 坐标系居中原点）────────────────────────────────────

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      // 仅 canvas 范围内更新
      if (x > -w / 2 && x < w / 2 && y > -h / 2 && y < h / 2) {
        mouse.current = { x, y };
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── 主 effect：初始化 + 动画 + 主题监听 ──────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 获取 2D context（jsdom 会返回 null，安全退出）
    ctxRef.current = canvas.getContext("2d");
    if (!ctxRef.current) return;

    // 解析颜色
    resolveColor();

    // reduced-motion 检测
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 初始绘制
    resizeCanvas();

    if (!prefersReducedMotion) {
      // 启动 RAF 动画
      rafRef.current = window.requestAnimationFrame(animateRef.current);
    }
    // prefersReducedMotion 时已由 resizeCanvas 画出静止一帧，不启动 RAF

    // ResizeObserver：监听容器尺寸变化
    const ro = new ResizeObserver(() => {
      // 停止当前 RAF，重新初始化
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      resizeCanvas();
      if (!prefersReducedMotion) {
        rafRef.current = window.requestAnimationFrame(animateRef.current);
      }
    });
    ro.observe(container);

    // MutationObserver：监听 data-theme 切换（明暗主题），无 color prop 时刷新颜色
    let mo: MutationObserver | null = null;
    if (!color) {
      mo = new MutationObserver(() => {
        resolveColor();
      });
      // 监听 <html> 上的 attribute 变化（data-theme / class）
      const root = document.documentElement;
      mo.observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
    }

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      ro.disconnect();
      mo?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, resolveColor, resizeCanvas]);

  // refresh prop 变化时强制重绘
  useEffect(() => {
    if (ctxRef.current) {
      resizeCanvas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
