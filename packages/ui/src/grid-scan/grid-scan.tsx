"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { GridScanProps } from "./grid-scan.types";

// 吸取自 React Bits GridScan：透视射线投射出的无限网格地面 + 沿纵深推进的发光扫描带
// （高斯光晕脉冲扫过网格，配合距离衰减营造科幻雷达扫描感）。
//
// 瑚琏化要点：
// 1. 彻底去依赖——原版叠了 three.js（渲染）+ postprocessing（bloom/色差）+ face-api.js（人脸追踪
//    驱动透视偏摆）。瑚琏只保留视觉灵魂：把核心 GLSL 透视网格 + 扫描脉冲移植到 ogl（与 Silk/Orb
//    同一套 WebGL 引擎），删掉 webcam 人脸追踪（隐私 + 重依赖），改用轻量鼠标视差驱动偏摆；
//    bloom/色差用 shader 内的光晕项近似，无需后期 pass。
// 2. 颜色吃 token——网格线默认 --color-border、扫描带默认 --color-primary，明暗主题自适应。
// 3. RSC/降级——经 useGlCanvas：SSR 安全、StrictMode 安全（每次挂载新建 canvas 避免 loseContext
//    毒化）、IntersectionObserver 离屏暂停；reduced-motion / 无 WebGL 自动降级为静态等距网格底纹。
// 4. reduced-motion：useGlCanvas 内置 prefers-reduced-motion 探测，命中即不建 GL、渲染静态 fallback。

// GLSL ES 3.00（#version 300 es 必须是首行）：ogl Renderer 默认创建 WebGL2 上下文，
// 而 WebGL2 下 ES 1.00 shader 不能用 fwidth（OES_standard_derivatives 扩展在 WebGL2
// 不存在，导数函数仅在 ES 3.00 shader 中是核心函数）。fragment 用了 fwidth 做屏幕
// 空间抗锯齿格线，故全套升 300 es（in/out + 显式 fragColor），与 meta-balls 同模式。
const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 片元 shader：移植自原版 GridScan.frag 的核心两段——
//   ① 透视射线投射打到四面网格平面，算出格线 mask（含 dashed/dotted 变体 + 距离衰减 fade）
//   ② 沿 z 轴推进的扫描带：高斯光带 exp(-dz²/σ²) × 相位窗口，叠加更宽的 aura 项近似 bloom
// 删除：MAX_SCANS 点击爆发数组、bloom/chroma 后期、人脸 uniform。保留 uSkew/uTilt 由鼠标驱动。
const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec3  iResolution;
uniform float iTime;
uniform vec2  uSkew;
uniform float uTilt;
uniform float uLineThickness;
uniform vec3  uLinesColor;
uniform vec3  uScanColor;
uniform float uGridScale;
uniform float uLineStyle;     // 0 实线 / 1 虚线 / 2 点线
uniform float uScanOpacity;
uniform float uScanDirection; // 0 forward / 1 backward / 2 pingpong
uniform float uScanDuration;
uniform float uScanDelay;
uniform float uScanSoftness;
uniform float uNoise;

