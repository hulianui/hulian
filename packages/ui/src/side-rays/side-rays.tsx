"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { SideRaysOrigin, SideRaysProps } from "./side-rays.types";

// 吸取自 React Bits SideRays：从屏幕一角（默认右上）发散两束体积感光束，
// GLSL 在片元里按「光源点 → 当前像素」夹角累加正弦波制造光束摆动，
// 距离平方反比衰减（falloff）+ 饱和度调节 + 双束混色叠加，得到类似舞台
// 侧逆光的动态光晕。
//
// 瑚琏化要点：
// 1. 颜色全吃 chart token（默认 rayColor1=--color-chart-1 / rayColor2=--color-chart-2，
//    替原版写死的 #EAB308 / #96c8ff，明暗主题自适应）。
// 2. 去 three.js/原生 IntersectionObserver 样板，统一走 useGlCanvas helper
//    （懒加载 ogl·代码分割·SSR 安全·StrictMode 每次挂载新建 canvas 避 loseContext 毒化·
//     RAF 单帧抛错不崩·ResizeObserver 自适应·离屏暂停）。
// 3. CSS 颜色经离屏 canvas 2D 解析为 0–1 rgb，支持 hex/oklch/rgb/var() 全格式。
// 4. reduced-motion / 无 WebGL → 降级为吃 chart token 的角向 radial-gradient 静态兜底，
//    保留光束方位感，DOM 仍是同一个 absolute inset-0 装饰层。
// 5. 纯装饰层 aria-hidden + pointer-events-none，不夺取交互。

// ---------------------------------------------------------------------------
// OGL 全屏三角顶点 shader（clip-space 全覆盖，无需投影矩阵）
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// 侧光束片元 shader（移植自 react-bits SideRays，uniform 名保持 i 前缀原貌）
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}
`.trim();

// ---------------------------------------------------------------------------
// origin → [flipX, flipY]：默认 top-right 不翻转；其余角落按需镜像坐标。
// ---------------------------------------------------------------------------
function originToFlip(origin: SideRaysOrigin): [number, number] {
  switch (origin) {
    case "top-left":
      return [1, 0];
    case "bottom-right":
      return [0, 1];
    case "bottom-left":
      return [1, 1];
    default:
      return [0, 0]; // top-right
  }
}

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas 让浏览器负责所有颜色空间转换，
// 支持 hex / oklch / rgb / color() / 解析后的 CSS 变量值。
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

// 从已挂载的 canvas 计算样式里读 chart token（当前主题真值），失败兜底白。
function resolveToken(
  canvas: HTMLCanvasElement,
  token: string,
): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue(token).trim();
  if (!raw) return [1, 1, 1];
  return cssColorToRgb01(raw);
}

/**
 * SideRays — 角落发散动态侧光束 WebGL 背景。
 *
 * 基于 react-bits SideRays 原版 GLSL shader（按夹角累加正弦波 + 平方反比衰减），
 * 瑚琏化：双束默认颜色吃 `--color-chart-1 / --color-chart-2` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为角向 radial-gradient 静态兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <SideRays origin="top-right" intensity={2.4} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function SideRays({
  speed = 2.5,
  rayColor1,
  rayColor2,
  intensity = 2,
  spread = 2,
  origin = "top-right",
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className,
  fallback,
}: SideRaysProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 主/辅色：显式 prop 优先；否则读 canvas 计算样式里的 chart token。
      const [r1, g1, b1] = rayColor1
        ? cssColorToRgb01(rayColor1)
        : resolveToken(canvas, "--color-chart-1");
      const [r2, g2, b2] = rayColor2
        ? cssColorToRgb01(rayColor2)
        : resolveToken(canvas, "--color-chart-2");

      const [flipX, flipY] = originToFlip(origin);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Vec2(1, 1) },
          iSpeed: { value: speed },
          iRayColor1: { value: new Color(r1, g1, b1) },
          iRayColor2: { value: new Color(r2, g2, b2) },
          iIntensity: { value: intensity },
          iSpread: { value: spread },
          iFlipX: { value: flipX },
          iFlipY: { value: flipY },
          iTilt: { value: tilt },
          iSaturation: { value: saturation },
          iBlend: { value: blend },
          iFalloff: { value: falloff },
          iOpacity: { value: opacity },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        const cw = w || 1;
        const ch = h || 1;
        renderer.setSize(cw, ch);
        // iResolution 用设备像素（与 gl_FragCoord 一致）。
        program.uniforms.iResolution!.value.set(cw * renderer.dpr, ch * renderer.dpr);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.iTime!.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [
      speed,
      rayColor1,
      rayColor2,
      intensity,
      spread,
      origin,
      tilt,
      saturation,
      blend,
      falloff,
      opacity,
    ],
  );

  // reduced-motion / 无 WebGL：角向 radial-gradient 静态兜底，按 origin 摆位置。
  if (reduced) {
    const pos: Record<SideRaysOrigin, string> = {
      "top-left": "0% 0%",
      "top-right": "100% 0%",
      "bottom-left": "0% 100%",
      "bottom-right": "100% 100%",
    };
    const c1 = rayColor1 ?? "var(--color-chart-1)";
    const c2 = rayColor2 ?? "var(--color-chart-2)";
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "motion-reduce:[animation:none]",
          className,
        )}
        aria-hidden
        style={{
          backgroundImage: [
            `radial-gradient(120% 120% at ${pos[origin]}, ${c1} 0%, transparent 45%)`,
            `radial-gradient(140% 140% at ${pos[origin]}, ${c2} 0%, transparent 60%)`,
          ].join(", "),
          opacity: opacity * 0.7,
        }}
      >
        {fallback}
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
      aria-hidden
    />
  );
}
