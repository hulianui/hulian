"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { ShapeBlurProps, ShapeBlurVariation } from "./shape-blur.types";

// 吸取自 React Bits ShapeBlur：一块全屏 SDF 形状（圆角矩形/圆/圆环/三角），
// 鼠标靠近时一颗带阻尼跟随的柔光圆"擦亮"形状边缘，形成模糊揭示的悬浮高光。
// 瑚琏化：① Three.js → ogl（懒加载、零基础依赖、StrictMode 安全 mount，复用 useGlCanvas）；
// ② 形状色吃 `--color-foreground` token（明暗自适应），替原版写死的纯白；
// ③ 鼠标阻尼缓动从 THREE.MathUtils.damp 改为等价的指数衰减（performance.now 自算 dt）；
// ④ reduced-motion / 无 WebGL 自动降级为静态径向光晕 fallback（DOM 始终在位，不条件卸载内容）；
// ⑤ RSC 友好：唯一 "use client" 在顶部，全部副作用收敛进 useGlCanvas。

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader（ogl Triangle 已覆盖整个 clip-space，无需投影矩阵）
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
// 片元 shader —— 移植自 react-bits ShapeBlur 原版 GLSL。
// 移植要点（Three.js → OGL）：
//   ① 去掉 Three.js 内建 varying v_texcoord（原版基于 gl_FragCoord，未真正用 uv）；
//      coord() 直接吃 gl_FragCoord.xy + u_resolution，与几何体无关，故全屏三角照样工作。
//   ② #extension GL_OES_standard_derivatives：WebGL2 下 dFdx/dFdy 为核心能力，
//      该指令在 WebGL2 中无害；WebGL1 下启用导数扩展，最大化兼容。
//   ③ VAR 分支保留原版 0..3 四形态，由 JS 端按 variation 写入 #define。
//   ④ 颜色不再写死 vec3(1.0)，改吃 u_color uniform（来自瑚琏 token）。
// ---------------------------------------------------------------------------
function buildFragment(varIndex: number): string {
  return /* glsl */ `
#extension GL_OES_standard_derivatives : enable
precision highp float;

varying vec2 vUv;

uniform vec2  u_mouse;
uniform vec2  u_resolution;
uniform float u_pixelRatio;

uniform float u_shapeSize;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;
uniform vec3  u_color;

#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.2831853071795864769252867665590
#define VAR ${varIndex}

vec2 coord(in vec2 p) {
  p = p / u_resolution.xy;
  if (u_resolution.x > u_resolution.y) {
    p.x *= u_resolution.x / u_resolution.y;
    p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
  } else {
    p.y *= u_resolution.y / u_resolution.x;
    p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
  }
  p -= 0.5;
  p *= vec2(-1.0, 1.0);
  return p;
}

#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse * u_pixelRatio)

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}
float sdCircle(in vec2 st, in vec2 center) {
  return length(st - center) * 2.0;
}
float sdPoly(in vec2 p, in float w, in int sides) {
  float a = atan(p.x, p.y) + PI;
  float r = TWO_PI / float(sides);
  float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));
  return d * 2.0 - w;
}

float aastep(float threshold, float value) {
  float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
  return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
float fill(in float x) { return 1.0 - aastep(0.0, x); }
float fill(float x, float size, float edge) {
  return 1.0 - smoothstep(size - edge, size + edge, x);
}
float strokeAA(float x, float size, float w, float edge) {
  float afwidth = length(vec2(dFdx(x), dFdy(x))) * 0.70710678;
  float d = smoothstep(size - edge - afwidth, size + edge + afwidth, x + w * 0.5)
          - smoothstep(size - edge - afwidth, size + edge + afwidth, x - w * 0.5);
  return clamp(d, 0.0, 1.0);
}

void main() {
  vec2 st = st0 + 0.5;
  vec2 posMouse = mx * vec2(1.0, -1.0) + 0.5;

  float size = u_shapeSize;
  float roundness = u_roundness;
  float borderSize = u_borderSize;
  float circleSize = u_circleSize;
  float circleEdge = u_circleEdge;

  float sdfCircle = fill(
    sdCircle(st, posMouse),
    circleSize,
    circleEdge
  );

  float sdf;
  if (VAR == 0) {
    sdf = sdRoundRect(st, vec2(size), roundness);
    sdf = strokeAA(sdf, 0.0, borderSize, sdfCircle) * 4.0;
  } else if (VAR == 1) {
    sdf = sdCircle(st, vec2(0.5));
    sdf = fill(sdf, 0.6, sdfCircle) * 1.2;
  } else if (VAR == 2) {
    sdf = sdCircle(st, vec2(0.5));
    sdf = strokeAA(sdf, 0.58, 0.02, sdfCircle) * 4.0;
  } else {
    sdf = sdPoly(st - vec2(0.5, 0.45), 0.3, 3);
    sdf = fill(sdf, 0.05, sdfCircle) * 1.4;
  }

  float alpha = clamp(sdf, 0.0, 1.0);
  gl_FragColor = vec4(u_color, alpha);
}
`.trim();
}

