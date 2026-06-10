"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { PixelSnowProps } from "./pixel-snow.types";

// 吸取自 React Bits PixelSnow：在像素化（马赛克）网格里对一个 3D 体素雪场做光线步进，
// 逐格哈希决定是否生成雪花、按景深淡出，得到一片向镜头飘来的复古像素雪。
// 瑚琏化：
//   ① 去 three.js 依赖 —— 改用 ogl 复用库内 useGlCanvas 生命周期帮手（懒加载 / SSR 安全 /
//      StrictMode 安全 remount / 离屏暂停 / 卸载兜底 loseContext）。
//   ② GLSL 片元 shader 与引擎无关，原样移植；因依赖 uint 位运算哈希，升级为 GLSL ES 3.0
//      (#version 300 es)，gl_FragColor → out vec4 fragColor。
//   ③ 默认颜色按画布身后真实底色亮度自适应：先解析 --color-foreground token，与向上
//      查找到的实际 backdrop 底色做亮度对比；对比不足（如亮色主题的深色 hero 容器里
//      前景是近黑 → 撞色）则取反改用 --color-background token 或纯白/纯黑兜底，
//      保证任意主题 × 任意底色组合下雪都清晰可见（替原版写死 #ffffff）。
//   ④ reduced-motion / 无 WebGL 自动降级为 token 化静态点阵雪花，DOM 不抖。
// 用法：放在 relative 容器里，组件自带 absolute inset-0 z-0。

// ---------------------------------------------------------------------------
// 顶点 shader：OGL Triangle 已在 clip-space 全覆盖视口，直接透传。
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// ---------------------------------------------------------------------------
// 片元 shader（移植自 react-bits PixelSnow，three.js → ogl / GLSL ES 3.0）：
//   · uvec3 哈希 + 位运算需要 WebGL2，故 #version 300 es
//   · gl_FragColor → out vec4 fragColor
//   · 其余光线步进 / 雪花 SDF / 景深淡出逻辑与原版逐行一致
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `#version 300 es
precision highp float;

out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uPixelResolution;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;

#define PI 3.14159265
#define PI_OVER_6 0.5235988
#define PI_OVER_3 1.0471976
#define M1 1597334677u
#define M2 3812015801u
#define M3 3299493293u
#define F0 2.3283064e-10

#define hashU(n) (n * (n ^ (n >> 15)))
#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)

const vec3 camK = vec3(0.57735027, 0.57735027, 0.57735027);
const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);
const vec2 b1d = vec2(0.574, 0.819);

vec3 hash3(uint n) {
  uvec3 hashed = hashU(n) * uvec3(1u, 511u, 262143u);
  return vec3(hashed) * F0;
}

float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));
  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);
  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);
  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);
  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}

void main() {
  float invPixelRes = 1.0 / uPixelResolution;
  float pixelSize = max(1.0, floor(0.5 + uResolution.x * invPixelRes));
  float invPixelSize = 1.0 / pixelSize;

  vec2 fragCoord = floor(gl_FragCoord.xy * invPixelSize);
  vec2 res = uResolution * invPixelSize;
  float invResX = 1.0 / res.x;

  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;

  float timeSpeed = uTime * uSpeed;
  float windX = cos(uDirection) * 0.4;
  float windY = sin(uDirection) * 0.4;
  vec3 camPos = (windX * camI + windY * camJ + 0.1 * camK) * timeSpeed;
  vec3 pos = camPos;

  vec3 absRay = max(abs(ray), vec3(0.001));
  vec3 strides = 1.0 / absRay;
  vec3 raySign = step(ray, vec3(0.0));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, raySign);

  float rayDotCamK = dot(ray, camK);
  float invRayDotCamK = 1.0 / rayDotCamK;
  float invDepthFade = 1.0 / uDepthFade;
  float halfInvResX = 0.5 * invResX;
  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);

  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    if (t >= uFarPlane) break;

    vec3 fpos = floor(pos);
    uint cellCoord = coord3(fpos);
    float cellHash = hash3(cellCoord).x;

    if (cellHash < uDensity) {
      vec3 h = hash3(cellCoord);

      vec3 sinArg1 = fpos.yzx * 0.073;
      vec3 sinArg2 = fpos.zxy * 0.27;
      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(sinArg1) + 4.0 * sin(sinArg2) + 2.0 * h + timeAnim);
      flakePos = flakePos * 0.8 + 0.1 + fpos;

      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;

      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        float testX = dot(testPos, camI);
        float testY = dot(testPos, camJ);
        vec2 testUV = abs(vec2(testX, testY));

        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);

        float dist;
        if (uVariant < 0.5) {
          dist = max(testUV.x, testUV.y);
        } else if (uVariant < 1.5) {
          dist = length(testUV);
        } else {
          float invFlakeSize = 1.0 / flakeSize;
          dist = snowflakeDist(vec2(testX, testY) * invFlakeSize) * flakeSize;
        }

        if (dist < flakeSize) {
          float flakeSizeRatio = uFlakeSize / flakeSize;
          float intensity = exp2(-(t + toIntersection) * invDepthFade) *
                           min(1.0, flakeSizeRatio * flakeSizeRatio) * uBrightness;
          // 景深淡出走 alpha 而非把颜色乘暗（原版 uColor*intensity, alpha=1 只在
          // 纯黑底上等价；浅色底上深色雪会"越远越黑越显眼"，方向反了）。
          // 在深色底上两者数学等价：c*a + bg*(1-a) ≈ c*a（bg≈0）。
          fragColor = vec4(uColor, clamp(pow(intensity, uGamma), 0.0, 1.0));
          return;
        }
      }
    }

    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 sel = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * sel;
    t += nextStep;
    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), sel);
  }

  fragColor = vec4(0.0);
}
`;

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b,a]（0–1）：离屏 1×1 canvas 让浏览器负责全格式解析
//（hex / rgb / oklch / 计算后的 backgroundColor 串均可，WebGL 不认 CSS 字符串）。
// ---------------------------------------------------------------------------
function cssColorToRgba01(css: string): [number, number, number, number] | null {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255, d[3]! / 255];
  } catch {
    return null;
  }
}