float smoother01(float a, float b, float x) {
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 fragCoord = vUv * iResolution.xy;
  vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(p, 2.0));

  // 鼠标视差：tilt 绕视线滚转 + skew 横向错切
  float cR = cos(uTilt), sR = sin(uTilt);
  rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;
  vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
  rd.xy += skew * rd.z;

  float minT = 1e20;
  float gridScale = max(1e-5, uGridScale);
  vec2 gridUV = vec2(0.0);
  float hitIsY = 1.0;

  // 四面平面：i<2 → 水平面(y=±0.2)，i>=2 → 竖直面(x=±0.5)
  for (int i = 0; i < 4; i++) {
    float isY = float(i < 2);
    float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
    float num = pos;
    float den = isY * rd.y + (1.0 - isY) * rd.x;
    float t = num / den;
    vec3 h = ro + rd * t;
    bool use = t > 0.0 && t < minT;
    gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
    minT = use ? t : minT;
    hitIsY = use ? isY : hitIsY;
  }

  vec3 hit = ro + rd * minT;
  float dist = length(hit - ro);

  float fx = fract(gridUV.x);
  float fy = fract(gridUV.y);
  float ax = min(fx, 1.0 - fx);
  float ay = min(fy, 1.0 - fy);
  float wx = fwidth(gridUV.x);
  float wy = fwidth(gridUV.y);
  float halfPx = max(0.0, uLineThickness) * 0.5;
  float tx = halfPx * wx;
  float ty = halfPx * wy;
  float lineX = 1.0 - smoothstep(tx, tx + wx, ax);
  float lineY = 1.0 - smoothstep(ty, ty + wy, ay);

  if (uLineStyle > 0.5) {
    if (uLineStyle < 1.5) {
      // dashed
      float dashRepeat = 4.0;
      float dashDuty = 0.5;
      lineX *= step(fract(gridUV.y * dashRepeat), dashDuty);
      lineY *= step(fract(gridUV.x * dashRepeat), dashDuty);
    } else {
      // dotted
      float dotRepeat = 6.0;
      float dotWidth = 0.18;
      float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
      float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
      lineX *= 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
      lineY *= 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
    }
  }

  float lineMask = max(lineX, lineY);
  float fade = exp(-dist * 2.0);

  // ── 扫描带：沿 z 推进的高斯光脉冲 ──
  float dur = max(0.05, uScanDuration);
  float del = max(0.0, uScanDelay);
  float scanZMax = 2.0;
  float sigma = max(0.001, 0.18 * max(0.1, uScanSoftness));
  float sigmaA = sigma * 2.0;

  float cycle = dur + del;
  float tCycle = mod(iTime, cycle);
  float phase = clamp((tCycle - del) / dur, 0.0, 1.0);
  if (uScanDirection > 0.5 && uScanDirection < 1.5) {
    phase = 1.0 - phase;
  } else if (uScanDirection > 1.5) {
    float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
    phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
  }

  float scanZ = phase * scanZMax;
  float dz = abs(hit.z - scanZ);
  float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
  float taper = 0.45;
  float phaseWindow = smoother01(0.0, taper, phase) * (1.0 - smoother01(1.0 - taper, 1.0, phase));
  float op = clamp(uScanOpacity, 0.0, 1.0);
  float pulse = lineBand * phaseWindow * op;
  // aura：更宽的高斯近似 bloom 光晕
  float aura = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA)) * 0.25 * phaseWindow * op;

  vec3 gridCol = uLinesColor * lineMask * fade;
  vec3 scanCol = uScanColor * (pulse + aura);
  vec3 color = gridCol + scanCol;

  // 细微数字噪点
  float n = fract(sin(dot(gl_FragCoord.xy + vec2(iTime * 123.4), vec2(12.9898, 78.233))) * 43758.5453123);
  color += (n - 0.5) * uNoise;
  color = clamp(color, 0.0, 1.0);

  float alpha = clamp(max(lineMask * fade, pulse + aura), 0.0, 1.0);
  fragColor = vec4(color, alpha);
}
`.trim();

// CSS 颜色 → [r,g,b]（0–1）：离屏 1×1 canvas 让浏览器负责一切颜色空间转换。
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

// 从已挂载 canvas 的计算样式里取 token 当前主题值。
function resolveToken(
  canvas: HTMLCanvasElement,
  varName: string,
  fallback: [number, number, number],
): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  return cssColorToRgb01(raw);
}

function styleToCode(s: string): number {
  return s === "dashed" ? 1 : s === "dotted" ? 2 : 0;
}
function dirToCode(d: string): number {
  return d === "backward" ? 1 : d === "pingpong" ? 2 : 0;
}

/**
 * GridScan — 透视扫描网格 WebGL 背景。
 *
 * 移植自 react-bits GridScan 的核心视觉（透视射线网格 + 纵深扫描脉冲）。
 * 瑚琏化：去 three.js / postprocessing / face-api.js 三重依赖，核心 shader 落 ogl；
 * 颜色吃 `--color-border` / `--color-primary` token；reduced-motion / 无 WebGL
 * 自动降级为静态等距网格底纹。
 *
 * 用法：放在 `relative` 暗色容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden bg-neutral-950">
 *   <GridScan scanDirection="pingpong" />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function GridScan({
  linesColor,
  scanColor,
  gridScale = 0.1,
  lineThickness = 1,
  lineStyle = "solid",
  scanOpacity = 0.45,
  scanDirection = "pingpong",
  scanDuration = 2,
  scanDelay = 2,
  scanSoftness = 2,
  noiseIntensity = 0.01,
  parallax = true,
  className,
  children,
  fallback,
}: GridScanProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2, Vec3 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      // shader 为 GLSL ES 3.00，依赖 ogl 默认的 WebGL2 上下文（fwidth 在 300 es 是核心函数）
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      const [lr, lg, lb] = linesColor
        ? cssColorToRgb01(linesColor)
        : resolveToken(canvas, "--color-border", [0.3, 0.3, 0.35]);
      const [sr, sg, sb] = scanColor
        ? cssColorToRgb01(scanColor)
        : resolveToken(canvas, "--color-primary", [0.5, 0.6, 1.0]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iResolution: {
            value: new Vec3(canvas.clientWidth, canvas.clientHeight, dpr),
          },
          iTime: { value: 0 },
          uSkew: { value: new Vec2(0, 0) },
          uTilt: { value: 0 },
          uLineThickness: { value: lineThickness },
          uLinesColor: { value: new Color(lr, lg, lb) },
          uScanColor: { value: new Color(sr, sg, sb) },
          uGridScale: { value: gridScale },
          uLineStyle: { value: styleToCode(lineStyle) },
          uScanOpacity: { value: scanOpacity },
          uScanDirection: { value: dirToCode(scanDirection) },
          uScanDuration: { value: scanDuration },
          uScanDelay: { value: scanDelay },
          uScanSoftness: { value: scanSoftness },
          uNoise: { value: noiseIntensity },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标视差：目标值 + 阻尼追逐，离开时回归 0
      let targetX = 0;
      let targetY = 0;
      let curX = 0;
      let curY = 0;
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };
      const onLeave = () => {
        targetX = 0;
        targetY = 0;
      };
      const host = canvas.parentElement ?? canvas;
      if (parallax) {
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
      }

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        const res = program.uniforms.iResolution!.value as { set: (x: number, y: number, z: number) => void };
        res.set(w || 1, h || 1, dpr);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          // 阻尼插值（每帧逼近 12%）
          curX += (targetX - curX) * 0.08;
          curY += (targetY - curY) * 0.08;
          const skew = program.uniforms.uSkew!.value as { set: (x: number, y: number) => void };
          skew.set(curX * 0.15, -curY * 0.15);
          program.uniforms.uTilt!.value = curX * 0.18;
          program.uniforms.iTime!.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (parallax) {
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerleave", onLeave);
          }
          program.remove?.();
        },
      };
    },
    [
      linesColor,
      scanColor,
      gridScale,
      lineThickness,
      lineStyle,
      scanOpacity,
      scanDirection,
      scanDuration,
      scanDelay,
      scanSoftness,
      noiseIntensity,
      parallax,
    ],
  );

  // reduced-motion / 无 WebGL：静态等距网格底纹（双向 repeating-linear-gradient 交叉成网）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:repeating-linear-gradient(0deg,var(--color-border)_0,var(--color-border)_1px,transparent_1px,transparent_28px),repeating-linear-gradient(90deg,var(--color-border)_0,var(--color-border)_1px,transparent_1px,transparent_28px)]",
          "opacity-40",
          className,
        )}
        aria-hidden
      >
        {fallback}
        {children != null && (
          <div className="pointer-events-auto relative z-10 h-full w-full">
            {children}
          </div>
        )}
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
    >
      {children != null && (
        <div className="pointer-events-auto relative z-10 h-full w-full">
          {children}
        </div>
      )}
    </div>
  );
}
