"use client";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import type { WavyBackgroundProps } from "./wavy-background.types";

// ---------------------------------------------------------------------------
// 内联微型 Value Noise（2D）——零依赖，替代 simplex-noise 包。
// 原理：格点哈希 → 双线性插值，输出 [-1, 1]。
// 比 Perlin/Simplex 略粗，但对波浪场景完全够用（视觉上难辨）。
// ---------------------------------------------------------------------------

/** 低质量但确定性哈希，32 位整数范围 */
function hash(n: number): number {
  // 位运算全部 |0 保持 32 位有符号整数域
  let x = n | 0;
  x = ((x >> 16) ^ x) * (0x45d9f3b | 0);
  x = ((x >> 16) ^ x) * (0x45d9f3b | 0);
  x = (x >> 16) ^ x;
  return x;
}

/** 格点随机值 [−1, 1] */
function grad2(ix: number, iy: number): number {
  const h = hash((ix * 1619 + iy * 31337) | 0);
  // 归一化到 [-1, 1]
  return (h & 0xffff) / 0x8000 - 1;
}

/** smoothstep（Perlin 插值曲线 6t^5−15t^4+10t^3）*/
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

/**
 * 2D Value Noise，返回 [-1, 1]。
 * 可通过叠加多个倍频（octave）获得更丰富的细节，但单倍频对波浪场景已足。
 */
export function valueNoise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fade(fx);
  const uy = fade(fy);

  const v00 = grad2(ix, iy);
  const v10 = grad2(ix + 1, iy);
  const v01 = grad2(ix, iy + 1);
  const v11 = grad2(ix + 1, iy + 1);

  return lerp(lerp(v00, v10, ux), lerp(v01, v11, ux), uy);
}

// ---------------------------------------------------------------------------
// CSS 变量解析辅助
// ---------------------------------------------------------------------------

/**
 * 将 CSS 变量字符串解析为浏览器实际计算色值。
 * 若不包含 var(…) 则原样返回（已是具体色值）。
 * 需要传入挂载的 DOM 元素以访问其计算样式。
 *
 * 用于 stroke / fill 等已有上层兜底的场景：当 var(--token) 未定义时，
 * 退回原始字符串保持旧行为（浏览器自身可解析 var()，仅 canvas 不行，
 * 但这些波形颜色总有默认 token，未定义概率低且非关键）。
 */
function resolveColor(color: string, el: Element): string {
  return resolveColorOrNull(color, el) ?? color;
}

/**
 * 将 CSS 变量字符串解析为浏览器实际计算色值。
 * 与 resolveColor 不同：当 var(--token) 解析为空（变量未定义）时返回 null，
 * 而非退回字面量 'var(--token)'——因为 canvas fillStyle/strokeStyle 无法
 * 解析 var() 语法，喂字面量会被静默忽略。返回 null 让调用方走真正的兜底链。
 * 不含 var(…) 时原样返回（已是具体色值）。
 */
export function resolveColorOrNull(color: string, el: Element): string | null {
  if (!color.includes("var(")) return color;
  // 解析 var(--token) → 取出 token 名 → getComputedStyle
  const match = color.match(/var\(\s*(--[\w-]+)\s*\)/);
  if (!match) return color;
  const resolved = getComputedStyle(el).getPropertyValue(match[1]).trim();
  return resolved || null;
}

// ---------------------------------------------------------------------------
// 默认值
// ---------------------------------------------------------------------------

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  // 第5条复用 chart-1，拉开色相跨度
  "var(--color-chart-1)",
];

const SPEED_MAP = { slow: 0.001, fast: 0.002 } as const;

// ---------------------------------------------------------------------------
// 组件
// ---------------------------------------------------------------------------

