"use client";
import type { CSSProperties } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { LightRaysOrigin, LightRaysProps } from "./light-rays.types";

// 吸取自 React Bits LightRays：自某一原点（八向：四角/四边）放射的体积光束，
// 双层正弦扰动叠加 + 角度扩散衰减 + 沿程渐隐 + 可选脉动/噪点/扭曲，方向可跟随鼠标。
// 瑚琏化：
// 1. Three.js/ogl 依赖统一收口到 useGlCanvas helper（懒加载 ogl、StrictMode 安全
//    新建 canvas、RAF/IntersectionObserver/ResizeObserver、reduced-motion 降级、卸载 loseContext）。
// 2. 颜色去掉原版写死 #ffffff，默认吃 --color-chart-1 token（明暗自适应），
//    任意 CSS 颜色经离屏 canvas 解析为 RGB，不再手写 hexToRgb。
// 3. reduced-motion / 无 WebGL → 静态径向渐变兜底（chart token），DOM 始终在、纯装饰 aria-hidden。
// 4. 鼠标跟随在 setup 闭包内挂 window mousemove、dispose 时摘除，平滑插值不逐帧抖动。
// 5. "use client"（用 ref/effect/WebGL）；根为 DOM 元素，className 经 cn 合并、{...} 透传 style。

const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 片元 shader 算法忠实于 React Bits 原版（rayStrength 双层正弦 + 扩散 pow + 长度/淡出衰减
// + 脉动 + 噪点 + 距离扭曲），仅删去原版写死的蓝偏色调（brightness 通道偏置），
// 改为统一吃 raysColor，使瑚琏 token 着色可控。
const FRAG = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float dist = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - dist) / maxDistance, 0.0, 1.0);

  float fadeFalloff = clamp((iResolution.x * fadeDistance - dist) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

  vec4 fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // 上亮下暗的纵向渐变，模拟光束从原点向远端衰减
  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.rgb *= 0.2 + brightness * 0.8;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
  gl_FragColor = fragColor;
}
`.trim();

// 原点 → 锚点(像素) + 方向（与 React Bits 原版一致，outside 让锚点略出界使光束自边缘外射入）
function getAnchorAndDir(
  origin: LightRaysOrigin,
  w: number,
  h: number,
): { anchor: [number, number]; dir: [number, number] } {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: // top-center
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
}

// 任意 CSS 颜色 → [r, g, b]（0–1），用离屏 1×1 canvas 让浏览器负责全格式色彩空间转换。
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

// 从已挂载元素的计算样式读取 chart-1 token（随当前主题）。
function resolveChartToken(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [1, 1, 1];
  return cssColorToRgb01(raw);
}

/**
 * LightRays — 体积光束放射 WebGL 背景。
 *
 * 移植自 React Bits LightRays（GLSL 双层正弦光束 shader）。瑚琏化：默认颜色吃
 * `--color-chart-1` token；WebGL 生命周期收口到 useGlCanvas；reduced-motion / 无
 * WebGL 自动降级为静态径向渐变兜底。
 *
 * 用法：放在 `relative overflow-hidden` 容器（建议深色底）里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden bg-neutral-950">
 *   <LightRays raysOrigin="top-center" raysSpeed={1.4} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function LightRays({
  raysOrigin = "top-center",
  raysColor,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className,
  fallback,
  style,
  children,
}: LightRaysProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      const rgb = raysColor
        ? cssColorToRgb01(raysColor)
        : resolveChartToken(canvas);

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] as [number, number] },
        rayPos: { value: [0, 0] as [number, number] },
        rayDir: { value: [0, 1] as [number, number] },
        raysColor: { value: rgb as [number, number, number] },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1 : 0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] as [number, number] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms,
      });
      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标平滑跟随：原始指针位置 → 指数平滑 → mousePos uniform
      const target = { x: 0.5, y: 0.5 };
      const smooth = { x: 0.5, y: 0.5 };
      const onMouseMove = (e: MouseEvent) => {
        const host = canvas.parentElement;
        if (!host) return;
        const rect = host.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        target.x = (e.clientX - rect.left) / rect.width;
        target.y = (e.clientY - rect.top) / rect.height;
      };
      const mouseActive = followMouse && mouseInfluence > 0;
      if (mouseActive) {
        window.addEventListener("mousemove", onMouseMove);
      }

      const resize = (w: number, h: number) => {
        const cw = w || 1;
        const ch = h || 1;
        renderer.setSize(cw, ch);
        const pw = cw * renderer.dpr;
        const ph = ch * renderer.dpr;
        uniforms.iResolution.value = [pw, ph];
        const { anchor, dir } = getAnchorAndDir(raysOrigin, pw, ph);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          uniforms.iTime.value = t * 0.001;
          if (mouseActive) {
            const k = 0.92;
            smooth.x = smooth.x * k + target.x * (1 - k);
            smooth.y = smooth.y * k + target.y * (1 - k);
            uniforms.mousePos.value = [smooth.x, smooth.y];
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (mouseActive) {
            window.removeEventListener("mousemove", onMouseMove);
          }
          program.remove?.();
        },
      };
    },
    [
      raysOrigin,
      raysColor,
      raysSpeed,
      lightSpread,
      rayLength,
      pulsating,
      fadeDistance,
      saturation,
      followMouse,
      mouseInfluence,
      noiseAmount,
      distortion,
    ],
  );

  // reduced-motion / 无 WebGL：静态径向渐变兜底（chart token，自原点方向淡出）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(120%_90%_at_50%_-10%,var(--color-chart-1)_0%,transparent_60%)]",
          "opacity-70",
          className,
        )}
        style={style}
        aria-hidden
      >
        {fallback}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 block h-full w-full overflow-hidden",
        className,
      )}
      style={style as CSSProperties}
      aria-hidden
    >
      {children}
    </div>
  );
}
