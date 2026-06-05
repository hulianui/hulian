"use client";
import type { CSSProperties } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { GradientBlindsProps } from "./gradient-blinds.types";

// 吸取自 React Bits GradientBlinds：OGL 全屏三角 + GLSL 片元 shader 渲染的"渐变百叶窗"
// 背景——水平多色站渐变铺成色带，叠加均匀竖条（百叶）明暗调制，再叠加一束跟随鼠标的
// 聚光灯与可调颗粒噪声，可旋转 / 镜像 / 扭曲。
//
// 瑚琏化要点：
// 1. 默认色站吃 chart token（chart-1/chart-3），明暗主题自适应，替原版写死的 #FF9FFC/#5227FF。
//    颜色解析用离屏 canvas（兼容 hex / oklch / rgb / var(--color-…)），由浏览器统一转 RGB。
// 2. 复用瑚琏 useGlCanvas：懒加载 ogl（代码分割）、StrictMode 安全（每次挂载新建 canvas，
//    规避被 loseContext 毒化的复用 context）、RAF 单帧抛错不杀循环、离屏暂停、ResizeObserver 自适应。
// 3. reduced-motion / 无 WebGL → 自动降级为 repeating-linear-gradient 静态百叶兜底（DOM 仍在，仅静态）。
// 4. 鼠标聚光灯阻尼用指数平滑（与原版一致），监听挂在 canvas 上；根容器默认允许指针事件以采集鼠标。
// 5. RSC 注意：本件含 effect/ref，必须 "use client"。

const MAX_COLORS = 8;
const FALLBACK_RGB: [number, number, number] = [1, 0.62, 0.99]; // ≈ 原版 #FF9FFC，颜色解析失败兜底

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0–1）：离屏 1×1 canvas 作通用解析器，浏览器负责所有颜色空间转换。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return FALLBACK_RGB;
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return FALLBACK_RGB;
  }
}

// 默认色站：从 canvas 计算样式读 chart token（主题感知）。raw 为空则退回原版风格双色。
function resolveDefaultStops(canvas: HTMLCanvasElement): string[] {
  const cs = getComputedStyle(canvas);
  const c1 = cs.getPropertyValue("--color-chart-1").trim();
  const c3 = cs.getPropertyValue("--color-chart-3").trim();
  if (c1 && c3) return [c1, c3];
  return ["#FF9FFC", "#5227FF"];
}

// 把任意长度色站补齐到 MAX_COLORS（末色复制），返回 RGB 数组 + 有效插值段数。
function prepStops(stops: string[]): {
  arr: [number, number, number][];
  count: number;
} {
  const base = (stops.length ? stops : ["#FF9FFC", "#5227FF"]).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]!);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]!);
  const arr: [number, number, number][] = [];
  for (let i = 0; i < MAX_COLORS; i++) arr.push(cssColorToRgb01(base[i]!));
  const count = Math.max(2, Math.min(MAX_COLORS, stops.length || 2));
  return { arr, count };
}

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 片元 shader：原版 React Bits GradientBlinds 逻辑（百叶条纹 + 多色渐变 + 鼠标聚光灯 + 噪声）。
const FRAG = /* glsl */ `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv0 = fragCoord.xy / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }
    float t = uvMod.x;
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
    float d = length(uv0 - offset);
    float r = max(uSpotlightRadius, 1e-4);
    float dn = d / r;
    float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
    vec3 cir = vec3(spot);
    float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
    if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);

    vec3 col = cir + base - ran;
    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
}
`.trim();

