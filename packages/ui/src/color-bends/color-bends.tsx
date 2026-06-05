"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { ColorBendsProps } from "./color-bends.types";

// 吸取自 React Bits ColorBends：多色 GLSL 流场背景——UV 经旋转/缩放后送入正弦折叠
// 噪声场，对每个颜色按软阈值带宽采样叠加，生成相互弯折、混色干涉的有机色带，
// 支持指针视差 + 局部牵引 + 自动旋转。
//
// 瑚琏化要点：
// 1. 去 three.js 依赖：Three.js ShaderMaterial/OrthographicCamera/PlaneGeometry →
//    ogl Renderer/Program/Triangle 全屏三角，复用库内 useGlCanvas 生命周期帮手
//    （懒加载 ogl·StrictMode 安全新建 canvas·RAF·ResizeObserver·离屏暂停·dispose 兜底）。
// 2. 颜色全吃 chart token（默认 --color-chart-1..5，自动明暗适配），替原版写死 hex 数组；
//    颜色解析走离屏 canvas，安全支持 hex/rgb/oklch/var(--…) 任意 CSS 颜色。
// 3. reduced-motion / 无 WebGL：自动降级为静态多段 linear-gradient 兜底（彩色而非消失）。
// 4. 纯装饰层 aria-hidden + pointer-events-none，不阻挡交互。

const MAX_COLORS = 8;

// ---------------------------------------------------------------------------
// OGL 全屏三角顶点 shader（clip-space，无需投影矩阵）。
// Triangle 内建 uv：可见区 [0,1] 仍满足 `vUv*2-1` 的 NDC 映射。
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
// 色带片元 shader（移植自 react-bits ColorBends frag）。
// Three.js → OGL 改动：gl_FragColor / gl_FragCoord 原样可用；uniform 名保持原版；
// 循环上界用编译期常量 MAX_COLORS（GLSL ES 1.0 要求 for 上界为常量）。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;
#define MAX_COLORS ${MAX_COLORS}

varying vec2 vUv;

uniform vec2  uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2  uRot;
uniform int   uColorCount;
uniform vec3  uColors[MAX_COLORS];
uniform int   uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2  uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int   uIterations;
uniform float uIntensity;
uniform float uBandWidth;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / max(uCanvas.y, 1.0)), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  col *= uIntensity;

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas 当解析器，浏览器负责所有色彩空间转换，
// 安全支持 hex / rgb / oklch / color() / CSS 变量计算值等任意格式。
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

// 不传 colors 时，从 canvas 计算样式读 chart token（当前主题下的真实值）。
function resolveChartTokens(canvas: HTMLCanvasElement): [number, number, number][] {
  const cs = getComputedStyle(canvas);
  const out: [number, number, number][] = [];
  for (let i = 1; i <= 5; i++) {
    const raw = cs.getPropertyValue(`--color-chart-${i}`).trim();
    if (raw) out.push(cssColorToRgb01(raw));
  }
  return out.length > 0 ? out : [[0.5, 0.5, 0.5]];
}

/**
 * ColorBends — 多色流场 WebGL 背景。
 *
 * 基于 react-bits ColorBends 原版 GLSL（正弦折叠噪声场 + 软阈值色带采样），
 * 瑚琏化：去 three.js 改 ogl；默认颜色吃 `--color-chart-1..5` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为静态多段渐变兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <ColorBends speed={0.3} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function ColorBends({
  colors,
  rotation = 90,
  autoRotate = 0,
  speed = 0.2,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  noise = 0.15,
  parallax = 0.5,
  mouseInfluence = 1,
  transparent = true,
  className,
  fallback,
}: ColorBendsProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({
        canvas,
        alpha: true,
        dpr,
        premultipliedAlpha: true,
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, transparent ? 0 : 1);

      // 解析色带：显式 colors 优先；否则读 canvas 计算样式里的 chart token。
      const list = (colors && colors.length > 0
        ? colors
            .filter(Boolean)
            .slice(0, MAX_COLORS)
            .map((c) => cssColorToRgb01(c))
        : resolveChartTokens(canvas).slice(0, MAX_COLORS)) as [
        number,
        number,
        number,
      ][];

      // uColors 定长 MAX_COLORS 的 vec3 数组，未用槽位填 0。
      // 必须是「普通数组的数组」（每元素含 .length），ogl 才识别为数组型 uniform 并 flatten；
      // 若传扁平 Float32Array，ogl 的 nameComponents 解析会判定缺值而跳过上传。
      const uColors: [number, number, number][] = [];
      for (let i = 0; i < MAX_COLORS; i++) {
        uColors.push(i < list.length ? list[i]! : [0, 0, 0]);
      }

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms: {
          uCanvas: { value: [1, 1] },
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uRot: { value: [1, 0] },
          uColorCount: { value: list.length },
          uColors: { value: uColors },
          uTransparent: { value: transparent ? 1 : 0 },
          uScale: { value: scale },
          uFrequency: { value: frequency },
          uWarpStrength: { value: warpStrength },
          uPointer: { value: [0, 0] },
          uMouseInfluence: { value: mouseInfluence },
          uParallax: { value: parallax },
          uNoise: { value: noise },
          uIterations: { value: iterations },
          uIntensity: { value: intensity },
          uBandWidth: { value: bandWidth },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 指针平滑跟随：target 由 pointermove 写入，current 每帧 lerp 逼近。
      const pointerTarget: [number, number] = [0, 0];
      const pointerCurrent: [number, number] = [0, 0];
      let lastT = 0;

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
        const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
        pointerTarget[0] = x;
        pointerTarget[1] = y;
      };
      canvas.addEventListener("pointermove", onPointerMove);

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        (program.uniforms.uCanvas!.value as number[])[0] = (w || 1) * dpr;
        (program.uniforms.uCanvas!.value as number[])[1] = (h || 1) * dpr;
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          const sec = t * 0.001;
          const dt = lastT === 0 ? 0 : Math.min(0.1, sec - lastT);
          lastT = sec;

          program.uniforms.uTime!.value = sec;

          const deg = (rotation % 360) + autoRotate * sec;
          const rad = (deg * Math.PI) / 180;
          (program.uniforms.uRot!.value as number[])[0] = Math.cos(rad);
          (program.uniforms.uRot!.value as number[])[1] = Math.sin(rad);

          const amt = Math.min(1, dt * 8);
          pointerCurrent[0] += (pointerTarget[0] - pointerCurrent[0]) * amt;
          pointerCurrent[1] += (pointerTarget[1] - pointerCurrent[1]) * amt;
          (program.uniforms.uPointer!.value as number[])[0] = pointerCurrent[0];
          (program.uniforms.uPointer!.value as number[])[1] = pointerCurrent[1];

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          canvas.removeEventListener("pointermove", onPointerMove);
          program.remove?.();
        },
      };
    },
    [
      colors,
      rotation,
      autoRotate,
      speed,
      scale,
      frequency,
      warpStrength,
      iterations,
      intensity,
      bandWidth,
      noise,
      parallax,
      mouseInfluence,
      transparent,
    ],
  );

  // reduced-motion / 无 WebGL：静态多段 chart 渐变兜底，保留彩色层次。
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(115deg,var(--color-chart-1)_0%,var(--color-chart-2)_30%,var(--color-chart-3)_55%,var(--color-chart-4)_78%,var(--color-chart-5)_100%)]",
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
        "pointer-events-none absolute inset-0 z-0 block h-full w-full",
        className,
      )}
      aria-hidden
    />
  );
}
