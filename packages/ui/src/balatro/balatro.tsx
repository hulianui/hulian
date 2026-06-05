"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { BalatroProps } from "./balatro.types";

// 吸取自 React Bits Balatro：一块 GLSL 片元 shader 渲染的「螺旋油彩」全屏背景——
// 像素化（pixelFilter）后绕中心做角度旋转，再迭代 5 次正弦扰动堆叠出 Balatro 卡牌
// 游戏标志性的旋涡油画质感，三色混合 + 高光，可随鼠标轻微偏移。
//
// 瑚琏化要点：
// 1. Three/原版用裸 ogl Renderer 自管 RAF/resize/卸载——这里改吃 useGlCanvas 共享帮手
//    （懒加载 ogl 代码分割、StrictMode 安全的每挂载新建 canvas、离屏暂停、reduced-motion 降级）。
// 2. 三个颜色默认吃 chart token（chart-1/2/5 自动明暗适配），替原版写死的红/蓝/墨绿 hex。
//    任意 CSS 颜色（hex/oklch/rgb/var）经离屏 canvas 解析成 0–1 浮点喂 shader uniform。
// 3. reduced-motion / 无 WebGL → 降级为三色 conic-gradient 静态兜底（保留旋涡意象，非消失）。
// 4. 鼠标交互走容器 pointermove 监听，最新坐标写进一个稳定 ref，render 每帧读 → uMouse uniform。
// 5. 纯装饰层（aria-hidden、pointer-events 仅交互态开），absolute inset-0 z-0，RSC 由 "use client" 包裹。

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 片元 shader 忠实移植原版 effect()：像素化 → 角度旋转 → 5 次正弦迭代 → 三色混合 + 高光。
const FRAG = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2  uOffset;
uniform vec4  uColor1;
uniform vec4  uColor2;
uniform vec4  uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool  uIsRotate;
uniform vec2  uMouse;

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screen_coords) {
  float pixel_size = length(screenSize.xy) / uPixelFilter;
  vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
  float uv_len = length(uv);

  float speed = (uSpinRotation * uSpinEase * 0.2);
  if (uIsRotate) {
    speed = iTime * speed;
  }
  speed += 302.2;

  float mouseInfluence = (uMouse.x * 2.0 - 1.0);
  speed += mouseInfluence * 0.1;

  float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
  vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
  uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);

  uv *= 30.0;
  float baseSpeed = iTime * uSpinSpeed;
  speed = baseSpeed + mouseInfluence * 2.0;

  vec2 uv2 = vec2(uv.x + uv.y);

  for (int i = 0; i < 5; i++) {
    uv2 += sin(max(uv.x, uv.y)) + uv;
    uv += 0.5 * vec2(
      cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
      sin(uv2.x - 0.113 * speed)
    );
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
  }

  float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
  float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
  float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
  float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
  float c3p = 1.0 - min(1.0, c1p + c2p);
  float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);

  return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1p + uColor2 * c2p + vec4(c3p * uColor3.rgb, c3p * uColor1.a)) + light;
}

void main() {
  vec2 uv = vUv * iResolution.xy;
  gl_FragColor = effect(iResolution.xy, uv);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b, a]（各值 0–1）。
// 离屏 1×1 canvas 让浏览器负责所有颜色空间转换（hex/oklch/rgb/var 计算值都吃）。
// ---------------------------------------------------------------------------
function cssColorToVec4(css: string): [number, number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.5, 0.5, 0.5, 1];
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255, d[3]! / 255];
  } catch {
    return [0.5, 0.5, 0.5, 1];
  }
}

/** 从已挂载 canvas 的计算样式读 token 值（拿当前主题），再解析成 vec4。 */
function resolveColor(
  canvas: HTMLCanvasElement,
  explicit: string | undefined,
  token: string,
  fallback: [number, number, number, number],
): [number, number, number, number] {
  if (explicit) return cssColorToVec4(explicit);
  const raw = getComputedStyle(canvas).getPropertyValue(token).trim();
  if (!raw) return fallback;
  return cssColorToVec4(raw);
}

/**
 * Balatro — 螺旋油彩 WebGL 背景。
 *
 * 移植自 React Bits Balatro 的 GLSL shader（像素旋涡 + 5 次正弦迭代油画混色）。
 * 瑚琏化：三色默认吃 chart token（明暗自适应）；reduced-motion / 无 WebGL 自动降级为
 * conic-gradient 静态兜底；鼠标交互可选。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Balatro spinSpeed={5} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Balatro({
  spinRotation = -2.0,
  spinSpeed = 7.0,
  offset = [0.0, 0.0],
  color1,
  color2,
  color3,
  contrast = 3.5,
  lighting = 0.4,
  spinAmount = 0.25,
  pixelFilter = 745.0,
  spinEase = 1.0,
  isRotate = false,
  mouseInteraction = true,
  className,
  fallback,
}: BalatroProps) {
  // 鼠标坐标存稳定 ref（不进 deps，避免高频重建场景）；render 每帧读最新值。
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, dpr });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 1);

      const c1 = resolveColor(canvas, color1, "--color-chart-1", [0.87, 0.27, 0.23, 1]);
      const c2 = resolveColor(canvas, color2, "--color-chart-2", [0.0, 0.42, 0.71, 1]);
      const c3 = resolveColor(canvas, color3, "--color-chart-5", [0.09, 0.14, 0.15, 1]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height || 1],
          },
          uSpinRotation: { value: spinRotation },
          uSpinSpeed: { value: spinSpeed },
          uOffset: { value: offset },
          uColor1: { value: c1 },
          uColor2: { value: c2 },
          uColor3: { value: c3 },
          uContrast: { value: contrast },
          uLighting: { value: lighting },
          uSpinAmount: { value: spinAmount },
          uPixelFilter: { value: pixelFilter },
          uSpinEase: { value: spinEase },
          uIsRotate: { value: isRotate },
          uMouse: { value: [0.5, 0.5] },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.iResolution!.value = [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height || 1,
        ];
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.iTime!.value = t * 0.001;
          if (mouseInteraction) {
            program.uniforms.uMouse!.value = mouseRef.current;
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [
      spinRotation,
      spinSpeed,
      offset,
      color1,
      color2,
      color3,
      contrast,
      lighting,
      spinAmount,
      pixelFilter,
      spinEase,
      isRotate,
      mouseInteraction,
    ],
  );

  // 容器 pointermove → 归一化坐标写进 ref（render 每帧读）。
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mouseInteraction) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = [x, y];
  };

  // reduced-motion / 无 WebGL：三色 conic-gradient 静态兜底（保留旋涡意象）。
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:conic-gradient(from_210deg_at_50%_50%,var(--color-chart-1),var(--color-chart-2),var(--color-chart-5),var(--color-chart-1))]",
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
      onPointerMove={mouseInteraction ? handlePointerMove : undefined}
      className={cn(
        "absolute inset-0 z-0 block h-full w-full",
        mouseInteraction ? "" : "pointer-events-none",
        className,
      )}
      aria-hidden
    />
  );
}
