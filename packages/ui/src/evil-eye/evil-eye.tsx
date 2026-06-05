"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { EvilEyeProps } from "./evil-eye.types";

// 吸取自 React Bits EvilEye：ogl 单 Triangle 全屏 fragment shader 在极坐标里叠多层
// 程序化噪声纹理画出一只翻腾火焰的「邪眼」，瞳孔随光标惯性偏移、外圈弥散辉光。
// 瑚琏化：①火焰主色/底色默认吃 chart token（离屏 canvas 解析 oklch→rgb，明暗自适应），
//   替原版写死的 #FF6F37 火橙；②去 EvilEye.css，改走 useGlCanvas 共享生命周期
//   （懒载 ogl·StrictMode 安全·离屏暂停·loseContext 兜底）；③props 走 ref 同步到 uniform，
//   不重建 GL context；④reduced-motion / 无 WebGL 降级为静态径向渐变邪眼（吃 chart token）。

// ────────────────────────────────────────────────────────────────
// 程序化噪声纹理（原版 generateNoiseTexture 移植，未改算法）
// 8 倍频 value-noise 叠加 + 对比拉伸，给火焰提供有机扰动。
// ────────────────────────────────────────────────────────────────
function generateNoiseTexture(size = 256): Uint8Array {
  const data = new Uint8Array(size * size * 4);

  function hash(x: number, y: number, s: number): number {
    let n = x * 374761393 + y * 668265263 + s * 1274126177;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function noise(px: number, py: number, freq: number, seed: number): number {
    const fx = (px / size) * freq;
    const fy = (py / size) * freq;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const tx = fx - ix;
    const ty = fy - iy;
    const w = freq | 0;
    const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);
    const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);
    const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
    const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
    return (
      v00 * (1 - tx) * (1 - ty) +
      v10 * tx * (1 - ty) +
      v01 * (1 - tx) * ty +
      v11 * tx * ty
    );
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.4;
      let totalAmp = 0;
      for (let o = 0; o < 8; o++) {
        const f = 32 * (1 << o);
        v += amp * noise(x, y, f, o * 31);
        totalAmp += amp;
        amp *= 0.65;
      }
      v /= totalAmp;
      v = (v - 0.5) * 2.2 + 0.5;
      v = Math.max(0, Math.min(1, v));
      const val = Math.round(v * 255);
      const i = (y * size + x) * 4;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }
  }

  return data;
}