/**
 * GradientBlinds — 渐变百叶窗 WebGL 背景。
 *
 * 多色站水平渐变 + 均匀竖条百叶明暗调制 + 跟随鼠标的聚光灯 + 颗粒噪声，
 * 可旋转 / 镜像 / 扭曲。基于 React Bits 原版 GLSL shader 移植（Three.js 思路 → ogl）。
 * 瑚琏化：默认色站吃 `--color-chart-1/3` token；reduced-motion / 无 WebGL 自动降级静态百叶。
 *
 * 用法：放在 `relative overflow-hidden` 容器里，组件自带 `absolute inset-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
 *   <GradientBlinds blindCount={20} angle={20} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function GradientBlinds({
  gradientColors,
  angle = 0,
  noise = 0.3,
  blindCount = 16,
  blindMinWidth = 60,
  mouseDampening = 0.15,
  mirrorGradient = false,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  distortAmount = 0,
  shineDirection = "left",
  dpr,
  className,
  style,
  fallback,
}: GradientBlindsProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const resolvedDpr =
        dpr ??
        Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr: resolvedDpr });
      const gl = renderer.gl;

      const stops =
        gradientColors && gradientColors.length
          ? gradientColors
          : resolveDefaultStops(canvas);
      const { arr, count } = prepStops(stops);

      const uniforms = {
        iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
        iMouse: { value: [0, 0] },
        iTime: { value: 0 },
        uAngle: { value: (angle * Math.PI) / 180 },
        uNoise: { value: noise },
        uBlindCount: { value: Math.max(1, blindCount) },
        uSpotlightRadius: { value: spotlightRadius },
        uSpotlightSoftness: { value: spotlightSoftness },
        uSpotlightOpacity: { value: spotlightOpacity },
        uMirror: { value: mirrorGradient ? 1 : 0 },
        uDistort: { value: distortAmount },
        uShineFlip: { value: shineDirection === "right" ? 1 : 0 },
        uColor0: { value: arr[0] },
        uColor1: { value: arr[1] },
        uColor2: { value: arr[2] },
        uColor3: { value: arr[3] },
        uColor4: { value: arr[4] },
        uColor5: { value: arr[5] },
        uColor6: { value: arr[6] },
        uColor7: { value: arr[7] },
        uColorCount: { value: count },
      };

      const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标阻尼平滑状态
      const mouseTarget: [number, number] = [0, 0];
      let lastTime = 0;
      let firstSize = true;

      const applyBlindCount = (cssWidth: number) => {
        if (blindMinWidth && blindMinWidth > 0) {
          const maxByMinWidth = Math.max(1, Math.floor(cssWidth / blindMinWidth));
          const effective = blindCount ? Math.min(blindCount, maxByMinWidth) : maxByMinWidth;
          uniforms.uBlindCount.value = Math.max(1, effective);
        } else {
          uniforms.uBlindCount.value = Math.max(1, blindCount);
        }
      };

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
        applyBlindCount(w || 1);
        if (firstSize) {
          firstSize = false;
          const cx = gl.drawingBufferWidth / 2;
          const cy = gl.drawingBufferHeight / 2;
          uniforms.iMouse.value = [cx, cy];
          mouseTarget[0] = cx;
          mouseTarget[1] = cy;
        }
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scale = renderer.dpr || 1;
        const x = (e.clientX - rect.left) * scale;
        const y = (rect.height - (e.clientY - rect.top)) * scale;
        mouseTarget[0] = x;
        mouseTarget[1] = y;
        if (mouseDampening <= 0) {
          uniforms.iMouse.value = [x, y];
        }
      };
      canvas.addEventListener("pointermove", onPointerMove);

      return {
        render(t: number) {
          uniforms.iTime.value = t * 0.001;
          if (mouseDampening > 0) {
            if (!lastTime) lastTime = t;
            const dt = (t - lastTime) / 1000;
            lastTime = t;
            const tau = Math.max(1e-4, mouseDampening);
            let factor = 1 - Math.exp(-dt / tau);
            if (factor > 1) factor = 1;
            const cur = uniforms.iMouse.value;
            cur[0]! += (mouseTarget[0] - cur[0]!) * factor;
            cur[1]! += (mouseTarget[1] - cur[1]!) * factor;
          } else {
            lastTime = t;
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          canvas.removeEventListener("pointermove", onPointerMove);
          program.remove?.();
          geometry.remove?.();
          mesh.setParent(null);
        },
      };
    },
    [
      gradientColors,
      angle,
      noise,
      blindCount,
      blindMinWidth,
      mouseDampening,
      mirrorGradient,
      spotlightRadius,
      spotlightSoftness,
      spotlightOpacity,
      distortAmount,
      shineDirection,
      dpr,
    ],
  );

  // -------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：静态 repeating-linear-gradient 百叶兜底。
  // 横向 chart token 渐变 + 等宽竖条暗纹叠加，DOM 结构与正常态一致（仅静态）。
  // -------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn("absolute inset-0", className)}
        style={
          {
            background: [
              "repeating-linear-gradient(90deg, color-mix(in oklch, var(--color-foreground) 14%, transparent) 0, transparent 6%, transparent 100%)",
              "linear-gradient(90deg, var(--color-chart-1) 0%, var(--color-chart-3) 100%)",
            ].join(", "),
            ...style,
          } as CSSProperties
        }
        aria-hidden
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0 block h-full w-full", className)}
      style={style}
      aria-hidden
    />
  );
}
