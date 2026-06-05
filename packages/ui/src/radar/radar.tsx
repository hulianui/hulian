"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { RadarProps } from "./radar.types";

// 吸取自 React Bits Radar：OGL/WebGL 片元 shader 绘制的雷达盘背景——同心环波纹由
// 中心向外扩散、径向辐条分隔、一束扫描臂绕圈旋转，叠加边缘衰减形成"雷达扫描"质感，
// 鼠标移动时整盘平滑视差偏移。
//
// 瑚琏化要点：
// 1. 去依赖：原版直接 new Renderer/Program/RAF + window resize/mousemove 监听，
//    这里统一走瑚琏 useGlCanvas helper（懒加载 ogl·StrictMode 安全 remount·RAF·
//    ResizeObserver·IntersectionObserver 离屏暂停·dispose 兜底 loseContext）。
// 2. token：主色默认吃 --color-chart-1（明暗自适应），替原版写死 #9f29ff；
//    底色默认透明（不再写死 #000000），透出宿主容器背景。
// 3. 颜色解析：用离屏 1×1 canvas 把任意 CSS 颜色（hex/oklch/rgb/var）转 0..1 rgb，
//    替原版只能吃 hex 的 hexToVec3。
// 4. 鼠标视差：保留原版 currentMouse→targetMouse 的 lerp 平滑，监听挂在 canvas 上。
// 5. reduced-motion / 无 WebGL：自动降级为 chart token 的径向渐变静态盘 fallback，
//    DOM 始终渲染一个根 div（不因 reduced 卸载内容）。
// 6. RSC：装饰层 aria-hidden + pointer-events-none（视差开启时才放行指针）。

// ---------------------------------------------------------------------------
// OGL 全屏三角顶点 shader（clip-space 全覆盖，无需投影矩阵）
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
// 雷达片元 shader（移植自 react-bits Radar，逻辑保持一致）
//  · 同心环：dist*ringCount - t 取 fract 距离 → smoothstep 环辉
//  · 辐条：theta 按 spokeCount 折叠 → 弧长距离 → smoothstep 辐辉
//  · 扫描臂：pow(sin(lobes*theta + sweepPhase), sweepWidth) 旋转光束
//  · 边缘：smoothstep + pow(1-dist, falloff) 衰减
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3  uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uRingCount;
uniform float uSpokeCount;
uniform float uRingThickness;
uniform float uSpokeThickness;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepLobes;
uniform vec3  uColor;
uniform vec3  uBgColor;
uniform float uFalloff;
uniform float uBrightness;
uniform vec2  uMouse;
uniform float uMouseInfluence;
uniform bool  uEnableMouse;

#define TAU 6.28318530718

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  st = st * 2.0 - 1.0;
  st.x *= uResolution.x / uResolution.y;

  if (uEnableMouse) {
    vec2 mShift = (uMouse * 2.0 - 1.0);
    mShift.x *= uResolution.x / uResolution.y;
    st -= mShift * uMouseInfluence;
  }

  st *= uScale;

  float dist  = length(st);
  float theta = atan(st.y, st.x);
  float t     = uTime * uSpeed;

  float ringPhase = dist * uRingCount - t;
  float ringDist  = abs(fract(ringPhase) - 0.5);
  float ringGlow  = 1.0 - smoothstep(0.0, uRingThickness, ringDist);

  float spokeAngle = abs(fract(theta * uSpokeCount / TAU + 0.5) - 0.5) * TAU / uSpokeCount;
  float arcDist    = spokeAngle * dist;
  float spokeGlow  = (1.0 - smoothstep(0.0, uSpokeThickness, arcDist)) * smoothstep(0.0, 0.1, dist);

  float sweepPhase = t * uSweepSpeed;
  float sweepBeam  = pow(max(0.5 * sin(uSweepLobes * theta + sweepPhase) + 0.5, 0.0), uSweepWidth);

  float fade = smoothstep(1.05, 0.85, dist) * pow(max(1.0 - dist, 0.0), uFalloff);

  float intensity = max((ringGlow + spokeGlow + sweepBeam) * fade * uBrightness, 0.0);
  vec3  col = uColor * intensity + uBgColor;

  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（各值 0..1）：离屏 1×1 canvas 解析，全格式安全
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.62, 0.16, 1]; // 兜底：接近原版 #9f29ff
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.62, 0.16, 1];
  }
}

