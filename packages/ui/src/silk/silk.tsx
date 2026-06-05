"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { SilkProps } from "./silk.types";

// ---------------------------------------------------------------------------
// OGL 全屏三角顶点 shader
// OGL Triangle 几何体已在 clip-space（[-1,3]×[-1,3] 全覆盖视口），
// 不需要投影矩阵——直接 gl_Position = vec4(position, 0, 1)。
// uv 由 OGL Triangle 内建：left-bottom=(0,0)，超三角两角为(2,0)/(0,2)。
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
// 丝绸片元 shader
// 原版来自 react-bits（David H Dev）Silk 背景：
//   https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Silk/Silk.jsx
// 移植要点（Three.js → OGL）：
//   ① varying vec2 vUv 不变（OGL 顶点同名传出）
//   ② 去掉 Three.js 内建 varying vec3 vPosition（fragment 中未实际使用）
//   ③ gl_FragCoord 直接可用，无需任何修改
//   ④ 所有 uniform 名 uTime/uColor/uSpeed/uScale/uRotation/uNoiseIntensity 保持原版不变
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（各值范围 0–1）
//
// 策略：用一个离屏 1×1 canvas 的 2D context 作为颜色解析器。
// 将任意 CSS 颜色（hex / oklch / rgb / color() / CSS 变量计算后的值）赋给
// fillStyle，再通过 getImageData 读出实际 sRGB 字节值，安全转为 0..1 浮点。
// 这是最稳妥的全格式 CSS 颜色解析方案，浏览器负责所有颜色空间转换。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.48, 0.46, 0.5]; // 兜底：接近原版 #7B7481
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.48, 0.46, 0.5];
  }
}

// ---------------------------------------------------------------------------
// 从 canvas 元素的计算样式中读取 CSS 变量颜色
// 挂载时 canvas 已在 DOM 中，getComputedStyle 可拿到当前主题下的 token 值。
// ---------------------------------------------------------------------------
function resolveChartToken(canvas: HTMLCanvasElement): [number, number, number] {
  const raw = getComputedStyle(canvas)
    .getPropertyValue("--color-chart-1")
    .trim();
  if (!raw) return [0.48, 0.46, 0.5];
  return cssColorToRgb01(raw);
}

// ---------------------------------------------------------------------------
// Silk 组件
// ---------------------------------------------------------------------------

/**
 * Silk — 丝绸流动 WebGL 背景。
 *
 * 基于 react-bits Silk 原版 GLSL shader（Euler-noise 多层正弦叠加），
 * 瑚琏化：默认颜色吃 `--color-chart-1` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为 linear-gradient 静态兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Silk speed={4} scale={1.2} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Silk({
  speed = 5,
  scale = 1,
  color,
  noiseIntensity = 1.5,
  rotation = 0,
  className,
  fallback,
}: SilkProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      // 设备像素比上限 2，避免 4K 屏性能浪费
      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 解析主色：显式 color prop 优先；否则读 canvas 计算样式里的 chart-1 token
      const [r, g, b] = color ? cssColorToRgb01(color) : resolveChartToken(canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime:          { value: 0 },
          uColor:         { value: new Color(r, g, b) },
          uSpeed:         { value: speed },
          uScale:         { value: scale },
          uNoiseIntensity:{ value: noiseIntensity },
          uRotation:      { value: rotation },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          // OGL 没有全局 dispose，手动清 shader program
          program.remove?.();
        },
      };
    },
    [speed, scale, color, noiseIntensity, rotation],
  );

  // ---------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：渲染静态 linear-gradient fallback
  // 用 chart token 的三段渐变，视觉上有丝绸的层次感
  // ---------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(135deg,var(--color-chart-1)_0%,var(--color-chart-2)_40%,var(--color-chart-3)_70%,var(--color-chart-1)_100%)]",
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
