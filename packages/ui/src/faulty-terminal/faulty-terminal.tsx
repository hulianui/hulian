"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { FaultyTerminalProps } from "./faulty-terminal.types";

// 吸取自 React Bits FaultyTerminal：用 fbm 噪声驱动的"字符雨"点阵 +
// 横向撕裂故障 / 扫描线滚动 / 整屏闪烁 / 桶形畸变 / 色散 / 鼠标涟漪，
// 整体复刻一台出故障的 CRT 终端。
//
// 瑚琏化要点：
// 1. 引擎从原版裸 ogl Renderer/Program/RAF 迁到共享 useGlCanvas helper：
//    懒加载 ogl（代码分割）、StrictMode 安全（每次挂载新建 canvas 避 loseContext 毒化）、
//    RAF 单帧抛错不杀循环、IntersectionObserver 离屏暂停、ResizeObserver 自适应。
// 2. 着色（tint）默认吃 --color-chart-2 token（明暗自适应），替原版写死 #ffffff。
//    解析走离屏 canvas 2D，支持 hex / oklch / rgb / var(--…) 全格式。
// 3. reduced-motion / 无 WebGL → 自动降级为吃 chart token 的静态字符雨渐变兜底，
//    DOM 始终是同一个根 div（不因 reduced 卸载内容）。
// 4. 鼠标涟漪：用 ref 缓存归一化坐标 + 每帧阻尼平滑（原版逻辑），mouseReact=false 时不挂监听。
// 5. shader 逻辑（fbm / digit / displace / barrel / chromatic）忠实搬运，仅清理 dpr 等顺手。

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

