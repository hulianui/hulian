"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { FluidGlassProps } from "./fluid-glass.types";

// 吸取自 React Bits FluidGlass：一块跟随指针的玻璃透镜，对其后方内容做折射 / 放大 /
// 边缘色散（原版用 three.js + @react-three/fiber/drei 的 MeshTransmissionMaterial 实时
// 折射 GLTF 透镜网格 + FBO 离屏渲染场景）。
//
// 瑚琏化要点：
// 1. 去全部禁用依赖（three / @react-three/fiber / @react-three/drei / maath / GLTF 资源）。
//    用 ogl 单一片元 shader 重构：程序化生成流动渐变背景（chart token 三色 blob 漂浮），
//    再在指针处用一个圆形透镜对 UV 做折射偏移 + 放大 + RGB 分光 + 菲涅尔边缘高光，
//    在视觉上还原“流体玻璃”质感，无需任何 3D 网格 / 模型文件。
// 2. 颜色全吃 chart token（默认 chart-1/2/4，自动明暗适配），用离屏 canvas 解析任意 CSS 颜色。
// 3. RSC / SSR 安全：GL 仅在客户端 effect 内构建（useGlCanvas 懒 import("ogl")）。
// 4. reduced-motion / 无 WebGL：降级为静态多色径向渐变 fallback，DOM 结构保持一致。
// 5. 指针通过 ref 平滑跟随（每帧 lerp），不进 deps，不重建 GL context。

// ---------------------------------------------------------------------------
// 全屏三角顶点 shader（OGL Triangle 内建 uv，clip-space 直出，无需投影矩阵）
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
// 流体玻璃片元 shader
// background(): 三个缓慢漂浮的色块 blob 叠加，构成被折射的“内容”底图。
// 透镜: 以 uLens 为圆心、uSize 为半径的圆，圆内对采样坐标做向心折射偏移 + 放大，
//       并按 uDispersion 对 R/G/B 三通道施加不同折射量产生彩边；
//       叠加菲涅尔边缘亮环 + 镜面高光点，模拟玻璃凸透镜。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uRes;        // 容器像素尺寸（用于校正长宽比）
uniform vec2  uLens;       // 透镜中心，0..1 UV 空间
uniform float uSize;       // 透镜半径（短边比例）
uniform float uRefraction; // 折射强度
uniform float uDispersion; // 色散强度
uniform vec3  uC0;
uniform vec3  uC1;
uniform vec3  uC2;

// 长宽比校正：把 uv 映射到“以短边为单位”的等比空间，圆才不被拉成椭圆
vec2 aspect(vec2 p) {
  float a = uRes.x / max(uRes.y, 1.0);
  return vec2((p.x - 0.5) * a, p.y - 0.5);
}

// 程序化流动背景：三色 blob 缓慢漂浮 + 一层底色渐变
vec3 background(vec2 uv) {
  vec2 p = uv;
  float t = uTime;

  vec2 b0 = vec2(0.30 + 0.18 * sin(t * 0.40), 0.32 + 0.16 * cos(t * 0.33));
  vec2 b1 = vec2(0.70 + 0.16 * cos(t * 0.31), 0.40 + 0.18 * sin(t * 0.27));
  vec2 b2 = vec2(0.50 + 0.20 * sin(t * 0.23 + 1.7), 0.74 + 0.14 * cos(t * 0.37));

  float d0 = smoothstep(0.55, 0.0, distance(p, b0));
  float d1 = smoothstep(0.55, 0.0, distance(p, b1));
  float d2 = smoothstep(0.55, 0.0, distance(p, b2));

  // 底色：左下 → 右上 的两色渐变
  vec3 base = mix(uC0 * 0.55, uC2 * 0.55, clamp(p.x * 0.6 + p.y * 0.4, 0.0, 1.0));
  vec3 col = base;
  col += uC0 * d0 * 0.9;
  col += uC1 * d1 * 0.9;
  col += uC2 * d2 * 0.9;
  return col;
}

