"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { FerrofluidFlowDirection, FerrofluidProps } from "./ferrofluid.types";

// 吸取自 React Bits Ferrofluid：OGL 全屏片元 shader，用 value-noise + 双向扭曲 + smin
// 软融合峰脊，再以 rim 亮带 + gamma 锐化 + shimmer 噪声渲染出会"流动"的液态金属铁磁流体，
// 鼠标处液面下凹抑制辉光。瑚琏化：① 颜色默认吃 chart token（--color-chart-1/2/4，明暗自适应），
// 任意 CSS 颜色经离屏 canvas 解析为 0–1 RGB；② 复用 useGlCanvas 共享生命周期（懒加载 ogl ·
// 每次挂载新建 canvas 规避 loseContext 毒化 · RAF try/catch · 离屏暂停 · RSC 安全）；
// ③ reduced-motion / 无 WebGL 自动降级为 chart token 径向渐变静态兜底（DOM 不变，仅换分支）；
// ④ 去掉原版 import 自带 .css，容器样式内联 + cn 合并。

const MAX_COLORS = 8;

// 原版默认三白 → 瑚琏改吃 chart token，让液面有主题色彩分层
const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
];

const FLOW_VEC: Record<FerrofluidFlowDirection, [number, number]> = {
  up: [0, 1],
  down: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）。离屏 1×1 canvas 让浏览器负责全格式颜色空间转换。
// 若传入是 var(--…)，先经容器 getComputedStyle 解析为真实值再喂进来。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [1, 1, 1];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [1, 1, 1];
  }
}

