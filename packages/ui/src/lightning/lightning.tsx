"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LightningProps } from "./lightning.types";

// 吸取自 React Bits Lightning：fbm 噪声扭曲全屏 uv + abs(uv.x) 距离场反比辉光，
// 配 hash 随机闪烁，模拟一道翻涌分叉的电弧/极光柱。
// 瑚琏化：① 原版裸 WebGL + 内联 vert/frag → 改走 ogl Renderer/Program/Triangle，
//   复用 useGlCanvas 生命周期（懒加载 ogl、SSR 安全、StrictMode-safe 新建 canvas、
//   离屏暂停、RAF try/catch、卸载兜底 loseContext）；
// ② 颜色不再写死 hue——新增 color prop，传入即吃 token（默认建议 var(--color-chart-1)，
//   明暗自适应），未传则保留原版 hsv2rgb(hue) 观感；
// ③ reduced-motion / 无 WebGL 自动降级为静态纵向辉光 fallback（吃 chart token），
//   DOM 跨两态保持「单根 div」，不条件卸载内容。

// ---------------------------------------------------------------------------
// OGL 全屏三角顶点 shader（Triangle 几何已覆盖 clip-space，无需投影矩阵）
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// 闪电片元 shader
// 移植自 react-bits Lightning（David H Dev）。算法保持一致：
//   fbm(10 octave) 扭曲 uv → abs(uv.x) 作距离场 → 反比成亮柱 → hash 随机闪烁。
// 改动：新增 uUseColor / uColor —— uUseColor>0.5 时直接用传入色，否则走 hsv2rgb(uHue)。
// gl_FragCoord 直接可用，iResolution 由 JS 每帧喂入。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision mediump float;

uniform vec2  iResolution;
uniform float iTime;
uniform float uHue;
uniform vec3  uColor;
uniform float uUseColor;
uniform float uXOffset;
uniform float uSpeed;
uniform float uIntensity;
uniform float uSize;

#define OCTAVE_COUNT 10

vec3 hsv2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat2 rotate2d(float theta) {
  float c = cos(theta);
  float s = sin(theta);
  return mat2(c, -s, s, c);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 fp = fract(p);
  float a = hash12(ip);
  float b = hash12(ip + vec2(1.0, 0.0));
  float c = hash12(ip + vec2(0.0, 1.0));
  float d = hash12(ip + vec2(1.0, 1.0));
  vec2 t = smoothstep(0.0, 1.0, fp);
  return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < OCTAVE_COUNT; ++i) {
    value += amplitude * noise(p);
    p *= rotate2d(0.45);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv = 2.0 * uv - 1.0;
  uv.x *= iResolution.x / iResolution.y;
  uv.x += uXOffset;

  uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

  float dist = abs(uv.x);
  vec3 baseColor = mix(hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8)), uColor, uUseColor);
  vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）。离屏 1×1 canvas 让浏览器负责所有色彩空间转换，
// 兼容 hex / oklch / rgb / color() / 解析后的 CSS 变量值。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.4, 0.5, 1];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.4, 0.5, 1];
  }
}

/**
 * Lightning — fbm 噪声电弧/极光柱 WebGL 背景。
 *
 * 基于 react-bits Lightning 原版 GLSL（10 阶 fbm 扭曲 + 距离场辉光 + hash 闪烁），
 * 瑚琏化：默认走原版 `hue` 色相；传 `color`（推荐 `var(--color-chart-1)`）即吃 token、
 * 明暗自适应；reduced-motion / 无 WebGL 自动降级为静态辉光 fallback。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Lightning hue={230} speed={1.2} intensity={1.1} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Lightning({
  hue = 230,
  color,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
  className,
  fallback,
}: LightningProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 解析主色：显式 color prop 优先；否则用占位（uUseColor=0，shader 走 hue 路径）
      const [r, g, b] = color ? cssColorToRgb01(color) : [0, 0, 0];

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iResolution: { value: new Vec2(1, 1) },
          iTime:       { value: 0 },
          uHue:        { value: hue },
          uColor:      { value: new Color(r, g, b) },
          uUseColor:   { value: color ? 1 : 0 },
          uXOffset:    { value: xOffset },
          uSpeed:      { value: speed },
          uIntensity:  { value: intensity },
          uSize:       { value: size },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        const cw = w || 1;
        const ch = h || 1;
        renderer.setSize(cw, ch);
        // 以设备像素喂入 iResolution（与 gl_FragCoord 同坐标系）
        (program.uniforms.iResolution!.value as { set: (x: number, y: number) => void }).set(
          gl.drawingBufferWidth || cw,
          gl.drawingBufferHeight || ch,
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.iTime!.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [hue, color, xOffset, speed, intensity, size],
  );

  // reduced-motion / 无 WebGL：静态纵向辉光 fallback（吃 chart token），保留"闪电柱"暗示
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(90deg,transparent_42%,var(--color-chart-1)_50%,transparent_58%)]",
          "opacity-70 blur-[2px]",
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
