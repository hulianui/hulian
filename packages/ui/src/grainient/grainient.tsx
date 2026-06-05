"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { GrainientProps } from "./grainient.types";

// 吸取自 React Bits Grainient：三色域扭曲（domain-warp）渐变 + 噪声驱动旋转 +
// 胶片颗粒（grain）叠加 + 对比度/gamma/饱和度后期，全屏 fragment shader 实时生成
// 柔糯流动的色场背景。
//
// 瑚琏化要点：
// 1. 渲染引擎从原版 ogl 直接手搓的 Renderer/Program/RAF 改为复用瑚琏共享帮手
//    useGlCanvas —— 懒加载 ogl（代码分割）、StrictMode 双挂载安全（每次新建 canvas 避免
//    loseContext 毒化）、IntersectionObserver 离屏暂停、ResizeObserver 自适应、卸载兜底
//    loseContext，逻辑单一真源。
// 2. 三色默认吃 chart token（chart-1/2/4，明暗自适应），替原版写死的紫橙 hex；
//    任意 CSS 颜色（hex/oklch/rgb/var(--…)）经离屏 canvas 统一解析为 0..1 RGB 喂 uniform。
// 3. reduced-motion / 无 WebGL 自动降级为静态三色 linear-gradient 兜底（DOM 始终存在，
//    不因 reduced-motion 卸载内容）。
// 4. 顶点用 attribute/varying（ogl Triangle 内建 position），fragment 由 #version 300 es
//    降为 WebGL1 GLSL（precision highp + gl_FragColor），与瑚琏其余 GL 件一致、兼容性更广。
// 5. 纯装饰层 aria-hidden + pointer-events-none，不挡交互。

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader（ogl Triangle 已在 clip-space 全覆盖视口）
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// Grainient 片元 shader（自 react-bits 原版 mainImage 移植，WebGL1 GLSL）
// 算法：噪声旋转 → 正弦域扭曲 → 三色 smoothstep 双层混合 → 颗粒叠加 →
//      对比度/饱和度/gamma 后期 → clamp 输出。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;
uniform vec2  iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2  uCenterOffset;
uniform float uZoom;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a){ float s=sin(a),c=cos(a); return mat2(c,-s,s,c); }

vec2 hash(vec2 p){
  p = vec2(dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)));
  return fract(sin(p)*43758.5453);
}

float noise(vec2 p){
  vec2 i=floor(p), f=fract(p), u=f*f*(3.0-2.0*f);
  float n=mix(
    mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)), f-vec2(0.0,0.0)),
        dot(-1.0+2.0*hash(i+vec2(1.0,0.0)), f-vec2(1.0,0.0)), u.x),
    mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)), f-vec2(0.0,1.0)),
        dot(-1.0+2.0*hash(i+vec2(1.0,1.0)), f-vec2(1.0,1.0)), u.x),
    u.y);
  return 0.5+0.5*n;
}