// 把可能含 var(--…) 的颜色字符串经容器计算样式解析为可绘制的真实颜色字符串
function resolveColor(host: HTMLElement, css: string): string {
  const trimmed = css.trim();
  if (!trimmed.startsWith("var(")) return trimmed;
  // var(--token, fallback) → 取 --token 的计算值
  const inner = trimmed.slice(4, -1); // 去掉 var( )
  const tokenName = inner.split(",")[0]!.trim();
  const resolved = getComputedStyle(host).getPropertyValue(tokenName).trim();
  if (resolved) return resolved;
  // 兜底：用 fallback 段（若有）
  const fallback = inner.slice(inner.indexOf(",") + 1).trim();
  return inner.includes(",") ? fallback : "#ffffff";
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

// 片元 shader 忠实移植原版（仅去掉未用的 uMouseColor）
const FRAG = /* glsl */ `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec2  uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s);
  float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = fragCoord / iResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t = iTime;

  vec2 dir = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mp = iMouse / iResolution.y * ref;
    float md = length(p - mp) / ref;
    float rr = max(uMouseRadius, 0.02);
    mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
  }

  float band = (uRimWidth - abs((smin(peaks, peaks2, max(uFluidity, 0.001)) - 0.4) * 2.0)) * 5.0;
  float ltn = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  ltn = pow(ltn, uSharpness) * uGlow;
  ltn *= clamp(1.0 - mGlow, 0.0, 1.0);

  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3 col = palette(h);

  vec3 outc = col * ltn;
  float a = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
  fragColor = vec4(outc, a * uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`.trim();

/**
 * Ferrofluid — 液态金属铁磁流体 WebGL 背景。
 *
 * 基于 react-bits Ferrofluid 原版 GLSL shader（value-noise 峰脊 + smin 软融合 + rim 亮带），
 * 瑚琏化：默认颜色吃 chart token（明暗自适应）；鼠标处液面下凹抑制辉光；
 * reduced-motion / 无 WebGL 自动降级为 chart token 径向渐变静态兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Ferrofluid colors={["var(--color-chart-1)", "var(--color-chart-2)"]} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Ferrofluid({
  colors = DEFAULT_COLORS,
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  rimWidth = 0.2,
  sharpness = 2.5,
  shimmer = 1.5,
  glow = 2,
  flowDirection = "down",
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.35,
  mouseDampening = 0.15,
  dpr,
  className,
  fallback,
}: FerrofluidProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const host = canvas.parentElement ?? canvas;
      // dpr 显式传入则尊重；否则取 min(设备像素比, 2) 省高分屏 GPU
      const deviceDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const ratio = dpr ?? Math.min(deviceDpr, 2);
      const renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr: ratio });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      // 颜色：先经容器计算样式把 var(--…) 解析成真实颜色，再转 0–1 RGB
      const base = (colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);
      const count = base.length;
      const arr: [number, number, number][] = [];
      for (let i = 0; i < MAX_COLORS; i++) {
        arr.push(cssColorToRgb01(resolveColor(host, base[Math.min(i, count - 1)]!)));
      }

      const flow = FLOW_VEC[flowDirection] ?? FLOW_VEC.down;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
          iMouse: { value: [0, 0] },
          iTime: { value: 0 },
          uColor0: { value: arr[0] },
          uColor1: { value: arr[1] },
          uColor2: { value: arr[2] },
          uColor3: { value: arr[3] },
          uColor4: { value: arr[4] },
          uColor5: { value: arr[5] },
          uColor6: { value: arr[6] },
          uColor7: { value: arr[7] },
          uColorCount: { value: count },
          uFlow: { value: flow },
          uSpeed: { value: speed },
          uScale: { value: scale },
          uTurbulence: { value: turbulence },
          uFluidity: { value: fluidity },
          uRimWidth: { value: rimWidth },
          uSharpness: { value: sharpness },
          uShimmer: { value: shimmer },
          uGlow: { value: glow },
          uOpacity: { value: opacity },
          uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
          uMouseStrength: { value: mouseStrength },
          uMouseRadius: { value: mouseRadius },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标交互：在 host 容器上挂指针监听，目标值 + render 内指数平滑跟随
      const mouseTarget: [number, number] = [0, 0];
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const sc = ratio || 1;
        const x = (e.clientX - rect.left) * sc;
        const y = (rect.height - (e.clientY - rect.top)) * sc;
        mouseTarget[0] = x;
        mouseTarget[1] = y;
        if (mouseDampening <= 0) {
          program.uniforms.iMouse!.value = [x, y];
        }
      };
      if (mouseInteraction) {
        host.addEventListener("pointermove", onPointerMove);
      }

      let lastT = 0;
      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.iResolution!.value = [
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
          1,
        ];
      };
      resize(host.clientWidth || canvas.clientWidth, host.clientHeight || canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.iTime!.value = t * 0.001;
          if (mouseInteraction && mouseDampening > 0) {
            if (!lastT) lastT = t;
            const dt = (t - lastT) / 1000;
            lastT = t;
            const tau = Math.max(1e-4, mouseDampening);
            let factor = 1 - Math.exp(-dt / tau);
            if (factor > 1) factor = 1;
            const cur = program.uniforms.iMouse!.value as number[];
            cur[0]! += (mouseTarget[0] - cur[0]!) * factor;
            cur[1]! += (mouseTarget[1] - cur[1]!) * factor;
          } else {
            lastT = t;
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (mouseInteraction) host.removeEventListener("pointermove", onPointerMove);
          program.remove?.();
        },
      };
    },
    [
      colors,
      speed,
      scale,
      turbulence,
      fluidity,
      rimWidth,
      sharpness,
      shimmer,
      glow,
      flowDirection,
      opacity,
      mouseInteraction,
      mouseStrength,
      mouseRadius,
      mouseDampening,
      dpr,
    ],
  );

  // reduced-motion / 无 WebGL：吃 chart token 的径向渐变静态兜底（液态金属层次感）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_80%_60%_at_50%_40%,var(--color-chart-1)_0%,var(--color-chart-2)_45%,var(--color-chart-4)_75%,transparent_100%)]",
          "opacity-80",
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
        "pointer-events-none absolute inset-0 z-0 block h-full w-full overflow-hidden",
        className,
      )}
      aria-hidden
    />
  );
}