void main() {
  vec2 uv = vUv;

  vec2 q  = aspect(uv);
  vec2 lc = aspect(uLens);
  vec2 rel = q - lc;
  float dist = length(rel);

  // 圆内归一化半径 0..1
  float r = dist / max(uSize, 0.0001);

  // 透镜遮罩（边缘软过渡，避免锯齿圈）
  float lensMask = 1.0 - smoothstep(0.92, 1.0, r);

  // 折射偏移：圆内随半径增大向心拉伸（凸透镜中心放大、边缘压缩）
  // bend 在中心为 0、边缘最强，方向沿 -rel（把外部内容吸入透镜）
  float bend = uRefraction * (r * r) * lensMask;
  vec2 dir = dist > 0.0001 ? rel / dist : vec2(0.0);

  // 基础折射后的采样 uv（注意：在 aspect 空间偏移，再换回 uv 空间）
  float a = uRes.x / max(uRes.y, 1.0);
  vec2 baseOffset = -dir * bend * 0.5;
  vec2 sampleUv = uv + vec2(baseOffset.x / max(a, 0.0001), baseOffset.y);

  // 色散：R/G/B 三通道用略不同的折射量，边缘越靠外彩边越明显
  float disp = uDispersion * bend * 0.06;
  vec2 dOff = vec2(dir.x / max(a, 0.0001), dir.y);
  float rC = background(sampleUv - dOff * disp).r;
  float gC = background(sampleUv).g;
  float bC = background(sampleUv + dOff * disp).b;

  vec3 outside = background(uv);
  vec3 refr = vec3(rC, gC, bC);

  // 圆内用折射色，圆外用原始背景
  vec3 col = mix(outside, refr, lensMask);

  // 透镜整体提亮一点（玻璃透光感）
  col += refr * lensMask * 0.10;

  // 菲涅尔边缘亮环：靠近边缘 r→1 时高光增强
  float fresnel = smoothstep(0.80, 1.0, r) * lensMask;
  col += vec3(1.0) * fresnel * 0.35;

  // 镜面高光点：透镜左上方一个柔光斑
  vec2 hl = lc + vec2(-uSize * 0.35, uSize * 0.35);
  float spec = smoothstep(uSize * 0.30, 0.0, distance(q, hl)) * lensMask;
  col += vec3(1.0) * spec * 0.45;

  gl_FragColor = vec4(col, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0..1），离屏 canvas 解析，浏览器负责色彩空间转换
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.4, 0.45, 0.6];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.4, 0.45, 0.6];
  }
}

// 从已挂载 canvas 计算样式读取 chart token（拿到当前主题真实值）
function resolveToken(
  canvas: HTMLCanvasElement,
  name: string,
  fb: [number, number, number],
): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue(name).trim();
  if (!raw) return fb;
  return cssColorToRgb01(raw);
}

/**
 * FluidGlass — 跟随指针的流体玻璃折射背景（ogl）。
 *
 * 程序化流动渐变底图 + 圆形玻璃透镜实时折射 / 放大 / 边缘色散 / 菲涅尔高光，
 * 重构自 react-bits FluidGlass（原 three.js MeshTransmissionMaterial），零 3D 依赖。
 * 颜色吃 chart token（明暗自适应）；reduced-motion / 无 WebGL 自动降级为静态渐变。
 *
 * 用法：放在 `relative` 容器里即可，组件自带 `absolute inset-0`。
 *
 * @example
 * <div className="relative h-80 overflow-hidden rounded-xl">
 *   <FluidGlass />
 *   <div className="relative z-10 p-6 text-white">内容</div>
 * </div>
 */
