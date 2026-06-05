"use client";

// 吸取自 React Bits LetterGlitch：canvas 上铺满等宽字符矩阵，按节拍随机翻动
// 部分格子的字符与颜色，并对颜色做逐帧插值平滑，叠加内/外缘暗角，营造
// 终端故障雨（matrix-glitch）质感。
//
// 瑚琏化要点：
//   1. 颜色吃主题 token：默认调色板取 chart-2/1/4，明暗切换自动跟随；任意传入
//      颜色（含 var(--color-…)）统一经 1×1 离屏 canvas 解析为 RGB 再插值——
//      替代原版只认 #hex 的 hexToRgb，oklch / rgb / token 全通吃。
//   2. reduced-motion：matchMedia 命中 → 不启 RAF，只静态绘一帧字符矩阵（不闪变），
//      DOM 与动画态完全一致（暗角层始终在位，绝不按 reduced-motion 卸载内容）。
//   3. SSR 安全：canvas / RAF / window / ResizeObserver 全在 useEffect 内，"use client"。
//   4. jsdom 容错：getContext("2d") 返回 null 时安全退出，不抛错。
//   5. DPR 自适应 + ResizeObserver 跟随容器尺寸；卸载清理 RAF + Observer。
//   6. 暗角层走 token：bg-surface 暗角用 currentColor/透明渐变，吃容器底色而非写死黑。

import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../lib/cn";
import type { LetterGlitchProps } from "./letter-glitch.types";

type Rgb = { r: number; g: number; b: number };

type Letter = {
  char: string;
  color: Rgb;
  targetColor: Rgb;
  colorProgress: number;
};

const DEFAULT_COLORS = [
  "var(--color-chart-2)",
  "var(--color-chart-1)",
  "var(--color-chart-4)",
];

const DEFAULT_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789";

const FONT_SIZE = 16;
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;

// 把任意 CSS 颜色字符串经 1×1 离屏 canvas 解析为 {r,g,b}。
// jsdom / 无 2d context 时回落到中性灰，保证不抛错。
function parseColor(color: string): Rgb {
  if (typeof document === "undefined") return { r: 136, g: 136, b: 136 };
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { r: 136, g: 136, b: 136 };
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
  return { r: r ?? 0, g: g ?? 0, b: b ?? 0 };
}

function rgbCss({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function lerp(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

export function LetterGlitch({
  glitchColors = DEFAULT_COLORS,
  glitchSpeed = 50,
  smooth = true,
  outerVignette = true,
  centerVignette = false,
  characters = DEFAULT_CHARACTERS,
  className,
  style,
  ...props
}: LetterGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 字符集按码点拆分（支持任意 Unicode）。
  const symbols = useMemo(() => Array.from(characters), [characters]);
  // 调色板序列化作为 effect 依赖，避免数组字面量每次新引用导致无意义重跑。
  const colorsKey = useMemo(() => glitchColors.join("|"), [glitchColors]);

  // 把每帧绘制所需的可变状态收进 ref，避免随 state 重渲染。
  const stateRef = useRef<{
    letters: Letter[];
    columns: number;
    rows: number;
    lastGlitch: number;
  }>({ letters: [], columns: 0, rows: 0, lastGlitch: 0 });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, dpr: number) => {
      const { letters, columns } = stateRef.current;
      if (letters.length === 0) return;
      const w = ctx.canvas.width / dpr;
      const h = ctx.canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${FONT_SIZE}px monospace`;
      ctx.textBaseline = "top";
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i]!;
        const x = (i % columns) * CHAR_WIDTH;
        const y = Math.floor(i / columns) * CHAR_HEIGHT;
        ctx.fillStyle = rgbCss(letter.color);
        ctx.fillText(letter.char, x, y);
      }
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // jsdom：无 2d context，安全退出

    // 解析调色板为 RGB（运行时现取，主题/传参变化由 effect 依赖驱动重算）。
    const palette = glitchColors.map(parseColor);
    const safePalette = palette.length > 0 ? palette : [parseColor("#888888")];
    const randomColor = (): Rgb =>
      safePalette[Math.floor(Math.random() * safePalette.length)]!;
    const randomChar = (): string =>
      symbols[Math.floor(Math.random() * symbols.length)] ?? "A";

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId: number | null = null;

    const initLetters = (columns: number, rows: number) => {
      const total = columns * rows;
      const letters: Letter[] = new Array(total);
      for (let i = 0; i < total; i++) {
        const c = randomColor();
        letters[i] = {
          char: randomChar(),
          color: c,
          targetColor: c,
          colorProgress: 1,
        };
      }
      stateRef.current = { letters, columns, rows, lastGlitch: Date.now() };
    };

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return null;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const columns = Math.ceil(w / CHAR_WIDTH);
      const rows = Math.ceil(h / CHAR_HEIGHT);
      initLetters(columns, rows);
      return dpr;
    };

    // 随机翻动约 5% 的格子（字符 + 目标色）。
    const glitch = () => {
      const { letters } = stateRef.current;
      const count = Math.max(1, Math.floor(letters.length * 0.05));
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * letters.length);
        const letter = letters[idx];
        if (!letter) continue;
        letter.char = randomChar();
        letter.targetColor = randomColor();
        if (!smooth) {
          letter.color = letter.targetColor;
          letter.colorProgress = 1;
        } else {
          letter.colorProgress = 0;
        }
      }
    };

    // 逐帧推进未完成的颜色插值。
    const advanceSmooth = (): boolean => {
      const { letters } = stateRef.current;
      let needsRedraw = false;
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i]!;
        if (letter.colorProgress < 1) {
          letter.colorProgress = Math.min(1, letter.colorProgress + 0.05);
          letter.color = lerp(letter.color, letter.targetColor, letter.colorProgress);
          needsRedraw = true;
        }
      }
      return needsRedraw;
    };

    let dpr = setup();
    if (dpr == null) {
      // 容器尚无尺寸：先等 ResizeObserver 触发再 setup。
      dpr = window.devicePixelRatio || 1;
    } else if (prefersReduced) {
      draw(ctx, dpr);
    }

    const animate = () => {
      const d = window.devicePixelRatio || 1;
      const now = Date.now();
      if (now - stateRef.current.lastGlitch >= glitchSpeed) {
        glitch();
        draw(ctx, d);
        stateRef.current.lastGlitch = now;
      }
      if (smooth && advanceSmooth()) {
        draw(ctx, d);
      }
      rafId = requestAnimationFrame(animate);
    };

    if (!prefersReduced) {
      rafId = requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(() => {
      const nd = setup();
      if (nd != null && prefersReduced) {
        draw(ctx, nd);
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
    // colorsKey 入依赖以在调色板变化时重建；symbols/glitchSpeed/smooth 同理。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorsKey, symbols, glitchSpeed, smooth, draw]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        "relative h-full w-full overflow-hidden bg-surface",
        className,
      )}
      style={style}
      {...props}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {outerVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle, transparent 60%, var(--color-surface) 100%)",
          }}
        />
      )}
      {centerVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--color-surface) 80%, transparent) 0%, transparent 60%)",
          }}
        />
      )}
    </div>
  );
}
