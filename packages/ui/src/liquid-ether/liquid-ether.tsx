"use client";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LiquidEtherProps } from "./liquid-ether.types";

// 吸取自 React Bits LiquidEther：以鼠标力场驱动的不可压缩流体（Navier-Stokes 平流 + 黏性扩散 +
// 泊松压力求解，多 FBO ping-pong），输出调色板着色的翻涌液态色域，并带自动演示巡游光标。
//
// 瑚琏化要点：
// 1. 去 three.js 依赖。原版整条 GPU 流体管线绑死 three.js（RawShaderMaterial + WebGLRenderTarget
//    乒乓 6 个 FBO），库内仅允许 ogl。故以「单 pass ogl 片元 shader」重构同一观感：用域扭曲
//    (domain warp) + metaball 场模拟液体团块的翻涌流动，光标在 CPU 侧维护一个被弹簧追踪的力点
//    注入 shader，复刻「鼠标搅动液面」的核心交互，而非逐帧解不可压缩方程。属再创作（approximated）。
// 2. 颜色全吃 chart token（默认 chart-1/2/4），明暗自适应，替原版写死 #5227FF/#FF9FFC/#B497CF。
// 3. autoDemo 巡游光标：CPU 侧 Lissajous 轨迹生成虚拟力点，复刻原版 AutoDriver；真实指针移动时
//    平滑接管（弹簧追踪），停手后回落自动巡游。
// 4. RSC / StrictMode 安全：复用 useGlCanvas（懒 import ogl、每次挂载新建 canvas 避免 loseContext
//    毒化、离屏暂停、ResizeObserver 自适应）。
// 5. reduced-motion / 无 WebGL：自动降级为静态多点 radial-gradient 液面（彩色而非消失）。
// 6. 指针监听挂在容器上（pointer-events 由根容器接管），卸载随 canvas 一并清理。

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
];

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader（OGL Triangle 已在 clip-space）
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
// 液态色域片元 shader
// 思路：多个随时间漂移的「液滴中心」叠加成一个 metaball 标量场 field，
// 经域扭曲（fbm 噪声偏移）后产生翻涌感；field 映射到 0..1 沿调色板取色。
// 指针力点 uMouse 额外吸引附近液滴，制造跟手搅动。无任何流体方程，纯程序化。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;       // 画布像素尺寸（用于保持宽高比）
uniform float uScale;
uniform vec2  uMouse;     // 归一化 [0,1] 指针/巡游力点
uniform float uMouseForce;
uniform vec3  uC0;
uniform vec3  uC1;
uniform vec3  uC2;

// --- 值噪声 + fbm（域扭曲用）---
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main() {
  // 等比 uv：以较长边归一，避免拉伸
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  uv.x *= aspect;

  float t = uTime;

  // 域扭曲：用低频 fbm 偏移采样坐标，制造液体翻涌
  vec2 warp = vec2(
    fbm(uv * uScale * 1.5 + vec2(0.0, t * 0.15)),
    fbm(uv * uScale * 1.5 + vec2(t * 0.12, 0.0))
  );
  vec2 p = uv + (warp - 0.5) * 0.6;

  // metaball 场：4 个漂移液滴中心
  float field = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 c = vec2(
      0.5 * aspect + 0.35 * aspect * sin(t * (0.25 + fi * 0.07) + fi * 1.7),
      0.5 + 0.32 * cos(t * (0.21 + fi * 0.06) + fi * 2.3)
    );
    float d = length(p - c);
    field += 0.16 / (d * d + 0.02);
  }

  // 指针力点：在归一光标附近增加一个液滴，强度由 uMouseForce 控制
  vec2 m = uMouse;
  m.x *= aspect;
  float dm = length(p - m);
  field += (0.18 * uMouseForce) / (dm * dm + 0.015);

  // 场值归一到 0..1
  float v = clamp(field * 0.35, 0.0, 1.0);
  v = smoothstep(0.15, 0.95, v);

  // 沿调色板取色：分两段 mix
  vec3 col;
  if (v < 0.5) {
    col = mix(uC0, uC1, v * 2.0);
  } else {
    col = mix(uC1, uC2, (v - 0.5) * 2.0);
  }

  // alpha 随场值渐隐，边缘透明，便于叠加在内容背景上
  float alpha = smoothstep(0.08, 0.6, v);
  gl_FragColor = vec4(col, alpha);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0–1）。离屏 canvas 2D 作解析器（同 Silk 策略）。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.32, 0.15, 1]; // 兜底接近原版 #5227FF
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.32, 0.15, 1];
  }
}

