"use client";
import { useCallback } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LiquidChromeProps } from "./liquid-chrome.types";

// ---------------------------------------------------------------------------
// GLSL — 原样移植自 react-bits DavidHDev/react-bits
// src: https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/LiquidChrome/LiquidChrome.jsx
// ---------------------------------------------------------------------------

const VERT = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uResolution;
  uniform vec3 uBaseColor;
  uniform float uAmplitude;
  uniform float uFrequencyX;
  uniform float uFrequencyY;
  uniform vec2 uMouse;
  varying vec2 vUv;

  vec4 renderImage(vec2 uvCoord) {
      vec2 fragCoord = uvCoord * uResolution.xy;
      vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

      for (float i = 1.0; i < 10.0; i++){
          uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
          uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
      }

      vec2 diff = (uvCoord - uMouse);
      float dist = length(diff);
      float falloff = exp(-dist * 20.0);
      float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
      uv += (diff / (dist + 0.0001)) * ripple * falloff;

      vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
      return vec4(color, 1.0);
  }

  void main() {
      vec4 col = vec4(0.0);
      int samples = 0;
      for (int i = -1; i <= 1; i++){
          for (int j = -1; j <= 1; j++){
              vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
              col += renderImage(vUv + offset);
              samples++;
          }
      }
      gl_FragColor = col / float(samples);
  }
