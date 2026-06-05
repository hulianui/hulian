"use client";

import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { IridescenceProps } from "./iridescence.types";

// ─── Shaders ───────────────────────────────────────────────────────────────
// 原样移植自 react-bits DavidHDev/react-bits
// src/content/Backgrounds/Iridescence/Iridescence.jsx
// 仅保持 uniform 名与原版一致（uTime / uColor / uResolution / uMouse /
// uAmplitude / uSpeed），不增删任何数学逻辑。

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3  uColor;
uniform vec3  uResolution;
uniform vec2  uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── 颜色解析工具 ──────────────────────────────────────────────────────────

/**
 * 将任意 CSS 颜色字符串解析为 [r, g, b]（0..1 范围）。
 * 利用离屏 1×1 canvas + getContext("2d").fillStyle 机制，
 * 让浏览器自己处理颜色空间转换（包括 oklch / hsl / var(--…) 等）。
 * 若 canvas 不可用（SSR 或测试环境）则回退到 [1, 1, 1]。
 */
function parseCssColor(css: string): [number, number, number] {
  try {
    const offscreen = document.createElement("canvas");
    offscreen.width = 1;
    offscreen.height = 1;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return [1, 1, 1];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  } catch {
    return [1, 1, 1];
  }
}

/**
 * 读取 CSS 变量 --color-chart-3（瑚琏 chart token），
 * 通过 getComputedStyle 拿到解析后的值再二次转换为 rgb 三元组。
 * 回退链：getComputedStyle → parseCssColor → [0.7, 0.5, 0.9] 紫色兜底。
 */
function readChartToken(canvas: HTMLCanvasElement): [number, number, number] {
  try {
    const raw = getComputedStyle(canvas)
      .getPropertyValue("--color-chart-3")
      .trim();
    if (!raw) return [0.7, 0.5, 0.9];
    return parseCssColor(raw);
  } catch {
    return [0.7, 0.5, 0.9];
  }
}

/**
 * 将 color prop（[r,g,b] 数组 或 CSS 字符串 或 undefined）
 * 规范化为 [r, g, b]（0..1）三元组。
 * color=undefined 时从 canvas 读 chart token（调用方传入 canvas 引用）。
 */
function resolveColor(
  color: IridescenceProps["color"],
  canvas: HTMLCanvasElement,
): [number, number, number] {
  if (!color) return readChartToken(canvas);
  if (Array.isArray(color)) return color as [number, number, number];
  return parseCssColor(color);
}

// ─── 组件 ──────────────────────────────────────────────────────────────────

export function Iridescence({
  color,
  speed = 1,
  amplitude = 0.1,
  mouseReact = true,
  className,
  fallback,
}: IridescenceProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2, Vec3 } = ogl;

      // ── 渲染器 ──────────────────────────────────────────────────────────
      const renderer = new Renderer({
        canvas,
        dpr: Math.min(typeof window !== "undefined" ? (window.devicePixelRatio ?? 1) : 1, 2),
        alpha: false,
      });
      const gl = renderer.gl;

      // ── 解析初始颜色 ────────────────────────────────────────────────────
      const [r, g, b] = resolveColor(color, canvas);

      // ── Uniforms ────────────────────────────────────────────────────────
      const uTime = { value: 0 };
      const uColor = { value: new Color(r, g, b) };
      const uMouse = { value: new Vec2(0.5, 0.5) };
      const uAmplitude = { value: amplitude };
      const uSpeed = { value: speed };
      const uResolution = {
        value: new Vec3(
          canvas.clientWidth || 1,
          canvas.clientHeight || 1,
          1.0,
        ),
      };

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime,
          uColor,
          uResolution,
          uMouse,
          uAmplitude,
          uSpeed,
        },
      });

      const mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program,
      });

      // ── resize ──────────────────────────────────────────────────────────
      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        uResolution.value.set(w || 1, h || 1, 1.0);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // ── 鼠标交互 ────────────────────────────────────────────────────────
      let onMove: ((e: MouseEvent) => void) | undefined;
      if (mouseReact) {
        onMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          uMouse.value.set(
            (e.clientX - rect.left) / (rect.width || 1),
            1 - (e.clientY - rect.top) / (rect.height || 1),
          );
        };
        canvas.addEventListener("mousemove", onMove);
      }

      return {
        render: (t: number) => {
          uTime.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose: () => {
          if (onMove) canvas.removeEventListener("mousemove", onMove);
        },
      };
    },
    // deps: color/speed/amplitude/mouseReact 变化时重建场景
    // （color 序列化为字符串以稳定数组引用比较）
    [JSON.stringify(color), speed, amplitude, mouseReact],
  );

  // ── reduced-motion / 无 WebGL fallback ──────────────────────────────────
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 z-0 pointer-events-none",
          // 静态虹彩渐变：吃 chart token，明暗主题均可渲染
          "bg-[conic-gradient(from_0deg_at_50%_50%,var(--color-chart-1)_0%,var(--color-chart-2)_25%,var(--color-chart-3)_50%,var(--color-chart-4)_75%,var(--color-chart-1)_100%)]",
          "opacity-60",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "absolute inset-0 z-0 block h-full w-full pointer-events-none",
        className,
      )}
    />
  );
}