// ────────────────────────────────────────────────────────────────
// GLSL shaders（原样从 react-bits EvilEye 移植，未改 uniform 语义）
// ────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform sampler2D uNoiseTexture;
uniform float uPupilSize;
uniform float uIrisWidth;
uniform float uGlowIntensity;
uniform float uIntensity;
uniform float uScale;
uniform float uNoiseScale;
uniform vec2 uMouse;
uniform float uPupilFollow;
uniform float uFlameSpeed;
uniform vec3 uEyeColor;
uniform vec3 uBgColor;

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
  uv /= uScale;
  float ft = uTime * uFlameSpeed;

  float polarRadius = length(uv) * 2.0;
  float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
  vec2 polarUv = vec2(polarRadius, polarAngle);

  vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
  vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
  vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));

  float distanceMask = 1.0 - length(uv);

  // Inner ring
  float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
  innerRing = (innerRing * distanceMask - 0.2) / 0.28;
  innerRing += noiseA.r - 0.5;
  innerRing *= 1.3;
  innerRing = clamp(innerRing, 0.0, 1.0);

  float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
  outerRing = (outerRing * distanceMask - 0.1) / 0.38;
  outerRing += noiseC.r - 0.5;
  outerRing *= 1.3;
  outerRing = clamp(outerRing, 0.0, 1.0);

  innerRing += outerRing;

  // Inner eye
  float innerEye = distanceMask - 0.1 * 2.0;
  innerEye *= noiseB.r * 2.0;

  // Pupil with cursor tracking
  vec2 pupilOffset = uMouse * uPupilFollow * 0.12;
  vec2 pupilUv = uv - pupilOffset;
  float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));
  pupil *= uPupilSize;
  pupil = clamp(pupil, 0.0, 1.0);
  pupil /= 0.35;

  // Outer eye
  float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
  outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
  outerEyeGlow += noiseC.r - 0.5;
  float outerBgGlow = outerEyeGlow;
  outerEyeGlow = pow(outerEyeGlow, 2.0);
  outerEyeGlow += distanceMask;
  outerEyeGlow *= uGlowIntensity;
  outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
  outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

  // Outer eye bg glow
  outerBgGlow += distanceMask;
  outerBgGlow = pow(outerBgGlow, 0.5);
  outerBgGlow *= 0.15;

  vec3 color = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);
  color += uBgColor;

  gl_FragColor = vec4(color, 1.0);
}
`;

// ────────────────────────────────────────────────────────────────
// CSS 颜色 → [r, g, b]（0–1）。离屏 1×1 canvas 让浏览器负责全格式
// （hex / oklch / rgb / color() / 计算后的 var）颜色空间转换。
// ────────────────────────────────────────────────────────────────
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [1, 0.435, 0.216]; // 兜底：接近原版 #FF6F37
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [1, 0.435, 0.216];
  }
}

/** 读 canvas 计算样式里的某个 token（挂载时 canvas 已在 DOM，拿得到当前主题值）。 */
function resolveToken(
  canvas: HTMLCanvasElement,
  varName: string,
  fallbackRgb: [number, number, number],
): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue(varName).trim();
  if (!raw) return fallbackRgb;
  return cssColorToRgb01(raw);
}

// ────────────────────────────────────────────────────────────────
// EvilEye 组件
// ────────────────────────────────────────────────────────────────

export function EvilEye({
  eyeColor,
  backgroundColor,
  intensity = 1.5,
  pupilSize = 0.6,
  irisWidth = 0.25,
  glowIntensity = 0.35,
  scale = 0.8,
  noiseScale = 1.0,
  pupilFollow = 1.0,
  flameSpeed = 1.0,
  className,
  fallback,
}: EvilEyeProps) {
  // 运行时光标插值状态（不进 deps，避免重建 GL）
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // prop 最新值挂 ref，render 回调直接读，无需重建 context
  const intensityRef = useRef(intensity);
  const pupilSizeRef = useRef(pupilSize);
  const irisWidthRef = useRef(irisWidth);
  const glowIntensityRef = useRef(glowIntensity);
  const scaleRef = useRef(scale);
  const noiseScaleRef = useRef(noiseScale);
  const pupilFollowRef = useRef(pupilFollow);
  const flameSpeedRef = useRef(flameSpeed);

  intensityRef.current = intensity;
  pupilSizeRef.current = pupilSize;
  irisWidthRef.current = irisWidth;
  glowIntensityRef.current = glowIntensity;
  scaleRef.current = scale;
  noiseScaleRef.current = noiseScale;
  pupilFollowRef.current = pupilFollow;
  flameSpeedRef.current = flameSpeed;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Texture, Vec2, Vec3 } = ogl;

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

      // 火焰主色 / 底色：显式 prop 优先；否则吃 chart token / 透明黑
      const [er, eg, eb] = eyeColor
        ? cssColorToRgb01(eyeColor)
        : resolveToken(canvas, "--color-chart-3", [1, 0.435, 0.216]);
      const [br, bg2, bb] = backgroundColor
        ? cssColorToRgb01(backgroundColor)
        : [0, 0, 0];

      const noiseData = generateNoiseTexture(256);
      const noiseTexture = new Texture(gl, {
        image: noiseData,
        width: 256,
        height: 256,
        generateMipmaps: false,
        flipY: false,
      });
      noiseTexture.minFilter = gl.LINEAR;
      noiseTexture.magFilter = gl.LINEAR;
      noiseTexture.wrapS = gl.REPEAT;
      noiseTexture.wrapT = gl.REPEAT;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec3(1, 1, 1) },
          uNoiseTexture: { value: noiseTexture },
          uPupilSize: { value: pupilSize },
          uIrisWidth: { value: irisWidth },
          uGlowIntensity: { value: glowIntensity },
          uIntensity: { value: intensity },
          uScale: { value: scale },
          uNoiseScale: { value: noiseScale },
          uMouse: { value: new Vec2(0, 0) },
          uPupilFollow: { value: pupilFollow },
          uFlameSpeed: { value: flameSpeed },
          uEyeColor: { value: new Vec3(er, eg, eb) },
          uBgColor: { value: new Vec3(br, bg2, bb) },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        const cw = gl.canvas.width;
        const ch = gl.canvas.height;
        program.uniforms.uResolution!.value.set(cw, ch, cw / ch || 1);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // ── 光标追踪：相对容器归一化到 [-1,1]，y 上正 ──
      const mouse = mouseRef.current;
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.tx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.ty = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };
      const onPointerLeave = () => {
        mouse.tx = 0;
        mouse.ty = 0;
      };
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);

      return {
        render(t: number) {
          // 同步运行时 prop
          program.uniforms.uIntensity!.value = intensityRef.current;
          program.uniforms.uPupilSize!.value = pupilSizeRef.current;
          program.uniforms.uIrisWidth!.value = irisWidthRef.current;
          program.uniforms.uGlowIntensity!.value = glowIntensityRef.current;
          program.uniforms.uScale!.value = scaleRef.current;
          program.uniforms.uNoiseScale!.value = noiseScaleRef.current;
          program.uniforms.uPupilFollow!.value = pupilFollowRef.current;
          program.uniforms.uFlameSpeed!.value = flameSpeedRef.current;

          // 光标惯性 lerp
          mouse.x += (mouse.tx - mouse.x) * 0.05;
          mouse.y += (mouse.ty - mouse.y) * 0.05;
          program.uniforms.uMouse!.value.set(mouse.x, mouse.y);

          program.uniforms.uTime!.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerleave", onPointerLeave);
          program.remove?.();
        },
      };
    },
    // eyeColor/backgroundColor 变化需重解析颜色 → 重建；其余 prop 走 ref 同步无需重建
    [eyeColor, backgroundColor],
  );

  // ── reduced-motion / 无 WebGL：静态径向渐变邪眼兜底 ──
  if (reduced) {
    return (
      <div
        className={cn(
          "relative block h-full w-full overflow-hidden",
          // 火焰外圈辉光 + 细长瞳孔：两层径向渐变叠加
          "bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,var(--color-chart-3)_0%,transparent_60%),radial-gradient(ellipse_8%_22%_at_50%_50%,transparent_0%,var(--color-chart-3)_30%)]",
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
      aria-hidden
      className={cn("block h-full w-full", className)}
    />
  );
}