function cssColorToRgb01(css: string): [number, number, number] {
  const rgba = cssColorToRgba01(css);
  return rgba ? [rgba[0], rgba[1], rgba[2]] : [1, 1, 1];
}

// sRGB → 相对亮度（WCAG 线性化），0=纯黑 1=纯白，用于对比度判定。
function relLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// 沿祖先链找画布身后第一个不透明背景色（雪真正画在谁上面）。
function resolveBackdropRgb(el: HTMLElement): [number, number, number] | null {
  let node: HTMLElement | null = el;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg) {
      const rgba = cssColorToRgba01(bg);
      if (rgba && rgba[3] > 0.05) return [rgba[0], rgba[1], rgba[2]];
    }
    node = node.parentElement;
  }
  return null;
}

// 默认雪色 = 与实际 backdrop 底色对比足够的主题色：
//   ① 优先 --color-foreground token（保持 token 着色、明暗自适应）；
//   ② 前景与底色撞色（如亮色主题 × 深色 hero 容器：前景近黑画在深底上）→
//      取反改用 --color-background token；
//   ③ token 都不可用 / 都撞色 → 按底色亮度兜底纯白（深底）或近黑（浅底）。
function resolveAutoColor(canvas: HTMLCanvasElement): [number, number, number] {
  const style = getComputedStyle(canvas);
  const readToken = (name: string): [number, number, number] | null => {
    const raw = style.getPropertyValue(name).trim();
    if (!raw) return null;
    const rgba = cssColorToRgba01(raw);
    return rgba && rgba[3] > 0 ? [rgba[0], rgba[1], rgba[2]] : null;
  };
  const fg = readToken("--color-foreground");
  const bgToken = readToken("--color-background");
  const backdrop = resolveBackdropRgb(canvas) ?? bgToken;
  if (!backdrop) return fg ?? [1, 1, 1];

  const MIN_CONTRAST = 0.3; // 相对亮度差阈值，低于此视为撞色不可见
  const bdLum = relLuminance(backdrop);
  if (fg && Math.abs(relLuminance(fg) - bdLum) >= MIN_CONTRAST) return fg;
  if (bgToken && Math.abs(relLuminance(bgToken) - bdLum) >= MIN_CONTRAST)
    return bgToken;
  return bdLum < 0.5 ? [1, 1, 1] : [0.08, 0.09, 0.11];
}