void main(){
  float t = iTime * uTimeSpeed;
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv - 0.5 + uCenterOffset;
  tuv /= max(uZoom, 0.001);

  float degree = noise(vec2(t*0.1, tuv.x*tuv.y) * uNoiseScale);
  tuv.y *= 1.0/ratio;
  tuv *= Rot(radians((degree-0.5)*uRotationAmount + 180.0));
  tuv.y *= ratio;

  float frequency = uWarpFrequency;
  float ws = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / ws;
  float warpTime = t * uWarpSpeed;
  tuv.x += sin(tuv.y*frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x*(frequency*1.5) + warpTime) / (amplitude*0.5);

  vec3 colLav  = uColor1;
  vec3 colOrg  = uColor2;
  vec3 colDark = uColor3;
  float b = uColorBalance;
  float s = max(uBlendSoftness, 0.0);
  mat2 blendRot = Rot(radians(uBlendAngle));
  float blendX = (tuv*blendRot).x;
  float edge0 = -0.3 - b - s;
  float edge1 =  0.2 - b + s;
  float v0 =  0.5 - b + s;
  float v1 = -0.3 - b - s;
  vec3 layer1 = mix(colDark, colOrg, S(edge0,edge1,blendX));
  vec3 layer2 = mix(colOrg, colLav, S(edge0,edge1,blendX));
  vec3 col = mix(layer1, layer2, S(v0,v1,tuv.y));

  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if(uGrainAnimated > 0.5){ grainUv += vec2(iTime*0.05); }
  float grain = fract(sin(dot(grainUv, vec2(12.9898,78.233)))*43758.5453);
  col += (grain-0.5) * uGrainAmount;

  col = (col-0.5)*uContrast + 0.5;
  float luma = dot(col, vec3(0.2126,0.7152,0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = pow(max(col, 0.0), vec3(1.0/max(uGamma, 0.001)));
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0..1）：离屏 1×1 canvas 让浏览器负责所有颜色空间转换。
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

// ---------------------------------------------------------------------------
// 解析某 chart token（挂载时 canvas 在 DOM，可拿到当前主题下的真实值）
// ---------------------------------------------------------------------------
function resolveToken(
  el: HTMLElement,
  token: string,
  fallback: [number, number, number],
): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue(token).trim();
  if (!raw) return fallback;
  return cssColorToRgb01(raw);
}

/**
 * Grainient — 三色域扭曲 + 颗粒胶片感的 WebGL 渐变背景。
 *
 * 基于 react-bits Grainient 原版 GLSL（domain-warp 三色渐变 + grain + 后期），
 * 瑚琏化：默认三色吃 `--color-chart-1/2/4` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为静态三色渐变兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden bg-neutral-950">
 *   <Grainient grainAmount={0.12} timeSpeed={0.3} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Grainient({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1,
  color2,
  color3,
  className,
  fallback,
}: GrainientProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, antialias: false, dpr });
      const gl = renderer.gl;

      // 三色：显式 prop 优先；否则读 canvas 计算样式里的 chart token
      const c1 = color1
        ? cssColorToRgb01(color1)
        : resolveToken(canvas, "--color-chart-1", [1, 0.62, 0.99]);
      const c2 = color2
        ? cssColorToRgb01(color2)
        : resolveToken(canvas, "--color-chart-2", [0.32, 0.15, 1]);
      const c3 = color3
        ? cssColorToRgb01(color3)
        : resolveToken(canvas, "--color-chart-4", [0.71, 0.59, 0.81]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iResolution: { value: new Vec2(1, 1) },
          iTime: { value: 0 },
          uTimeSpeed: { value: timeSpeed },
          uColorBalance: { value: colorBalance },
          uWarpStrength: { value: warpStrength },
          uWarpFrequency: { value: warpFrequency },
          uWarpSpeed: { value: warpSpeed },
          uWarpAmplitude: { value: warpAmplitude },
          uBlendAngle: { value: blendAngle },
          uBlendSoftness: { value: blendSoftness },
          uRotationAmount: { value: rotationAmount },
          uNoiseScale: { value: noiseScale },
          uGrainAmount: { value: grainAmount },
          uGrainScale: { value: grainScale },
          uGrainAnimated: { value: grainAnimated ? 1.0 : 0.0 },
          uContrast: { value: contrast },
          uGamma: { value: gamma },
          uSaturation: { value: saturation },
          uCenterOffset: { value: new Vec2(centerX, centerY) },
          uZoom: { value: zoom },
          uColor1: { value: c1 },
          uColor2: { value: c2 },
          uColor3: { value: c3 },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.iResolution!.value.set(
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
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
    [
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
      color1,
      color2,
      color3,
    ],
  );

  // reduced-motion / 无 WebGL：静态三色渐变兜底（DOM 始终存在）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(135deg,var(--color-chart-1)_0%,var(--color-chart-2)_50%,var(--color-chart-4)_100%)]",
          "opacity-90",
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
