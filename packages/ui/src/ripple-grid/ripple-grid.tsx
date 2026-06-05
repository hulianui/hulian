"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { RippleGridProps } from "./ripple-grid.types";

// 吸取自 React Bits RippleGrid：全屏 OGL Triangle 跑一支 GLSL shader，绘制一张随时间
// 呼吸的同心涟漪网格——sin(π·(time−dist)) 把网格 uv 沿径向推挤出水波，叠加暗角、
// 中心辉光、距离淡出，可选彩虹循环配色，指针处再激起一圈局部涟漪。
//
// 瑚琏化要点：
// 1. 默认网格色吃 `--color-chart-1` token（明暗自适应），替原版写死的 #ffffff。
// 2. 颜色解析走离屏 1×1 canvas（支持 hex / oklch / rgb / var），不再用原版 hexToRgb 正则。
// 3. 生命周期全托 useGlCanvas：懒加载 ogl（base bundle 不含）、SSR 安全、
//    每次挂载新建 canvas 规避 StrictMode loseContext 毒化、RAF 离屏暂停、ResizeObserver。
// 4. reduced-motion / 无 WebGL → 自动降级为静态 chart token 网格底纹（DOM 不消失）。
// 5. 鼠标交互监听挂在 helper 容器（canvas.parentElement）上，dispose 时摘除。
// 6. shader 主体逐行忠实移植，仅把 iResolution/mouse 等 uniform 接到瑚琏管线。

// ---------------------------------------------------------------------------
// 顶点 shader：OGL Triangle 全覆盖 clip-space，vUv = position*0.5+0.5（同原版）
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// 片元 shader：忠实移植 React Bits RippleGrid 原版
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  if (gridRotation != 0.0) {
    uv = rotate(gridRotation * pi / 180.0) * uv;
  }

  float dist = length(uv);
  float func = sin(pi * (iTime - dist));
  vec2 rippleUv = uv + uv * func * rippleIntensity;

  if (mouseInteraction && mouseInfluence > 0.0) {
    vec2 mouseUv = (mousePosition * 2.0 - 1.0);
    mouseUv.x *= iResolution.x / iResolution.y;
    float mouseDist = length(uv - mouseUv);

    float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));

    float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
    rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
  }

  vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
  vec2 b = abs(a);

  float aaWidth = 0.5;
  vec2 smoothB = vec2(
    smoothstep(0.0, aaWidth, b.x),
    smoothstep(0.0, aaWidth, b.y)
  );

  vec3 color = vec3(0.0);
  color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
  color += exp(-gridThickness * smoothB.y);
  color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
  color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

  if (glowIntensity > 0.0) {
    color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
    color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
  }

  float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));

  vec2 vignetteCoords = vUv - 0.5;
  float vignetteDistance = length(vignetteCoords);
  float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
  vignette = clamp(vignette, 0.0, 1.0);

  vec3 t;
  if (enableRainbow) {
    t = vec3(
      uv.x * 0.5 + 0.5 * sin(iTime),
      uv.y * 0.5 + 0.5 * cos(iTime),
      pow(cos(iTime), 4.0)
    ) + 0.5;
  } else {
    t = gridColor;
  }

  float finalFade = ddd * vignette;
  float alpha = length(color) * finalFade * opacity;
  gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas 解析，全格式（hex/oklch/rgb/var 计算后值）
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

// 从挂载的 canvas 计算样式读 chart-1 token（当前主题色）
function resolveChartToken(canvas: HTMLCanvasElement): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [1, 1, 1];
  return cssColorToRgb01(raw);
}

/**
 * RippleGrid — 涟漪网格 WebGL 背景。
 *
 * 基于 React Bits RippleGrid 原版 GLSL shader（同心 sin 波推挤网格 + 暗角 + 辉光），
 * 瑚琏化：默认网格色吃 `--color-chart-1` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为静态网格底纹。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <RippleGrid gridSize={12} glowIntensity={0.2} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function RippleGrid({
  enableRainbow = false,
  color,
  rippleIntensity = 0.05,
  gridSize = 10,
  gridThickness = 15,
  fadeDistance = 1.5,
  vignetteStrength = 2,
  glowIntensity = 0.1,
  opacity = 1,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1,
  className,
  fallback,
}: RippleGridProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 网格主色：显式 color 优先；否则读 chart-1 token
      const [r, g, b] = color ? cssColorToRgb01(color) : resolveChartToken(canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: [1, 1] },
          enableRainbow: { value: enableRainbow },
          gridColor: { value: [r, g, b] },
          rippleIntensity: { value: rippleIntensity },
          gridSize: { value: gridSize },
          gridThickness: { value: gridThickness },
          fadeDistance: { value: fadeDistance },
          vignetteStrength: { value: vignetteStrength },
          glowIntensity: { value: glowIntensity },
          opacity: { value: opacity },
          gridRotation: { value: gridRotation },
          mouseInteraction: { value: mouseInteraction },
          mousePosition: { value: [0.5, 0.5] },
          mouseInfluence: { value: 0 },
          mouseInteractionRadius: { value: mouseInteractionRadius },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标平滑插值状态
      const mouse = { x: 0.5, y: 0.5 };
      const target = { x: 0.5, y: 0.5 };
      let influenceTarget = 0;

      // 监听容器（helper 把 canvas append 进 ref 容器，故 parentElement 即容器）
      const host = canvas.parentElement;
      const onMove = (e: PointerEvent) => {
        if (!host) return;
        const rect = host.getBoundingClientRect();
        target.x = (e.clientX - rect.left) / (rect.width || 1);
        target.y = 1 - (e.clientY - rect.top) / (rect.height || 1); // 翻转 Y
      };
      const onEnter = () => {
        influenceTarget = 1;
      };
      const onLeave = () => {
        influenceTarget = 0;
      };
      if (mouseInteraction && host) {
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerenter", onEnter);
        host.addEventListener("pointerleave", onLeave);
      }

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.iResolution!.value = [w || 1, h || 1];
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.iTime!.value = t * 0.001;

          // 指针位置 lerp（0.1）+ 影响因子 lerp（0.05），同原版节奏
          mouse.x += (target.x - mouse.x) * 0.1;
          mouse.y += (target.y - mouse.y) * 0.1;
          const cur = program.uniforms.mouseInfluence!.value as number;
          program.uniforms.mouseInfluence!.value = cur + (influenceTarget - cur) * 0.05;
          program.uniforms.mousePosition!.value = [mouse.x, mouse.y];

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (host) {
            host.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerenter", onEnter);
            host.removeEventListener("pointerleave", onLeave);
          }
          program.remove?.();
        },
      };
    },
    [
      enableRainbow,
      color,
      rippleIntensity,
      gridSize,
      gridThickness,
      fadeDistance,
      vignetteStrength,
      glowIntensity,
      opacity,
      gridRotation,
      mouseInteraction,
      mouseInteractionRadius,
    ],
  );

  // reduced-motion / 无 WebGL：静态 chart token 网格底纹（双向 repeating-linear-gradient）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:repeating-linear-gradient(0deg,transparent_0,transparent_22px,color-mix(in_oklab,var(--color-chart-1)_45%,transparent)_23px),repeating-linear-gradient(90deg,transparent_0,transparent_22px,color-mix(in_oklab,var(--color-chart-1)_45%,transparent)_23px)]",
          "[mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_40%,transparent_100%)]",
          "opacity-70",
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
