"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { DitherProps } from "./dither.types";

// 吸取自 React Bits Dither：Perlin/fbm 波纹噪声场 + 8×8 Bayer 有序抖动（ordered dithering）
// 把连续色压成 colorNum 级量化色阶，再做 pixelSize 像素马赛克，得到复古 8-bit 颗粒带状质感。
//
// 瑚琏化要点：
// 1. 去依赖：原版用 three.js + @react-three/fiber + @react-three/postprocessing（两遍后处理：
//    一遍画波纹 mesh，一遍 EffectComposer 做抖动）。这些都不在白名单。改用 ogl 单遍片元
//    shader——在同一个 fragment 里先算 fbm 波纹色，再就地做 Bayer 抖动 + 量化，等价效果零依赖。
// 2. token：默认波纹色读 `--color-chart-1`（明暗自适应），替原版写死的 [0.5,0.5,0.5] 灰。
// 3. RSC / StrictMode 安全：复用 useGlCanvas（懒加载 ogl、每次挂载新建 canvas 避 loseContext 毒化、
//    RAF 离屏暂停、ResizeObserver 自适应）。
// 4. reduced-motion / 无 WebGL：useGlCanvas 返回 reduced → 渲染静态棋盘格 + 渐变 fallback，
//    呼应抖动颗粒质感，DOM 不依赖动画存在。disableAnimation 则冻结 uTime。
// 5. 去掉原版鼠标交互 uniform（背景装饰件以纯净静默为先，避免 pointer 抢事件）。

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader（OGL Triangle 已在 clip-space 全覆盖视口）
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// 抖动片元 shader
// 移植要点（three.js 双遍后处理 → ogl 单遍）：
//   ① 波纹部分：classic Perlin noise（cnoise）+ 4-octave fbm + 自指 pattern，照搬原版 waveFragmentShader
//   ② 抖动部分：把原版 ditherFragmentShader 的 8×8 Bayer 矩阵 + 量化直接接在波纹色之后
//   ③ 像素马赛克：先把 uv 量化到 pixelSize 网格再采样，等价原版 EffectComposer 的 uvPixel floor
//   ④ uniform 名沿用原版语义：uTime/uResolution/uWaveSpeed/uWaveFrequency/uWaveAmplitude/
//      uWaveColor/uColorNum/uPixelSize
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;
uniform float uWaveSpeed;
uniform float uWaveFrequency;
uniform float uWaveAmplitude;
uniform vec3  uWaveColor;
uniform float uColorNum;
uniform float uPixelSize;

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = uWaveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= uWaveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - uTime * uWaveSpeed;
  return fbm(p + fbm(p2));
}

// 8×8 Bayer 有序抖动阈值
float bayer(vec2 px) {
  const float m[64] = float[64](
     0.0, 48.0, 12.0, 60.0,  3.0, 51.0, 15.0, 63.0,
    32.0, 16.0, 44.0, 28.0, 35.0, 19.0, 47.0, 31.0,
     8.0, 56.0,  4.0, 52.0, 11.0, 59.0,  7.0, 55.0,
    40.0, 24.0, 36.0, 20.0, 43.0, 27.0, 39.0, 23.0,
     2.0, 50.0, 14.0, 62.0,  1.0, 49.0, 13.0, 61.0,
    34.0, 18.0, 46.0, 30.0, 33.0, 17.0, 45.0, 29.0,
    10.0, 58.0,  6.0, 54.0,  9.0, 57.0,  5.0, 53.0,
    42.0, 26.0, 38.0, 22.0, 41.0, 25.0, 37.0, 21.0
  );
  int x = int(mod(px.x, 8.0));
  int y = int(mod(px.y, 8.0));
  return m[y * 8 + x] / 64.0;
}

void main() {
  // 像素马赛克：把屏幕坐标量化到 pixelSize 网格
  vec2 frag = floor(gl_FragCoord.xy / uPixelSize) * uPixelSize;

  // 波纹场坐标：中心化 + 横向按宽高比修正（照搬原版）
  vec2 uv = frag / uResolution;
  uv -= 0.5;
  uv.x *= uResolution.x / uResolution.y;

  float f = pattern(uv);
  vec3 color = mix(vec3(0.0), uWaveColor, f);

  // 8×8 Bayer 有序抖动 + colorNum 级量化
  float threshold = bayer(frag / uPixelSize) - 0.25;
  float stp = 1.0 / (uColorNum - 1.0);
  color += threshold * stp;
  color = clamp(color - 0.2, 0.0, 1.0);
  color = floor(color * (uColorNum - 1.0) + 0.5) / (uColorNum - 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas 解析任意 CSS 颜色（hex / oklch / rgb / 计算后 var）
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.5, 0.5, 0.5];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.5, 0.5, 0.5];
  }
}

// 从挂载后的元素计算样式读 chart-1 token（随当前明暗主题）
function resolveChartToken(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [0.5, 0.5, 0.5];
  return cssColorToRgb01(raw);
}

/**
 * Dither — 复古有序抖动波纹 WebGL 背景。
 *
 * 基于 React Bits Dither（Perlin/fbm 波纹 + 8×8 Bayer ordered dithering + 色阶量化），
 * 瑚琏化：去 three.js/postprocessing 改 ogl 单遍 shader；默认波纹色吃 `--color-chart-1` token；
 * reduced-motion / 无 WebGL 自动降级为静态棋盘格 fallback。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Dither colorNum={4} pixelSize={2} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Dither({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor,
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  className,
  fallback,
}: DitherProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: false, dpr });
      const gl = renderer.gl;

      // 解析波纹主色：显式 waveColor 优先；否则读 chart-1 token
      const [r, g, b] = waveColor
        ? cssColorToRgb01(waveColor)
        : resolveChartToken(canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec2(1, 1) },
          uWaveSpeed: { value: waveSpeed },
          uWaveFrequency: { value: waveFrequency },
          uWaveAmplitude: { value: waveAmplitude },
          uWaveColor: { value: new Color(r, g, b) },
          uColorNum: { value: Math.max(2, colorNum) },
          uPixelSize: { value: Math.max(1, pixelSize) },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        // gl.drawingBufferWidth/Height 已含 dpr，喂给 shader 作 resolution
        program.uniforms.uResolution!.value.set(
          gl.drawingBufferWidth || 1,
          gl.drawingBufferHeight || 1,
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          if (!disableAnimation) {
            program.uniforms.uTime!.value = t * 0.001;
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [waveSpeed, waveFrequency, waveAmplitude, waveColor, colorNum, pixelSize, disableAnimation],
  );

  // reduced-motion / 无 WebGL：静态棋盘格 + 渐变 fallback，呼应抖动颗粒质感
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background-image:linear-gradient(135deg,var(--color-chart-1)_0%,transparent_70%),repeating-conic-gradient(var(--color-foreground)_0%_25%,transparent_0%_50%)]",
          "[background-size:100%_100%,6px_6px]",
          "opacity-30",
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
      className={cn(
        "pointer-events-none absolute inset-0 z-0 block h-full w-full",
        className,
      )}
      aria-hidden
    />
  );
}