export function FluidGlass({
  size = 0.26,
  refraction = 0.5,
  dispersion = 0.3,
  speed = 1,
  colors,
  followPointer = true,
  className,
  children,
  style,
}: FluidGlassProps) {
  // 运行时同步值（不进 deps，不重建 GL context）
  const sizeRef = useRef(size);
  const refractionRef = useRef(refraction);
  const dispersionRef = useRef(dispersion);
  const speedRef = useRef(speed);
  const followRef = useRef(followPointer);
  sizeRef.current = size;
  refractionRef.current = refraction;
  dispersionRef.current = dispersion;
  speedRef.current = speed;
  followRef.current = followPointer;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: false, dpr });
      const gl = renderer.gl;

      // 解析三色：显式 colors 优先，否则读 chart token
      const c0 = colors?.[0]
        ? cssColorToRgb01(colors[0])
        : resolveToken(canvas, "--color-chart-1", [0.39, 0.4, 0.95]);
      const c1 = colors?.[1]
        ? cssColorToRgb01(colors[1])
        : resolveToken(canvas, "--color-chart-2", [0.55, 0.36, 0.96]);
      const c2 = colors?.[2]
        ? cssColorToRgb01(colors[2])
        : resolveToken(canvas, "--color-chart-4", [0.2, 0.7, 0.85]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new Vec2(1, 1) },
          uLens: { value: new Vec2(0.5, 0.5) },
          uSize: { value: size },
          uRefraction: { value: refraction },
          uDispersion: { value: dispersion },
          uC0: { value: new Vec3(c0[0], c0[1], c0[2]) },
          uC1: { value: new Vec3(c1[0], c1[1], c1[2]) },
          uC2: { value: new Vec3(c2[0], c2[1], c2[2]) },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 指针目标（UV 空间，0..1，y 已翻转为“上为 1”以匹配 shader）+ 当前平滑值
      const target = { x: 0.5, y: 0.5 };
      const current = { x: 0.5, y: 0.5 };

      // 指针事件挂在容器（canvas 自身 pointer-events-none 不会收事件，
      // 且容器范围覆盖了上层内容，能在整片区域跟随指针）。
      const surface: HTMLElement = canvas.parentElement ?? canvas;
      const onPointerMove = (e: PointerEvent) => {
        if (!followRef.current) return;
        const rect = surface.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        target.x = (e.clientX - rect.left) / rect.width;
        // shader uv y 自下而上，DOM y 自上而下 → 翻转
        target.y = 1 - (e.clientY - rect.top) / rect.height;
      };
      const onPointerLeave = () => {
        target.x = 0.5;
        target.y = 0.5;
      };
      surface.addEventListener("pointermove", onPointerMove);
      surface.addEventListener("pointerleave", onPointerLeave);

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uRes!.value.set(
          (w || 1) * dpr,
          (h || 1) * dpr,
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      let last = 0;
      let acc = 0; // 背景时间累加（受 speed 调制，speed=0 时冻结）

      return {
        render(t: number) {
          const dt = last ? Math.min((t - last) * 0.001, 0.1) : 0;
          last = t;
          acc += dt * speedRef.current;

          // 不跟随指针时透镜在中心做缓慢漂移
          if (!followRef.current) {
            target.x = 0.5 + 0.18 * Math.sin(acc * 0.5);
            target.y = 0.5 + 0.12 * Math.cos(acc * 0.4);
          }

          // 平滑跟随
          current.x += (target.x - current.x) * 0.12;
          current.y += (target.y - current.y) * 0.12;

          program.uniforms.uTime!.value = acc;
          program.uniforms.uLens!.value.set(current.x, current.y);
          program.uniforms.uSize!.value = sizeRef.current;
          program.uniforms.uRefraction!.value = refractionRef.current;
          program.uniforms.uDispersion!.value = dispersionRef.current;

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          surface.removeEventListener("pointermove", onPointerMove);
          surface.removeEventListener("pointerleave", onPointerLeave);
          program.remove?.();
        },
      };
    },
    // 仅这些 prop 变化时重建（颜色须重解析）；size/refraction/dispersion/speed/follow 走 ref
    [colors],
  );

  // ---------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：静态多色径向渐变 fallback（DOM 结构与正常态一致）
  // ---------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn("relative overflow-hidden", className)}
        style={style}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0",
            "[background:radial-gradient(circle_at_30%_30%,var(--color-chart-1)_0%,transparent_45%),radial-gradient(circle_at_72%_42%,var(--color-chart-2)_0%,transparent_45%),radial-gradient(circle_at_50%_78%,var(--color-chart-4)_0%,transparent_50%)]",
            "bg-surface",
          )}
        />
        {children != null && (
          <div className="relative z-10">{children}</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={style}>
      <div
        ref={ref}
        aria-hidden
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
      {children != null && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