// 把 colors prop（可能含 CSS 变量）解析为 3 段；不足补齐、超出取前 3。
function resolvePalette(
  canvas: HTMLCanvasElement,
  colors: string[],
): [[number, number, number], [number, number, number], [number, number, number]] {
  const cs = getComputedStyle(canvas);
  const toRgb = (raw: string): [number, number, number] => {
    let v = raw.trim();
    // var(--token) → 取计算值
    const m = v.match(/^var\((--[^,)]+)\)$/);
    if (m) v = cs.getPropertyValue(m[1]!).trim() || raw;
    return cssColorToRgb01(v);
  };
  const list = colors.length > 0 ? colors : DEFAULT_COLORS;
  const c0 = toRgb(list[0]!);
  const c1 = toRgb(list[1] ?? list[0]!);
  const c2 = toRgb(list[2] ?? list[1] ?? list[0]!);
  return [c0, c1, c2];
}

/**
 * LiquidEther — 鼠标驱动的液态色域 WebGL 背景。
 *
 * 再创作自 React Bits LiquidEther（原版为 three.js 不可压缩流体仿真）。瑚琏以单 pass ogl
 * shader（域扭曲 + metaball 场）复刻翻涌液体观感与「指针搅动 + 自动巡游」交互；
 * 去 three.js、颜色吃 chart token、reduced-motion / 无 WebGL 自动降级为静态多点渐变液面。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0`。
 *
 * @example
 * <div className="relative h-96 overflow-hidden bg-neutral-950">
 *   <LiquidEther speed={0.6} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function LiquidEther({
  colors = DEFAULT_COLORS,
  speed = 0.5,
  scale = 1,
  mouseForce = 1,
  autoDemo = true,
  opacity = 1,
  className,
  style,
  fallback,
}: LiquidEtherProps) {
  // 指针归一坐标 + 是否有真实交互（CPU 侧弹簧追踪在 render 内做）
  const pointer = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  });
  const colorsKey = colors.join("|");

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const [c0, c1, c2] = resolvePalette(canvas, colors);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new Vec2(1, 1) },
          uScale: { value: scale },
          uMouse: { value: new Vec2(0.5, 0.5) },
          uMouseForce: { value: 0 },
          uC0: { value: new Vec3(c0[0], c0[1], c0[2]) },
          uC1: { value: new Vec3(c1[0], c1[1], c1[2]) },
          uC2: { value: new Vec3(c2[0], c2[1], c2[2]) },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        const W = w || 1;
        const H = h || 1;
        renderer.setSize(W, H);
        program.uniforms.uRes!.value.set(W, H);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 平滑追踪的力点（始终在 0..1），real 指针停手后回归自动巡游
      let fx = 0.5;
      let fy = 0.5;

      return {
        render(time: number) {
          const t = time * 0.001;
          program.uniforms.uTime!.value = t * speed;

          // 目标力点：有真实指针用指针；否则用 Lissajous 巡游（autoDemo 开时）
          let tx = 0.5;
          let ty = 0.5;
          let force = 0;
          if (pointer.current.active) {
            tx = pointer.current.x;
            ty = pointer.current.y;
            force = mouseForce;
          } else if (autoDemo) {
            tx = 0.5 + 0.32 * Math.sin(t * 0.4);
            ty = 0.5 + 0.28 * Math.cos(t * 0.33);
            force = mouseForce * 0.7;
          }
          // 弹簧追踪，避免突跳
          fx += (tx - fx) * 0.06;
          fy += (ty - fy) * 0.06;
          program.uniforms.uMouse!.value.set(fx, fy);
          program.uniforms.uMouseForce!.value = force;

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [colorsKey, speed, scale, mouseForce, autoDemo],
  );

  // 指针事件挂在容器上（容器即 ref 目标）。归一到 [0,1]，y 翻转使上为 1。
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    pointer.current.x = (e.clientX - rect.left) / rect.width;
    pointer.current.y = 1 - (e.clientY - rect.top) / rect.height;
    pointer.current.active = true;
  };
  const onPointerLeave = () => {
    pointer.current.active = false;
  };

  // ---------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：静态多点 radial-gradient 液面（彩色，不消失）
  // ---------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 z-0", className)}
        style={{
          opacity,
          background: [
            "radial-gradient(40% 50% at 30% 35%, var(--color-chart-1) 0%, transparent 60%)",
            "radial-gradient(45% 55% at 70% 60%, var(--color-chart-2) 0%, transparent 62%)",
            "radial-gradient(50% 60% at 50% 80%, var(--color-chart-4) 0%, transparent 65%)",
          ].join(", "),
          ...style,
        }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("absolute inset-0 z-0 block h-full w-full", className)}
      style={{ opacity, ...style }}
    />
  );
}
