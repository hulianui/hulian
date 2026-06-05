"use client";
import { useCallback, useRef } from "react";
import { cn } from "../lib/cn";
import { useGlCanvas } from "../lib/use-gl-canvas";
import type { ThreadsProps } from "./threads.types";

// ---------------------------------------------------------------------------
// GLSL — react-bits Threads 原版 shader（完整移植，逐字保留）
// 来源：github.com/DavidHDev/react-bits
//       src/content/Backgrounds/Threads/Threads.jsx
// ---------------------------------------------------------------------------

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// ---------------------------------------------------------------------------
// CSS 颜色解析辅助
// 将任意 CSS 颜色（含 var(--token)）解析为 [r, g, b]（每分量 0–1）。
// 借用离屏 1×1 Canvas 2D 获取浏览器 computed rgb，是最可靠的跨格式方案。
// ---------------------------------------------------------------------------
function parseCssColorToRgb01(css: string): [number, number, number] {
  try {
    const offscreen = document.createElement("canvas");
    offscreen.width = 1;
    offscreen.height = 1;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return [1, 1, 1];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  } catch {
    return [1, 1, 1];
  }
}

/**
 * 将 `color` prop（数组 | CSS 字符串 | undefined）解析为 [r, g, b] 0–1 数组。
 * 若为 undefined，从 canvas 元素读取 `--color-chart-1` token。
 */
function resolveColor(
  color: [number, number, number] | string | undefined,
  canvas: HTMLCanvasElement,
): [number, number, number] {
  if (Array.isArray(color)) return color;
  if (typeof color === "string") {
    // var(--token) 或具体 CSS 颜色字符串
    if (color.includes("var(")) {
      const match = color.match(/var\(\s*(--[\w-]+)\s*\)/);
      if (match) {
        const token = getComputedStyle(canvas).getPropertyValue(match[1]).trim();
        return parseCssColorToRgb01(token || "#fff");
      }
    }
    return parseCssColorToRgb01(color);
  }
  // 默认：从 canvas 继承的 --color-chart-1
  const chart1 = getComputedStyle(canvas).getPropertyValue("--color-chart-1").trim();
  if (chart1) return parseCssColorToRgb01(chart1);
  // 最终兜底：白色
  return [1, 1, 1];
}

// ---------------------------------------------------------------------------
// Fallback —— reduced-motion / 无 WebGL 时的静态 CSS 替代
// ---------------------------------------------------------------------------
function DefaultFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        // 5 条静态渐变线，模拟流动丝线的视觉氛围，吃 chart token
        background: [
          `linear-gradient(175deg, transparent 0%, var(--color-chart-1) 30%, transparent 60%, var(--color-chart-2) 80%, transparent 100%)`,
          `linear-gradient(170deg, transparent 10%, var(--color-chart-2) 40%, transparent 70%)`,
          `linear-gradient(165deg, transparent 20%, var(--color-chart-3) 50%, transparent 80%)`,
          `linear-gradient(160deg, transparent 5%, var(--color-chart-4) 35%, transparent 65%, var(--color-chart-1) 90%, transparent 100%)`,
          `linear-gradient(180deg, transparent 15%, var(--color-chart-5) 45%, transparent 75%)`,
        ].join(", "),
        opacity: 0.35,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// 组件
// ---------------------------------------------------------------------------

export function Threads({
  color,
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = true,
  className,
  fallback,
}: ThreadsProps) {
  // 鼠标当前位置和目标位置：用 ref 避免闭包过期，不触发重渲染
  const mouseCurrentRef = useRef<[number, number]>([0.5, 0.5]);
  const mouseTargetRef = useRef<[number, number]>([0.5, 0.5]);
  // canvas ref 传给 useGlCanvas，同时需要在鼠标回调里访问 canvas 容器
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  const setup = useCallback(
    async ({ ogl, canvas }: { ogl: typeof import("ogl"); canvas: HTMLCanvasElement }) => {
      // 保存 canvas ref 供鼠标事件访问
      canvasElRef.current = canvas;

      const { Renderer, Program, Mesh, Triangle, Color } = ogl;

      const renderer = new Renderer({
        canvas,
        alpha: true,
        dpr: Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 解析 color prop → [r, g, b] 0–1
      const [cr, cg, cb] = resolveColor(color, canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          // iResolution：ogl Color 作 vec3 容器（r=width, g=height, b=aspect）
          iResolution: {
            value: new Color(
              canvas.clientWidth || 1,
              canvas.clientHeight || 1,
              (canvas.clientWidth || 1) / (canvas.clientHeight || 1),
            ),
          },
          uColor: { value: new Color(cr, cg, cb) },
          uAmplitude: { value: amplitude },
          uDistance: { value: distance },
          // uMouse：vec2，Float32Array 直接写 uniform
          uMouse: { value: new Float32Array([0.5, 0.5]) },
        },
      });

      const mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program,
      });

      // resize 回调：更新渲染器尺寸 + iResolution uniform
      const resize = (w: number, h: number) => {
        const rw = w || 1;
        const rh = h || 1;
        renderer.setSize(rw, rh);
        program.uniforms.iResolution.value.r = rw;
        program.uniforms.iResolution.value.g = rh;
        program.uniforms.iResolution.value.b = rw / rh;
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 鼠标事件：挂在 canvas 本身（它是 absolute inset-0，覆盖整个容器）
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        // WebGL y 轴向上翻转
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        mouseTargetRef.current = [x, y];
      };
      const handleMouseLeave = () => {
        mouseTargetRef.current = [0.5, 0.5];
      };

      if (enableMouseInteraction) {
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
      }

      // render 回调：每帧由 useGlCanvas 的 RAF 驱动调用
      const render = (t: number) => {
        if (enableMouseInteraction) {
          const smoothing = 0.05;
          const cur = mouseCurrentRef.current;
          const tgt = mouseTargetRef.current;
          cur[0] += smoothing * (tgt[0] - cur[0]);
          cur[1] += smoothing * (tgt[1] - cur[1]);
          program.uniforms.uMouse.value[0] = cur[0];
          program.uniforms.uMouse.value[1] = cur[1];
        } else {
          program.uniforms.uMouse.value[0] = 0.5;
          program.uniforms.uMouse.value[1] = 0.5;
        }
        // iTime 以秒为单位（t 是 ms 时间戳）
        program.uniforms.iTime.value = t * 0.001;
        renderer.render({ scene: mesh });
      };

      const dispose = () => {
        if (enableMouseInteraction) {
          canvas.removeEventListener("mousemove", handleMouseMove);
          canvas.removeEventListener("mouseleave", handleMouseLeave);
        }
      };

      return { render, resize, dispose };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color, amplitude, distance, enableMouseInteraction],
  );

  const { ref, reduced } = useGlCanvas(setup, [
    color,
    amplitude,
    distance,
    enableMouseInteraction,
  ]);

  // reduced-motion 或 WebGL 不可用 → 静态 fallback
  if (reduced) {
    return (
      <div className={cn("absolute inset-0 z-0 overflow-hidden", className)}>
        {fallback !== undefined ? fallback : <DefaultFallback />}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("absolute inset-0 z-0 block h-full w-full", className)}
    />
  );
}
