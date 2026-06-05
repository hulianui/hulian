"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { RibbonsProps } from "./ribbons.types";

// 吸取自 React Bits Ribbons：用 ogl Polyline 画多条「弹簧追随鼠标」的飘带，
// 每条折线首点用弹簧+摩擦追逐光标，后续点逐段 lerp 形成柔软拖尾，自定义顶点
// shader 把折线沿法线挤成有粗细的带状（可选沿带长渐隐 / 正弦波动特效）。
//
// 瑚琏化要点：
// 1. 颜色默认吃 chart token（--color-chart-1/2/3，明暗自适应），替原版写死的 #FC8EAC；
//    显式 colors 优先，支持 hex/oklch/rgb/var() 全格式（离屏 canvas 解析）。
// 2. 复用 useGlCanvas helper：懒 import("ogl") 代码分割、SSR 安全、StrictMode 重挂载安全
//    （每次挂载新建 canvas 规避 loseContext 毒化）、离屏暂停、ResizeObserver 自适应。
// 3. reduced-motion / 无 WebGL：自动降级为静态 chart-token 渐变 fallback（DOM 不抛）。
// 4. 鼠标/触摸监听挂在 helper 的容器 div 上，随组件卸载自动清理。

// ---------------------------------------------------------------------------
// 顶点 shader：把折线沿屏幕法线方向挤成带状（保留原版算法，uniform 名不变）
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 next;
attribute vec3 prev;
attribute vec2 uv;
attribute float side;

uniform vec2 uResolution;
uniform float uDPR;
uniform float uThickness;
uniform float uTime;
uniform float uEnableShaderEffect;
uniform float uEffectAmplitude;

varying vec2 vUV;

vec4 getPosition() {
  vec4 current = vec4(position, 1.0);
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 nextScreen = next.xy * aspect;
  vec2 prevScreen = prev.xy * aspect;
  vec2 tangent = normalize(nextScreen - prevScreen);
  vec2 normal = vec2(-tangent.y, tangent.x);
  normal /= aspect;
  normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
  float dist = length(nextScreen - prevScreen);
  normal *= smoothstep(0.0, 0.02, dist);
  float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
  float pixelWidth = current.w * pixelWidthRatio;
  normal *= pixelWidth * uThickness;
  current.xy -= normal * side;
  if (uEnableShaderEffect > 0.5) {
    current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
  }
  return current;
}