`;

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b] 0..1 解析
// 用离屏 1×1 canvas 请求浏览器渲染引擎解析任意 CSS 色值（含 var()），
// 再读回 rgba 像素。CSS 变量需要挂载到 DOM 元素上才能解析，
// 故传入 mountEl 作为 getComputedStyle 上下文。
// ---------------------------------------------------------------------------

function cssColorToRgb01(
  color: string,
  mountEl: HTMLElement,
): [number, number, number] {
  // 先尝试把 var(--token) 解析为实际值
  let resolved = color;
  if (color.includes("var(")) {
    const match = color.match(/var\(\s*(--[\w-]+)\s*\)/);
    if (match) {
      resolved =
        getComputedStyle(mountEl).getPropertyValue(match[1]).trim() || color;
    }
  }

  // 用 OffscreenCanvas / 普通 canvas 解析色值
  try {
    const oc = new OffscreenCanvas(1, 1);
    const ctx = oc.getContext("2d");
    if (ctx) {
      ctx.fillStyle = resolved;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    }
  } catch {
    // OffscreenCanvas 不可用（如旧浏览器）→ fallback 普通 canvas
  }

  // fallback: 普通 canvas
  const fc = document.createElement("canvas");
  fc.width = 1;
  fc.height = 1;
  const ctx2 = fc.getContext("2d");
  if (ctx2) {
    ctx2.fillStyle = resolved;
    ctx2.fillRect(0, 0, 1, 1);
    const d = ctx2.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  // 最终兜底：返回默认深灰
  return [0.1, 0.1, 0.1];
}

// ---------------------------------------------------------------------------
// 组件
// ---------------------------------------------------------------------------

/**
 * LiquidChrome — WebGL 液态铬金属流动背景。
 *
 * - 原版 GLSL 来自 react-bits，零视觉改动，瑚琏化 token + lifecycle。
 * - 基础色默认消费 `--color-chart-2`，自动跟随明暗主题。
 * - `interactive=true` 时鼠标/触摸推动液面涟漪。
 * - `reduced-motion` / 无 WebGL → 静态金属感渐变 fallback（吃 chart token）。
 * - canvas `absolute inset-0 z-0`：作为父容器背景层使用，
 *   父容器需有 `relative` + 明确尺寸。
 */
export function LiquidChrome({
  baseColor,
  speed = 0.2,
  amplitude = 0.6,
  frequencyX = 2.5,
  frequencyY = 1.5,
  interactive = true,
  className,
  fallback,
}: LiquidChromeProps) {
  // setup 用 useCallback 稳定引用；deps 变化时 useGlCanvas 会重建整个 GL 场景。
  const setup = useCallback(
    async ({ ogl, canvas }: { ogl: typeof import("ogl"); canvas: HTMLCanvasElement }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      // --- Renderer ---
      const renderer = new Renderer({
        canvas,
        antialias: true,
        dpr: Math.min(typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1, 2),
      });
      const gl = renderer.gl;
      gl.clearColor(1, 1, 1, 1);

      // --- 解析 baseColor ---
      // 支持 [r,g,b] 数组 或 CSS 字符串；未传时从 chart-2 token 读取
      let rgb01: [number, number, number];
      if (Array.isArray(baseColor)) {
        rgb01 = baseColor as [number, number, number];
      } else if (typeof baseColor === "string") {
        rgb01 = cssColorToRgb01(baseColor, canvas);
      } else {
        // 默认：从 canvas 元素读 --color-chart-2（canvas 已挂载，可获取继承样式）
        rgb01 = cssColorToRgb01("var(--color-chart-2)", canvas);
        // 若 chart-2 解析失败（token 未定义），退到 chart-1
        if (rgb01[0] === 0 && rgb01[1] === 0 && rgb01[2] === 0) {
          rgb01 = cssColorToRgb01("var(--color-chart-1)", canvas);
        }
        // 最终兜底：深金属蓝
        if (rgb01[0] === 0 && rgb01[1] === 0 && rgb01[2] === 0) {
          rgb01 = [0.08, 0.12, 0.22];
        }
      }

      // --- Uniforms ---
      // ogl 的 Vec3/Vec2 在 1.x 版本路径可能有差异，用 Float32Array 兜底
      const uResValue = new Float32Array([
        canvas.clientWidth || 1,
        canvas.clientHeight || 1,
        (canvas.clientWidth || 1) / (canvas.clientHeight || 1),
      ]);
      const uMouseValue = new Float32Array([0.5, 0.5]);
      const uBaseColorValue = new Float32Array(rgb01);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: uResValue },
          uBaseColor: { value: uBaseColorValue },
          uAmplitude: { value: amplitude },
          uFrequencyX: { value: frequencyX },
          uFrequencyY: { value: frequencyY },
          uMouse: { value: uMouseValue },
        },
      });

      const mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program,
      });

      // --- resize ---
      const resize = (w: number, h: number) => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setSize((w || 1) * dpr, (h || 1) * dpr);
        // OGL Renderer.setSize 内部会调 gl.viewport 但不改 canvas style，
        // 我们需要 canvas 的 CSS 尺寸保持 100%（由外部 class 控制），
        // 但 GL 内部分辨率需要更新。
        uResValue[0] = (w || 1) * dpr;
        uResValue[1] = (h || 1) * dpr;
        uResValue[2] = ((w || 1) * dpr) / ((h || 1) * dpr);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // --- interactive: mouse + touch ---
      let handleMouseMove: ((e: MouseEvent) => void) | null = null;
      let handleTouchMove: ((e: TouchEvent) => void) | null = null;

      if (interactive) {
        handleMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          uMouseValue[0] = (e.clientX - rect.left) / rect.width;
          uMouseValue[1] = 1 - (e.clientY - rect.top) / rect.height;
        };
        handleTouchMove = (e: TouchEvent) => {
          if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            uMouseValue[0] = (touch.clientX - rect.left) / rect.width;
            uMouseValue[1] = 1 - (touch.clientY - rect.top) / rect.height;
          }
        };
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
      }

      return {
        render: (t: number) => {
          program.uniforms.uTime.value = t * 0.001 * speed;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose: () => {
          if (handleMouseMove) canvas.removeEventListener("mousemove", handleMouseMove);
          if (handleTouchMove) canvas.removeEventListener("touchmove", handleTouchMove);
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseColor, speed, amplitude, frequencyX, frequencyY, interactive],
  );

  const { ref, reduced } = useGlCanvas(setup, [
    baseColor,
    speed,
    amplitude,
    frequencyX,
    frequencyY,
    interactive,
  ]);

  // --- reduced-motion / 无 WebGL fallback ---
  if (reduced) {
    return (
      <div
        className={cn(
          "absolute inset-0 z-0",
          // 静态金属感渐变：消费 chart token（明暗主题自适应）
          "bg-[linear-gradient(135deg,var(--color-chart-1)_0%,var(--color-chart-2)_30%,var(--color-chart-3)_60%,var(--color-chart-4)_100%)]",
          className,
        )}
        aria-hidden
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 z-0 block h-full w-full", className)}
    />
  );
}
