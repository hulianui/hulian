"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LightfallProps } from "./lightfall.types";

// 吸取自 React Bits Lightfall：在一条隧道纵深里坠落的霓虹光束，背后衬一团中心辉光，
// 光束沿环向分布、按高度循环取色、可呼吸闪烁，鼠标处增亮并牵引光团（OGL 全屏三角 + raymarch 片元）。
// 瑚琏化：
//   ① 颜色全吃 chart / primary token（默认 chart-1/2/4 + primary 背景辉光），明暗自适应，替原版写死 hex；
//      token 在挂载时经离屏 canvas 解析为 0..1 RGB 喂进 shader uniform。
//   ② 去 ogl 直接 new Renderer 的手写挂载/RAF/清理，统一走 useGlCanvas（懒加载 ogl、StrictMode 安全、
//      离屏暂停、ResizeObserver、loseContext 兜底）。
//   ③ RSC / "use client"：仅客户端 effect 内建 GL；reduced-motion / 无 WebGL → 静态渐变兜底（DOM 不卸载内容）。
//   ④ 鼠标交互在 canvas 容器上监听 pointermove，带阻尼缓动牵引光团。

const MAX_COLORS = 8;

// CSS 颜色 → [r,g,b]（0..1）：离屏 1×1 canvas 让浏览器负责一切颜色空间转换（hex/oklch/rgb/var 计算值均可）。
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

// 把任意 CSS 颜色串解析成 0..1 RGB；若是 var(--…)，先经 canvas 计算样式取真值。
function resolveColor(canvas: HTMLCanvasElement, css: string): [number, number, number] {
  let value = css;
  const m = css.match(/^\s*var\(\s*(--[\w-]+)\s*\)\s*$/);
  if (m) {
    const got = getComputedStyle(canvas).getPropertyValue(m[1]!).trim();
    if (got) value = got;
  }
  return cssColorToRgb01(value);
}

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
];

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 片元 shader 移植自 react-bits Lightfall（uniform 名沿用原版），逐帧 raymarch 出隧道坐标，
// 在角向均匀分布的多条光束上叠加拖尾与辉光，最后 tanh 压缩到 LDR。
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

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

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

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`.trim();

/**
 * Lightfall — 隧道光束坠落 WebGL 背景。
 *
 * 移植自 react-bits Lightfall（OGL 全屏三角 + raymarch 片元 shader）。
 * 瑚琏化：颜色吃 chart / primary token（明暗自适应）；统一走 useGlCanvas
 * （懒加载 ogl · StrictMode 安全 · 离屏暂停 · loseContext 兜底）；
 * reduced-motion / 无 WebGL 自动降级为静态径向渐变。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-96 overflow-hidden bg-neutral-950">
 *   <Lightfall streakCount={4} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Lightfall({
  colors = DEFAULT_COLORS,
  backgroundColor = "var(--color-primary)",
  speed = 0.5,
  streakCount = 2,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 0.6,
  twinkle = 1,
  zoom = 3,
  backgroundGlow = 0.5,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  className,
  fallback,
}: LightfallProps) {
  const colorKey = colors.join("|");

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr });
      const gl = renderer.gl;

      // 解析色板（最多 8 色，循环补齐到 8 个 uniform）+ 鼠标增亮取均色
      const base = (colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);
      const count = base.length;
      const arr: [number, number, number][] = [];
      for (let i = 0; i < MAX_COLORS; i++) {
        arr.push(resolveColor(canvas, base[Math.min(i, count - 1)]!));
      }
      const avg: [number, number, number] = [0, 0, 0];
      for (let i = 0; i < count; i++) {
        avg[0] += arr[i]![0];
        avg[1] += arr[i]![1];
        avg[2] += arr[i]![2];
      }
      avg[0] /= count;
      avg[1] /= count;
      avg[2] /= count;

      const uniforms = {
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
        uBgColor: { value: resolveColor(canvas, backgroundColor) },
        uMouseColor: { value: avg },
        uSpeed: { value: speed },
        uStreakCount: { value: Math.max(1, Math.min(16, Math.round(streakCount))) },
        uStreakWidth: { value: streakWidth },
        uStreakLength: { value: streakLength },
        uGlow: { value: glow },
        uDensity: { value: density },
        uTwinkle: { value: twinkle },
        uZoom: { value: zoom },
        uBgGlow: { value: backgroundGlow },
        uOpacity: { value: opacity },
        uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
        uMouseStrength: { value: mouseStrength },
        uMouseRadius: { value: mouseRadius },
      };

      const program = new Program(gl, { vertex: VERT, fragment: FRAG, uniforms });
      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const setRes = () => {
        uniforms.iResolution.value = [
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
          1,
        ];
      };

      // 鼠标交互：阻尼缓动牵引光团（drawingBuffer 像素坐标，y 翻转）
      const mouseTarget: [number, number] = [0, 0];
      const dampening = 0.15;
      let lastT = 0;
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = gl.drawingBufferWidth / Math.max(rect.width, 1);
        const scaleY = gl.drawingBufferHeight / Math.max(rect.height, 1);
        mouseTarget[0] = (e.clientX - rect.left) * scaleX;
        mouseTarget[1] = (rect.height - (e.clientY - rect.top)) * scaleY;
      };
      if (mouseInteraction) {
        canvas.addEventListener("pointermove", onPointerMove);
      }

      return {
        render(t: number) {
          uniforms.iTime.value = t * 0.001;
          if (mouseInteraction) {
            if (!lastT) lastT = t;
            const dt = (t - lastT) / 1000;
            lastT = t;
            let factor = 1 - Math.exp(-dt / Math.max(1e-4, dampening));
            if (factor > 1) factor = 1;
            const cur = uniforms.iMouse.value;
            cur[0] += (mouseTarget[0] - cur[0]) * factor;
            cur[1] += (mouseTarget[1] - cur[1]) * factor;
          }
          renderer.render({ scene: mesh });
        },
        resize(w: number, h: number) {
          renderer.setSize(w || 1, h || 1);
          setRes();
        },
        dispose() {
          if (mouseInteraction) {
            canvas.removeEventListener("pointermove", onPointerMove);
          }
          program.remove?.();
        },
      };
    },
    [
      colorKey,
      backgroundColor,
      speed,
      streakCount,
      streakWidth,
      streakLength,
      glow,
      density,
      twinkle,
      zoom,
      backgroundGlow,
      opacity,
      mouseInteraction,
      mouseStrength,
      mouseRadius,
    ],
  );

  // reduced-motion / 无 WebGL：静态径向渐变兜底（中心一团辉光 + 一缕竖向光带的暗示）
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(70%_90%_at_50%_30%,var(--color-chart-2)_0%,var(--color-chart-1)_28%,transparent_70%),linear-gradient(180deg,transparent,var(--color-primary)_120%)]",
          "opacity-70",
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
        "pointer-events-none absolute inset-0 z-0 block h-full w-full",
        className,
      )}
    />
  );
}