// 显式 color prop：借宿主元素 color 属性让浏览器解析（var(--…) / oklch / hex 均可，
// 裸 var() 串直接喂离屏 canvas fillStyle 会解析失败回退黑）。
function resolveExplicitColor(
  el: HTMLElement,
  css: string,
): [number, number, number] {
  const prev = el.style.color;
  el.style.color = css;
  const computed = getComputedStyle(el).color;
  el.style.color = prev;
  return cssColorToRgb01(computed || css);
}

const VARIANT_VALUE: Record<NonNullable<PixelSnowProps["variant"]>, number> = {
  square: 0,
  round: 1,
  snowflake: 2,
};

/**
 * PixelSnow — 像素化体素雪场 WebGL 背景。
 *
 * 基于 react-bits PixelSnow 原版 GLSL 光线步进 shader（逐网格哈希生雪 + 景深淡出），
 * 瑚琏化：去 three.js 改 ogl；默认颜色按画布身后实际底色亮度自适应取色
 *（优先 `--color-foreground` token，撞色时自动取反，深底亮雪 / 浅底暗雪）；
 * reduced-motion / 无 WebGL 自动降级为静态点阵雪花。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <PixelSnow density={0.35} variant="snowflake" />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function PixelSnow({
  color,
  flakeSize = 0.01,
  minFlakeSize = 1.25,
  pixelResolution = 200,
  speed = 1.25,
  depthFade = 8,
  farPlane = 20,
  brightness = 1,
  gamma = 0.4545,
  density = 0.3,
  variant = "square",
  direction = 125,
  className,
  fallback,
}: PixelSnowProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      const [r, g, b] = color
        ? resolveExplicitColor(canvas, color)
        : resolveAutoColor(canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec2(1, 1) },
          uFlakeSize: { value: flakeSize },
          uMinFlakeSize: { value: minFlakeSize },
          uPixelResolution: { value: pixelResolution },
          uSpeed: { value: speed },
          uDepthFade: { value: depthFade },
          uFarPlane: { value: farPlane },
          uColor: { value: new Color(r, g, b) },
          uBrightness: { value: brightness },
          uGamma: { value: gamma },
          uDensity: { value: density },
          uVariant: { value: VARIANT_VALUE[variant] ?? 0 },
          uDirection: { value: (direction * Math.PI) / 180 },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uResolution!.value.set(
          gl.drawingBufferWidth || w || 1,
          gl.drawingBufferHeight || h || 1,
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(time: number) {
          program.uniforms.uTime!.value = time * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [
      color,
      flakeSize,
      minFlakeSize,
      pixelResolution,
      speed,
      depthFade,
      farPlane,
      brightness,
      gamma,
      density,
      variant,
      direction,
    ],
  );

  // -------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：静态点阵雪花 fallback（radial-gradient 点阵）。
  // 白点 + mix-blend-difference：对任意底色自动取反（深底显白点、浅底显暗点），
  // 与 WebGL 路径的底色自适应取色策略一致。点阵走 before: 伪元素，blend/透明度
  // 不波及自定义 fallback 内容；DOM 与正常路径同为单 div，不抖。
  // -------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
          "before:mix-blend-difference before:opacity-30",
          "before:[background-image:radial-gradient(circle,white_1px,transparent_1.5px),radial-gradient(circle,white_1px,transparent_1.5px)]",
          "before:[background-size:28px_28px,44px_44px]",
          "before:[background-position:0_0,14px_22px]",
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