// 从 canvas 计算样式读取 chart token 颜色（挂载时已在 DOM，可拿当前主题值）
function resolveChartToken(canvas: HTMLCanvasElement): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [0.62, 0.16, 1];
  return cssColorToRgb01(raw);
}

/**
 * Radar — 雷达扫描 WebGL 背景。
 *
 * 基于 react-bits Radar 原版 GLSL shader（同心环波纹 + 径向辐条 + 旋转扫描臂 + 边缘衰减），
 * 瑚琏化：默认主色吃 `--color-chart-1` token（明暗自适应）、底色透明；
 * 鼠标移动整盘平滑视差；reduced-motion / 无 WebGL 自动降级为静态径向渐变盘。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden bg-neutral-950">
 *   <Radar sweepSpeed={1.5} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Radar({
  speed = 1,
  scale = 0.5,
  ringCount = 10,
  spokeCount = 10,
  ringThickness = 0.05,
  spokeThickness = 0.01,
  sweepSpeed = 1,
  sweepWidth = 2,
  sweepLobes = 1,
  color,
  backgroundColor,
  falloff = 2,
  brightness = 1,
  enableMouseInteraction = true,
  mouseInfluence = 0.1,
  className,
  fallback,
}: RadarProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        dpr,
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      // 主色：显式 color 优先；否则读 canvas 计算样式里的 chart-1 token
      const [cr, cg, cb] = color ? cssColorToRgb01(color) : resolveChartToken(canvas);
      // 底色：默认透明（[0,0,0]，叠加为常驻基色），显式传入则解析
      const [br, bg, bb] = backgroundColor ? cssColorToRgb01(backgroundColor) : [0, 0, 0];

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime:           { value: 0 },
          uResolution:     { value: [gl.canvas.width, gl.canvas.height, gl.canvas.width / Math.max(gl.canvas.height, 1)] },
          uSpeed:          { value: speed },
          uScale:          { value: scale },
          uRingCount:      { value: ringCount },
          uSpokeCount:     { value: spokeCount },
          uRingThickness:  { value: ringThickness },
          uSpokeThickness: { value: spokeThickness },
          uSweepSpeed:     { value: sweepSpeed },
          uSweepWidth:     { value: sweepWidth },
          uSweepLobes:     { value: sweepLobes },
          uColor:          { value: [cr, cg, cb] },
          uBgColor:        { value: [br, bg, bb] },
          uFalloff:        { value: falloff },
          uBrightness:     { value: brightness },
          uMouse:          { value: [0.5, 0.5] },
          uMouseInfluence: { value: mouseInfluence },
          uEnableMouse:    { value: enableMouseInteraction },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标视差：target 随指针更新，current 每帧 lerp 逼近（平滑）
      const currentMouse: [number, number] = [0.5, 0.5];
      const targetMouse: [number, number] = [0.5, 0.5];

      const handleMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        targetMouse[0] = (e.clientX - rect.left) / rect.width;
        targetMouse[1] = 1 - (e.clientY - rect.top) / rect.height;
      };
      const handleLeave = () => {
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
      };

      if (enableMouseInteraction) {
        canvas.addEventListener("pointermove", handleMove);
        canvas.addEventListener("pointerleave", handleLeave);
      }

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uResolution!.value = [
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / Math.max(gl.canvas.height, 1),
        ];
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001;
          if (enableMouseInteraction) {
            currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
            currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
            program.uniforms.uMouse!.value = [currentMouse[0], currentMouse[1]];
          } else {
            program.uniforms.uMouse!.value = [0.5, 0.5];
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (enableMouseInteraction) {
            canvas.removeEventListener("pointermove", handleMove);
            canvas.removeEventListener("pointerleave", handleLeave);
          }
          program.remove?.();
        },
      };
    },
    [
      speed,
      scale,
      ringCount,
      spokeCount,
      ringThickness,
      spokeThickness,
      sweepSpeed,
      sweepWidth,
      sweepLobes,
      color,
      backgroundColor,
      falloff,
      brightness,
      enableMouseInteraction,
      mouseInfluence,
    ],
  );

  // reduced-motion / 无 WebGL：静态径向渐变盘 fallback（chart token 同心圈意象）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(circle_at_center,var(--color-chart-1)_0%,transparent_55%)]",
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
        "absolute inset-0 z-0 block h-full w-full",
        enableMouseInteraction ? "" : "pointer-events-none",
        className,
      )}
      aria-hidden
    />
  );
}