void main() {
  vUV = uv;
  gl_Position = getPosition();
}
`.trim();

// ---------------------------------------------------------------------------
// 片元 shader：纯色 + 可选沿带长渐隐
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uEnableFade;

varying vec2 vUV;

void main() {
  float fadeFactor = 1.0;
  if (uEnableFade > 0.5) {
    fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
  }
  gl_FragColor = vec4(uColor, uOpacity * fadeFactor);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0–1）：离屏 1×1 canvas 解析任意 CSS 颜色（hex/oklch/rgb/var 计算值）
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.99, 0.56, 0.67]; // 兜底接近原版 #FC8EAC
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.99, 0.56, 0.67];
  }
}

// 从容器计算样式取 chart token（挂载时已在 DOM，能拿到当前主题值）
function resolveChartTokens(el: HTMLElement): string[] {
  const cs = getComputedStyle(el);
  const out: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const raw = cs.getPropertyValue(`--color-chart-${i}`).trim();
    if (raw) out.push(raw);
  }
  return out.length ? out : ["#fc8eac"];
}

/**
 * Ribbons — 弹簧追随鼠标的飘带 WebGL 效果。
 *
 * 基于 react-bits Ribbons 原版（ogl Polyline + 自定义顶点 shader），
 * 瑚琏化：默认颜色吃 `--color-chart-1/2/3` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为静态渐变 fallback。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0` 铺满。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Ribbons enableFade enableShaderEffect />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Ribbons({
  colors,
  baseSpring = 0.03,
  baseFriction = 0.9,
  baseThickness = 30,
  offsetFactor = 0.05,
  maxAge = 500,
  pointCount = 50,
  speedMultiplier = 0.6,
  enableFade = false,
  enableShaderEffect = false,
  effectAmplitude = 2,
  className,
  fallback,
}: RibbonsProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Transform, Vec3, Color, Polyline } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      // 容器（helper 把 canvas append 到 ref 容器；监听器挂容器上）
      const container = canvas.parentElement ?? canvas;

      // 解析飘带颜色：显式 colors 优先；否则读容器计算样式里的 chart token
      const colorList =
        colors && colors.length ? colors : resolveChartTokens(container as HTMLElement);

      const scene = new Transform();
      interface Line {
        spring: number;
        friction: number;
        mouseVelocity: InstanceType<typeof Vec3>;
        mouseOffset: InstanceType<typeof Vec3>;
        points: InstanceType<typeof Vec3>[];
        polyline: InstanceType<typeof Polyline>;
      }
      const lines: Line[] = [];

      const center = (colorList.length - 1) / 2;
      colorList.forEach((css, index) => {
        const spring = baseSpring + (Math.random() - 0.5) * 0.05;
        const friction = baseFriction + (Math.random() - 0.5) * 0.05;
        const thickness = baseThickness + (Math.random() - 0.5) * 3;
        const mouseOffset = new Vec3(
          (index - center) * offsetFactor + (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.1,
          0,
        );

        const count = Math.max(2, Math.floor(pointCount));
        const points: InstanceType<typeof Vec3>[] = [];
        for (let i = 0; i < count; i++) points.push(new Vec3());

        const [r, g, b] = cssColorToRgb01(css);
        const polyline = new Polyline(gl, {
          points,
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            uColor: { value: new Color(r, g, b) },
            uThickness: { value: thickness },
            uOpacity: { value: 1.0 },
            uTime: { value: 0.0 },
            uEnableShaderEffect: { value: enableShaderEffect ? 1.0 : 0.0 },
            uEffectAmplitude: { value: effectAmplitude },
            uEnableFade: { value: enableFade ? 1.0 : 0.0 },
          },
        });
        polyline.mesh.setParent(scene);

        lines.push({
          spring,
          friction,
          mouseVelocity: new Vec3(),
          mouseOffset,
          points,
          polyline,
        });
      });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        lines.forEach((line) => line.polyline.resize());
      };
      resize(container.clientWidth || canvas.clientWidth, container.clientHeight || canvas.clientHeight);

      // 鼠标/触摸追踪（归一化到 [-1,1] clip 空间）
      const mouse = new Vec3();
      const updateMouse = (e: MouseEvent | TouchEvent) => {
        const rect = (container as HTMLElement).getBoundingClientRect();
        let x: number;
        let y: number;
        const touch = (e as TouchEvent).changedTouches;
        if (touch && touch.length) {
          x = touch[0]!.clientX - rect.left;
          y = touch[0]!.clientY - rect.top;
        } else {
          x = (e as MouseEvent).clientX - rect.left;
          y = (e as MouseEvent).clientY - rect.top;
        }
        const w = rect.width || 1;
        const h = rect.height || 1;
        mouse.set((x / w) * 2 - 1, (y / h) * -2 + 1, 0);
      };
      // 监听挂 window：根容器是 pointer-events-none 的背景层，自身收不到指针事件，
      // 而 window 始终能拿到全局鼠标/触摸坐标，再用容器 rect 归一化。
      window.addEventListener("mousemove", updateMouse as EventListener);
      window.addEventListener("touchstart", updateMouse as EventListener);
      window.addEventListener("touchmove", updateMouse as EventListener);

      const tmp = new Vec3();
      let lastTime = typeof performance !== "undefined" ? performance.now() : 0;

      return {
        render(t: number) {
          const dt = t - lastTime;
          lastTime = t;

          lines.forEach((line) => {
            tmp
              .copy(mouse)
              .add(line.mouseOffset)
              .sub(line.points[0]!)
              .multiply(line.spring);
            line.mouseVelocity.add(tmp).multiply(line.friction);
            line.points[0]!.add(line.mouseVelocity);

            for (let i = 1; i < line.points.length; i++) {
              if (Number.isFinite(maxAge) && maxAge > 0) {
                const segmentDelay = maxAge / (line.points.length - 1);
                const alpha = Math.min(1, (dt * speedMultiplier) / segmentDelay);
                line.points[i]!.lerp(line.points[i - 1]!, alpha);
              } else {
                line.points[i]!.lerp(line.points[i - 1]!, 0.9);
              }
            }

            const uTime = line.polyline.mesh.program.uniforms.uTime;
            if (uTime) uTime.value = t * 0.001;
            line.polyline.updateGeometry();
          });

          renderer.render({ scene });
        },
        resize,
        dispose() {
          window.removeEventListener("mousemove", updateMouse as EventListener);
          window.removeEventListener("touchstart", updateMouse as EventListener);
          window.removeEventListener("touchmove", updateMouse as EventListener);
        },
      };
    },
    [
      colors,
      baseSpring,
      baseFriction,
      baseThickness,
      offsetFactor,
      maxAge,
      pointCount,
      speedMultiplier,
      enableFade,
      enableShaderEffect,
      effectAmplitude,
    ],
  );

  // reduced-motion / 无 WebGL：静态 chart-token 渐变兜底
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_120%_80%_at_50%_50%,var(--color-chart-1)_0%,var(--color-chart-2)_45%,transparent_80%)]",
          "opacity-60",
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
