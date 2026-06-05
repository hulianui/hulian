"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LightPillarProps } from "./light-pillar.types";

// 吸取自 React Bits LightPillar：正交相机 + 全屏 raymarch 片元 shader，沿 y 轴
// 累积体积辉光生成一根缓慢自转、内部有多层波动噪声的「光柱」，顶/底双色纵向渐变。
// 瑚琏化：① three.js → ogl（与 Silk/Orb 同栈，零新增依赖，复用 useGlCanvas 的
// StrictMode 安全挂载 + RAF + 离屏暂停 + reduced-motion 降级）；② 默认顶/底色吃
// --color-chart-2 / --color-chart-1 token（明暗自适应，去掉原版写死 #5227FF/#FF9FFC）；
// ③ "use client" + 懒加载 ogl，RSC 安全；④ reduced-motion / 无 WebGL 自动降级为
// 吃 token 的静态渐变光柱 fallback（DOM 不随 reduced 增删内容，仅替换装饰层）。

// ---------------------------------------------------------------------------
// OGL Triangle 全屏顶点 shader（clip-space，无需投影矩阵；uv 由 Triangle 内建）
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
// 光柱片元 shader
// 移植要点（three.js → ogl）：
//   ① varying vec2 vUv 同名传出，OGL Triangle 的 uv 覆盖视口
//   ② 固定迭代次数（原版按 quality 动态生成 GLSL 字符串；这里取中高档常量，
//      避免运行时拼 shader 字符串）：MAX_ITER=56 / WAVE_ITER=3 / STEP_MULT=1.1
//   ③ uniform 名沿用原版 uTopColor/uBottomColor/uIntensity/uGlowAmount/...
//   ④ 旋转 cos/sin 在 JS 侧每帧算好喂进来（uRotCos/uRotSin），与原版一致
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uTopColor;
uniform vec3  uBottomColor;
uniform float uIntensity;
uniform float uGlowAmount;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform float uNoiseIntensity;
uniform float uRotCos;
uniform float uRotSin;
uniform float uPillarRotCos;
uniform float uPillarRotSin;
uniform float uWaveSin;
uniform float uWaveCos;
varying vec2 vUv;

const float STEP_MULT = 1.1;
const int   MAX_ITER  = 56;
const int   WAVE_ITER = 3;

// GLSL ES 1.0（WebGL1，ogl 默认）无内建 tanh，自补 vec3 版本（原版用 tanh 压 HDR→LDR）
vec3 tanh3(vec3 x) {
  vec3 e2 = exp(2.0 * x);
  return (e2 - 1.0) / (e2 + 1.0);
}

void main() {
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y, uPillarRotSin * uv.x + uPillarRotCos * uv.y);

  vec3 ro = vec3(0.0, 0.0, -10.0);
  vec3 rd = normalize(vec3(uv, 1.0));

  float rotC = uRotCos;
  float rotS = uRotSin;

  vec3 col = vec3(0.0);
  float t = 0.1;

  for (int i = 0; i < MAX_ITER; i++) {
    vec3 p = ro + rd * t;
    p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);

    vec3 q = p;
    q.y = p.y * uPillarHeight + uTime;

    float freq = 1.0;
    float amp = 1.0;
    for (int j = 0; j < WAVE_ITER; j++) {
      q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z, uWaveSin * q.x + uWaveCos * q.z);
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }

    float d = length(cos(q.xz)) - 0.2;
    float bound = length(p.xz) - uPillarWidth;
    float k = 4.0;
    float h = max(k - abs(d - bound), 0.0);
    d = max(d, bound) + h * h * 0.0625 / k;
    d = abs(d) * 0.15 + 0.01;

    float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);
    col += mix(uBottomColor, uTopColor, grad) / d;

    t += d * STEP_MULT;
    if (t > 50.0) break;
  }

  float widthNorm = uPillarWidth / 3.0;
  col = tanh3(col * uGlowAmount / max(widthNorm, 0.001));

  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;

  gl_FragColor = vec4(col * uIntensity, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas 由浏览器负责全格式解析
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.32, 0.15, 1.0]; // 兜底：接近原版顶色 #5227FF
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.32, 0.15, 1.0];
  }
}

