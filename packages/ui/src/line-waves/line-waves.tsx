"use client";
import type { HTMLAttributes } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LineWavesProps } from "./line-waves.types";

// 吸取自 React Bits LineWaves：全屏三角 + 片元 shader，gl_FragCoord 归一化后经
// 正弦位移场（displaceA/displaceB）双场混合 + 噪声脊线，绘出一片随时间流动、随鼠标
// 局部隆起的对角波纹线阵，三通道独立色相循环染色。
//
// 瑚琏化要点：
// 1. 颜色全吃 chart token（color1/2/3 默认读 --color-chart-1/2/4 计算样式，明暗自适应，
//    替原版写死 #ffffff 白线）；显式传色仍走离屏 canvas 全格式解析（hex/oklch/rgb/var）。
// 2. ogl Triangle + Program（与 Aurora 描述无关，同 Silk/Orb 一族），无 three.js。
// 3. 生命周期统一走 useGlCanvas：懒加载 ogl（代码分割）、StrictMode 安全（每次挂载新建
//    canvas 规避 loseContext 毒化）、RAF 单帧抛错不杀循环、离屏暂停、卸载兜底释放 context。
// 4. reduced-motion / 无 WebGL：useGlCanvas 返回 reduced=true → 渲染静态斜向 line-gradient
//    fallback（chart token 着色），DOM 始终是一个根 div，两态结构一致不卸载内容。
// 5. 鼠标交互在 setup 内手动接到容器（非 window），指针 lerp 平滑后喂 uMouse uniform。

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader：ogl Triangle 已在 clip-space，直接输出，传出 uv。
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
// 波纹片元 shader（移植自 react-bits LineWaves，uniform 名保持原版）。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define HALF_PI 1.5707963

float hashF(float n) {
  return fract(sin(n * 127.1) * 43758.5453123);
}

float smoothNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hashF(i), hashF(i + 1.0), u);
}

float displaceA(float coord, float t) {
  float result = sin(coord * 2.123) * 0.2;
  result += sin(coord * 3.234 + t * 4.345) * 0.1;
  result += sin(coord * 0.589 + t * 0.934) * 0.5;
  return result;
}

float displaceB(float coord, float t) {
  float result = sin(coord * 1.345) * 0.3;
  result += sin(coord * 2.734 + t * 3.345) * 0.2;
  result += sin(coord * 0.189 + t * 0.934) * 0.3;
  return result;
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords * 2.0 - 1.0;
  coords = rotate2D(coords, uRotation);

  float halfT = uTime * uSpeed * 0.5;
  float fullT = uTime * uSpeed;

  float mouseWarp = 0.0;
  if (uEnableMouse) {
    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
  }

  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

  vec2 fieldA = vec2(warpAx, warpAy);
  vec2 fieldB = vec2(warpBx, warpBy);
  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
  float vMask = 1.0 - max(fadeTop, fadeBottom);

  float tileCount = mix(uOuterLines, uInnerLines, vMask);
  float scaledY = blended.y * tileCount;
  float nY = smoothNoise(abs(scaledY));

  float ridge = pow(
    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
    5.0
  );

  float lines = 0.0;
  for (float i = 1.0; i < 3.0; i += 1.0) {
    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
  }

  float pattern = vMask * lines;

  float cycleT = fullT * uColorCycleSpeed;
  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);

  gl_FragColor = vec4(col, alpha);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas 解析任意 CSS 颜色（hex/oklch/rgb/var 计算值）。
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