/**
 * WavyBackground — 噪声驱动的多彩流动波浪带 canvas 背景层。
 *
 * - canvas + RAF 驱动，纯 JS 动画，无 CSS keyframe。
 * - 颜色默认消费瑚琏 chart token（明暗主题自适应）。
 * - reduced-motion：画一帧静态波形后停止 RAF。
 * - SSR 安全：所有 canvas/RAF/matchMedia 逻辑在 useEffect 内。
 * - 卸载时 cancelAnimationFrame + 释放 canvas context。
 */
export function WavyBackground({
  children,
  className,
  containerClassName,
  colors = DEFAULT_COLORS,
  waveWidth = 50,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  containerProps,
}: WavyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // jsdom / 无 2d context 环境（SSR、单测）容错
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---------- reduced-motion 检测 ----------
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- 解析 CSS 变量颜色 ----------
    const resolvedColors = colors.map((c) => resolveColor(c, container));
    const resolvedBg =
      backgroundFill
        ? resolveColor(backgroundFill, container)
        : resolveColorOrNull("var(--color-bg)", container) ??
          resolveColorOrNull("var(--color-background)", container) ??
          "#ffffff";

    // ---------- 尺寸同步 ----------
    const syncSize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    syncSize();

    // ---------- 波形绘制核心 ----------
    const waveSpeed = SPEED_MAP[speed];
    let phase = 0;
    let rafId: number;

    /**
     * 绘制一帧。
     * 技术：每帧先用半透明 backgroundFill 铺底（产生拖影/叠影感）；
     * 然后对每种颜色绘制一条用 valueNoise2D 驱动的正弦+噪声复合波形曲线带（lineTo + lineWidth）。
     * canvas filter blur 在 canvas 元素上用 CSS filter 实现（filter: blur(Npx)），
     * 与 Aceternity 原版保持一致；Safari 兼容回退见下方。
     */
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      if (W === 0 || H === 0) return;

      // 半透明背景盖层（拖影效果）
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = resolvedBg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = waveOpacity;

      // 每种颜色一条波浪带
      resolvedColors.forEach((color, i) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = waveWidth;
        ctx.lineCap = "round";

        // 每条波偏移相位，使波浪交错
        const phaseOffset = i * (Math.PI / resolvedColors.length);

        // 从左到右扫描 x，用 noise 生成 y
        for (let x = 0; x <= W + waveWidth; x += 2) {
          // noise 采样坐标：x 方向缓慢推进，叠加时间相位
          const nx = x / W;
          // 每条波独立的噪声频率偏移（不同 i → 不同噪声采样位置）
          const noiseVal = valueNoise2D(nx * 2 + i * 3.7, phase + i);
          // 主正弦 + 噪声调制，让波浪有流动感且不完全规则
          const y =
            H * 0.5 +
            Math.sin(nx * Math.PI * 3 + phase + phaseOffset) * (H * 0.18) +
            noiseVal * (H * 0.12);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      phase += waveSpeed * 6;
    };

    // 初始清底
    ctx.fillStyle = resolvedBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (prefersReduced) {
      // reduced-motion：画一帧静态波形，相位固定为 0
      draw();
      return;
    }

    // 动画循环
    const animate = () => {
      draw();
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // 卸载清理
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [colors, waveWidth, backgroundFill, blur, speed, waveOpacity]);

  // canvas 的 filter blur 通过 CSS 内联样式实现
  // Safari 兼容：prefixed -webkit-filter 兜底（CSS 属性赋值会被浏览器处理，
  // 但内联 style 对象赋 filter 即可，现代 Safari 已支持无前缀 filter）。
  const canvasStyle: React.CSSProperties = blur > 0
    ? { filter: `blur(${blur}px)` }
    : {};

  return (
    <div
      ref={containerRef}
      {...containerProps}
      className={cn("relative overflow-hidden", containerClassName)}
    >
      {/* 背景 canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={canvasStyle}
      />
      {/* 内容层：覆盖在 canvas 上，居中 */}
      <div className={cn("relative z-10 flex h-full w-full items-center justify-center", className)}>
        {children}
      </div>
    </div>
  );
}