// 从 canvas 计算样式读 chart token（挂载时已在 DOM，可拿当前主题值）
function resolveToken(
  canvas: HTMLCanvasElement,
  token: string,
  fallback: [number, number, number],
): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue(token).trim();
  if (!raw) return fallback;
  return cssColorToRgb01(raw);
}

/**
 * LightPillar — 体积光柱 WebGL 背景。
 *
 * 基于 React Bits LightPillar 原版 GLSL raymarch shader（沿 y 轴累积辉光 + 多层
 * 波动噪声 + 顶底双色渐变），three.js → ogl 移植。瑚琏化：默认顶/底色吃
 * `--color-chart-2` / `--color-chart-1` token（明暗自适应）；reduced-motion /
 * 无 WebGL 自动降级为吃 token 的静态渐变光柱 fallback。
 *
 * 用法：放在 `relative` 深色容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <LightPillar intensity={1.1} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function LightPillar({
  topColor,
  bottomColor,
  intensity = 1,
  rotationSpeed = 0.3,
  glowAmount = 0.005,
  pillarWidth = 3,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  pillarRotation = 0,
  className,
  fallback,
}: LightPillarProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 解析顶/底色：显式 prop 优先；否则读 canvas 计算样式里的 chart token
      const top = topColor
        ? cssColorToRgb01(topColor)
        : resolveToken(canvas, "--color-chart-2", [0.32, 0.15, 1.0]);
      const bottom = bottomColor
        ? cssColorToRgb01(bottomColor)
        : resolveToken(canvas, "--color-chart-1", [1.0, 0.62, 0.99]);

      const pillarRotRad = (pillarRotation * Math.PI) / 180;
      const waveSin = Math.sin(0.4);
      const waveCos = Math.cos(0.4);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec2(canvas.clientWidth || 1, canvas.clientHeight || 1) },
          uTopColor: { value: new Color(top[0], top[1], top[2]) },
          uBottomColor: { value: new Color(bottom[0], bottom[1], bottom[2]) },
          uIntensity: { value: intensity },
          uGlowAmount: { value: glowAmount },
          uPillarWidth: { value: pillarWidth },
          uPillarHeight: { value: pillarHeight },
          uNoiseIntensity: { value: noiseIntensity },
          uRotCos: { value: 1.0 },
          uRotSin: { value: 0.0 },
          uPillarRotCos: { value: Math.cos(pillarRotRad) },
          uPillarRotSin: { value: Math.sin(pillarRotRad) },
          uWaveSin: { value: waveSin },
          uWaveCos: { value: waveCos },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uResolution!.value.set(w || 1, h || 1);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 时间按 rotationSpeed 推进（原版每帧 += 0.016 * speed），旋转 = cos/sin(t*0.3)
      let simTime = 0;
      let lastMs = 0;

      return {
        render(t: number) {
          if (lastMs === 0) lastMs = t;
          const dt = Math.min((t - lastMs) / 1000, 0.05); // 截断防卡顿大跳
          lastMs = t;
          simTime += dt * 60 * 0.016 * rotationSpeed; // 60fps 基准还原原版步进
          program.uniforms.uTime!.value = simTime;
          program.uniforms.uRotCos!.value = Math.cos(simTime * 0.3);
          program.uniforms.uRotSin!.value = Math.sin(simTime * 0.3);
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [
      topColor,
      bottomColor,
      intensity,
      rotationSpeed,
      glowAmount,
      pillarWidth,
      pillarHeight,
      noiseIntensity,
      pillarRotation,
    ],
  );

  // reduced-motion / 无 WebGL：静态渐变光柱 fallback（吃 token，纵向双色）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden",
          className,
        )}
        aria-hidden
      >
        <div
          className={cn(
            "absolute inset-y-0 left-1/2 w-1/3 -translate-x-1/2 blur-2xl",
            "[background:linear-gradient(to_top,var(--color-chart-1),var(--color-chart-2))]",
            "opacity-70",
          )}
        />
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