// ---------------------------------------------------------------------------
// variation 名 → 着色器分支序号
// ---------------------------------------------------------------------------
const VAR_INDEX: Record<ShapeBlurVariation, number> = {
  "round-rect": 0,
  "circle-fill": 1,
  "circle-stroke": 2,
  triangle: 3,
};

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）。用离屏 1×1 canvas 2D context 让浏览器解析任意格式。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.92, 0.92, 0.94];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.92, 0.92, 0.94];
  }
}

// 从容器计算样式读取 --color-foreground token（挂载时已在 DOM，可拿当前主题值）。
function resolveForegroundToken(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--color-foreground").trim();
  if (!raw) return [0.92, 0.92, 0.94];
  return cssColorToRgb01(raw);
}

/**
 * ShapeBlur — 鼠标揭示的模糊形状高光（WebGL）。
 *
 * 基于 react-bits ShapeBlur 原版 SDF 着色器：一颗带阻尼跟随鼠标的柔光圆
 * 逐渐"擦亮"圆角矩形 / 圆 / 圆环 / 三角形的边缘，形成柔和的悬浮高光。
 * 瑚琏化：default 颜色吃 `--color-foreground` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为静态径向光晕。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-64 overflow-hidden bg-neutral-950">
 *   <ShapeBlur variation="round-rect" />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function ShapeBlur({
  variation = "round-rect",
  shapeSize = 1.2,
  roundness = 0.4,
  borderSize = 0.05,
  circleSize = 0.3,
  circleEdge = 0.5,
  color,
  damping = 8,
  className,
  fallback,
}: ShapeBlurProps) {
  const varIndex = VAR_INDEX[variation] ?? 0;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;
      // 透明清屏，让形状高光叠在容器底色上
      gl.clearColor(0, 0, 0, 0);

      // 形状色：显式 color 优先，否则吃容器的 --color-foreground token
      const host = canvas.parentElement ?? canvas;
      const [r, g, b] = color
        ? cssColorToRgb01(color)
        : resolveForegroundToken(host as HTMLElement);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: buildFragment(varIndex),
        transparent: true,
        uniforms: {
          u_mouse: { value: new Vec2(0, 0) },
          u_resolution: { value: new Vec2(1, 1) },
          u_pixelRatio: { value: dpr },
          u_shapeSize: { value: shapeSize },
          u_roundness: { value: roundness },
          u_borderSize: { value: borderSize },
          u_circleSize: { value: circleSize },
          u_circleEdge: { value: circleEdge },
          u_color: { value: new Color(r, g, b) },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 目标鼠标位置（CSS 像素，相对容器左上角）与阻尼后的实际位置
      let mouseX = 0;
      let mouseY = 0;
      let dampX = 0;
      let dampY = 0;
      let lastT = 0;

      const onPointerMove = (e: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      };
      // 监听整页指针，保证鼠标在容器外靠近时光晕也能平滑滑入
      document.addEventListener("pointermove", onPointerMove);

      const resize = (w: number, h: number) => {
        const cw = w || 1;
        const ch = h || 1;
        renderer.setSize(cw, ch);
        // u_resolution 用物理像素（× dpr），与 gl_FragCoord 对齐
        program.uniforms.u_resolution!.value.set(cw * dpr, ch * dpr);
      };
      resize(host.clientWidth, host.clientHeight);

      return {
        render(t: number) {
          // 临界阻尼缓动（指数衰减）：等价 THREE.MathUtils.damp(cur, tgt, λ, dt)
          const now = t * 0.001;
          const dt = lastT === 0 ? 0 : now - lastT;
          lastT = now;
          const k = 1 - Math.exp(-damping * dt);
          dampX += (mouseX - dampX) * k;
          dampY += (mouseY - dampY) * k;

          program.uniforms.u_mouse!.value.set(dampX, dampY);
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          document.removeEventListener("pointermove", onPointerMove);
          program.remove?.();
        },
      };
    },
    [
      varIndex,
      shapeSize,
      roundness,
      borderSize,
      circleSize,
      circleEdge,
      color,
      damping,
    ],
  );

  // ---------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：渲染静态径向光晕 fallback（吃 foreground token）
  // ---------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_50%_50%_at_50%_50%,color-mix(in_oklch,var(--color-foreground)_18%,transparent)_0%,transparent_70%)]",
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