// 从元素计算样式读取某个 chart token（挂载时已在 DOM，可拿当前主题色）。
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
 * LineWaves — 流动波纹线阵 WebGL 背景。
 *
 * 基于 react-bits LineWaves 原版 GLSL（双正弦位移场 + 噪声脊线 + 三通道色相循环），
 * 瑚琏化：三通道色默认吃 `--color-chart-1/2/4` token（明暗自适应）；鼠标处线条局部隆起；
 * reduced-motion / 无 WebGL 自动降级为静态斜向线纹 fallback。
 *
 * 用法：放在 `relative overflow-hidden` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden bg-neutral-950">
 *   <LineWaves brightness={0.3} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function LineWaves({
  speed = 0.3,
  innerLineCount = 32,
  outerLineCount = 36,
  warpIntensity = 1,
  rotation = -45,
  edgeFadeWidth = 0,
  colorCycleSpeed = 1,
  brightness = 0.2,
  color1,
  color2,
  color3,
  enableMouseInteraction = true,
  mouseInfluence = 2,
  className,
  fallback,
  ...props
}: LineWavesProps & Omit<HTMLAttributes<HTMLDivElement>, keyof LineWavesProps>) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        dpr,
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      // 解析三通道色：显式 prop 优先，否则读 chart token（明暗自适应）。
      const c1 = color1
        ? cssColorToRgb01(color1)
        : resolveToken(canvas, "--color-chart-1", [1, 1, 1]);
      const c2 = color2
        ? cssColorToRgb01(color2)
        : resolveToken(canvas, "--color-chart-2", [1, 1, 1]);
      const c3 = color3
        ? cssColorToRgb01(color3)
        : resolveToken(canvas, "--color-chart-4", [1, 1, 1]);

      const rotationRad = (rotation * Math.PI) / 180;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec3(1, 1, 1) },
          uSpeed: { value: speed },
          uInnerLines: { value: innerLineCount },
          uOuterLines: { value: outerLineCount },
          uWarpIntensity: { value: warpIntensity },
          uRotation: { value: rotationRad },
          uEdgeFadeWidth: { value: edgeFadeWidth },
          uColorCycleSpeed: { value: colorCycleSpeed },
          uBrightness: { value: brightness },
          uColor1: { value: new Vec3(c1[0], c1[1], c1[2]) },
          uColor2: { value: new Vec3(c2[0], c2[1], c2[2]) },
          uColor3: { value: new Vec3(c3[0], c3[1], c3[2]) },
          uMouse: { value: new Vec2(0.5, 0.5) },
          uMouseInfluence: { value: mouseInfluence },
          uEnableMouse: { value: enableMouseInteraction },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const applyResolution = () => {
        const w = gl.canvas.width || 1;
        const h = gl.canvas.height || 1;
        program.uniforms.uResolution!.value.set(w, h, w / h);
      };

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        applyResolution();
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 鼠标交互：接在 canvas 上（非 window），目标值 lerp 平滑到当前值。
      const current: [number, number] = [0.5, 0.5];
      const target: [number, number] = [0.5, 0.5];

      const handleMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        target[0] = (e.clientX - rect.left) / rect.width;
        target[1] = 1 - (e.clientY - rect.top) / rect.height;
      };
      const handleLeave = () => {
        target[0] = 0.5;
        target[1] = 0.5;
      };

      if (enableMouseInteraction) {
        canvas.addEventListener("pointermove", handleMove);
        canvas.addEventListener("pointerleave", handleLeave);
      }

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001;
          if (enableMouseInteraction) {
            current[0] += 0.05 * (target[0] - current[0]);
            current[1] += 0.05 * (target[1] - current[1]);
            program.uniforms.uMouse!.value.set(current[0], current[1]);
          } else {
            program.uniforms.uMouse!.value.set(0.5, 0.5);
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (enableMouseInteraction) {
            canvas.removeEventListener("pointermove", handleMove);
            canvas.removeEventListener("pointerleave", handleLeave);
          }
          program.remove?.();
        },
      };
    },
    [
      speed,
      innerLineCount,
      outerLineCount,
      warpIntensity,
      rotation,
      edgeFadeWidth,
      colorCycleSpeed,
      brightness,
      color1,
      color2,
      color3,
      enableMouseInteraction,
      mouseInfluence,
    ],
  );

  // reduced-motion / 无 WebGL：静态斜向线纹 fallback（chart token 着色）。
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:repeating-linear-gradient(-45deg,var(--color-chart-1)_0px,transparent_2px,transparent_9px)]",
          "opacity-40",
          className,
        )}
        aria-hidden
        {...props}
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
      {...props}
    />
  );
}