const FRAG = /* glsl */ `
precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec3  iResolution;
uniform float uScale;

uniform vec2  uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3  uTint;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;
}

mat2 rotate(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p) {
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;

  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;

  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;

  mat2 modify2 = rotate(time * 0.08);
  f += amp * noise(p);

  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);

  q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  return fbm(p + r);
}

float digit(vec2 p){
    vec2 grid = uGridMul * 15.0;
    vec2 s = floor(p * grid) / grid;
    p = p * grid;
    vec2 q, r;
    float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;

    if(uUseMouse > 0.5){
        vec2 mouseWorld = uMouse * uScale;
        float distToMouse = distance(s, mouseWorld);
        float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
        intensity += mouseInfluence;

        float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
        intensity += ripple;
    }

    if(uUsePageLoadAnimation > 0.5){
        float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
        float cellDelay = cellRandom * 0.8;
        float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);

        float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
        intensity *= fadeAlpha;
    }

    p = fract(p);
    p *= uDigitSize;

    float px5 = p.x * 5.0;
    float py5 = (1.0 - p.y) * 5.0;
    float x = fract(px5);
    float y = fract(py5);

    float i = floor(py5) - 2.0;
    float j = floor(px5) - 2.0;
    float n = i * i + j * j;
    float f = n * 0.0625;

    float isOn = step(0.1, intensity - f);
    float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);

    return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
}

float onOff(float a, float b, float c) {
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look) {
    float y = look.y - mod(iTime * 0.25, 1.0);
    float window = 1.0 / (1.0 + 50.0 * y * y);
    return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec3 getColor(vec2 p){
    float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
    bar *= uScanlineIntensity;

    float displacement = displace(p);
    p.x += displacement;

    if (uGlitchAmount != 1.0) {
      float extra = displacement * (uGlitchAmount - 1.0);
      p.x += extra;
    }

    float middle = digit(p);

    const float off = 0.002;
    float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));

    vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
    return baseColor;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

void main() {
    time = iTime * 0.333333;
    vec2 uv = vUv;

    if(uCurvature != 0.0){
      uv = barrel(uv);
    }

    vec2 p = uv * uScale;
    vec3 col = getColor(p);

    if(uChromaticAberration != 0.0){
      vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
      col.r = getColor(p + ca).r;
      col.b = getColor(p - ca).b;
    }

    col *= uTint;
    col *= uBrightness;

    if(uDither > 0.0){
      float rnd = hash21(gl_FragCoord.xy);
      col += (rnd - 0.5) * (uDither * 0.003922);
    }

    gl_FragColor = vec4(col, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（各值 0–1）。离屏 1×1 canvas 2D 解析，全格式安全。
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

// 从 DOM 元素计算样式读取 chart token（当前主题下的实际值）。
function resolveTintToken(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--color-chart-2").trim();
  if (!raw) return [1, 1, 1];
  return cssColorToRgb01(raw);
}

const DEFAULT_GRID_MUL: [number, number] = [2, 1];

export function FaultyTerminal({
  scale = 1.5,
  gridMul = DEFAULT_GRID_MUL,
  digitSize = 1.5,
  timeScale = 0.3,
  pause = false,
  scanlineIntensity = 0.3,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 0,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0.2,
  tint,
  mouseReact = true,
  mouseStrength = 0.2,
  pageLoadAnimation = true,
  brightness = 1,
  className,
  fallback,
  style,
}: FaultyTerminalProps) {
  // 鼠标坐标（归一化，y 翻转）+ 阻尼平滑值，用 ref 跨帧持有。
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });

  const ditherValue = typeof dither === "boolean" ? (dither ? 1 : 0) : dither;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, dpr });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 1);

      // 着色：显式 tint 优先；否则读宿主容器的 --color-chart-2 token。
      const container = canvas.parentElement ?? canvas;
      const [tr, tg, tb] = tint
        ? cssColorToRgb01(tint)
        : resolveTintToken(container as HTMLElement);

      const loadStart =
        typeof performance !== "undefined" ? performance.now() : 0;
      const timeOffset = Math.random() * 100;
      let frozenTime = 0;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / Math.max(gl.canvas.height, 1),
            ),
          },
          uScale: { value: scale },
          uGridMul: { value: new Float32Array(gridMul) },
          uDigitSize: { value: digitSize },
          uScanlineIntensity: { value: scanlineIntensity },
          uGlitchAmount: { value: glitchAmount },
          uFlickerAmount: { value: flickerAmount },
          uNoiseAmp: { value: noiseAmp },
          uChromaticAberration: { value: chromaticAberration },
          uDither: { value: ditherValue },
          uCurvature: { value: curvature },
          uTint: { value: new Color(tr, tg, tb) },
          uMouse: {
            value: new Float32Array([
              smoothMouseRef.current.x,
              smoothMouseRef.current.y,
            ]),
          },
          uMouseStrength: { value: mouseStrength },
          uUseMouse: { value: mouseReact ? 1 : 0 },
          uPageLoadProgress: { value: pageLoadAnimation ? 0 : 1 },
          uUsePageLoadAnimation: { value: pageLoadAnimation ? 1 : 0 },
          uBrightness: { value: brightness },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.iResolution!.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / Math.max(gl.canvas.height, 1),
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 鼠标监听挂在宿主容器上（mouseReact 时）。
      const onMove = (e: MouseEvent) => {
        const rect = (container as HTMLElement).getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        mouseRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: 1 - (e.clientY - rect.top) / rect.height,
        };
      };
      if (mouseReact) {
        (container as HTMLElement).addEventListener("mousemove", onMove);
      }

      return {
        render(t: number) {
          if (!pause) {
            const elapsed = (t * 0.001 + timeOffset) * timeScale;
            program.uniforms.iTime!.value = elapsed;
            frozenTime = elapsed;
          } else {
            program.uniforms.iTime!.value = frozenTime;
          }

          if (pageLoadAnimation) {
            const progress = Math.min((t - loadStart) / 2000, 1);
            program.uniforms.uPageLoadProgress!.value = progress;
          }

          if (mouseReact) {
            const d = 0.08;
            const sm = smoothMouseRef.current;
            const m = mouseRef.current;
            sm.x += (m.x - sm.x) * d;
            sm.y += (m.y - sm.y) * d;
            const u = program.uniforms.uMouse!.value as Float32Array;
            u[0] = sm.x;
            u[1] = sm.y;
          }

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (mouseReact) {
            (container as HTMLElement).removeEventListener("mousemove", onMove);
          }
          program.remove?.();
        },
      };
    },
    [
      scale,
      gridMul[0],
      gridMul[1],
      digitSize,
      timeScale,
      pause,
      scanlineIntensity,
      glitchAmount,
      flickerAmount,
      noiseAmp,
      chromaticAberration,
      ditherValue,
      curvature,
      tint,
      mouseReact,
      mouseStrength,
      pageLoadAnimation,
      brightness,
    ],
  );

  // reduced-motion / 无 WebGL：静态字符雨渐变兜底（暗底 + chart token 竖向条纹质感）。
  if (reduced) {
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden",
          "[background:repeating-linear-gradient(90deg,transparent_0,transparent_3px,color-mix(in_oklch,var(--color-chart-2)_60%,transparent)_3px,transparent_5px),linear-gradient(180deg,var(--color-foreground)_0%,transparent_70%)]",
          "opacity-40",
          className,
        )}
        style={style}
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
        "absolute inset-0 z-0 block h-full w-full overflow-hidden",
        mouseReact ? undefined : "pointer-events-none",
        className,
      )}
      style={style}
    />
  );
}
