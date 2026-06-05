"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { PlasmaProps } from "./plasma.types";

// 吸取自 React Bits Plasma：WebGL2 片元 shader 对一束等离子流场做 60 步光线步进
// （raymarch），叠加正弦扭曲 + tanh 色调映射，得到向上涌动、可被鼠标轻微扰动的
// 等离子背景。
//
// 瑚琏化要点：
// 1. 主色默认吃 `--color-chart-1` token（明暗自适应），替原版写死 #ffffff；显式 color 优先。
// 2. 颜色解析走离屏 1×1 canvas（支持 hex / oklch / rgb / var()，浏览器负责色彩空间转换）。
// 3. 渲染生命周期复用瑚琏 useGlCanvas（懒加载 ogl·StrictMode 安全·离屏暂停·错误兜底），
//    不再各自手写 Renderer/RAF/ResizeObserver/IntersectionObserver。
// 4. reduced-motion / 无 WebGL：降级为吃 chart token 的静态径向渐变（保留中心发光观感）。
// 5. 鼠标交互监听挂在 helper 新建的 canvas 上，dispose 时移除，无内存泄漏。
// 6. RSC 安全（"use client" + 仅客户端 effect 内建 GL）。

// WebGL2 GLSL 3.00 ES。Triangle 全屏几何，position/uv 由 OGL 内建。
const VERT = /* glsl */ `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;

  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;

    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }

  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);

  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));

  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}
`;

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0–1）。离屏 1×1 canvas 让浏览器负责所有颜色空间转换。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] | null {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#000";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return null;
  }
}

// 从 canvas 计算样式读取 chart token（当前主题）。
function resolveChartToken(canvas: HTMLCanvasElement): [number, number, number] | null {
  const raw = getComputedStyle(canvas).getPropertyValue("--color-chart-1").trim();
  if (!raw) return null;
  return cssColorToRgb01(raw);
}

/**
 * Plasma — 等离子流动 WebGL 背景。
 *
 * 基于 react-bits Plasma 原版 GLSL（60 步光线步进 + 正弦扭曲 + tanh 调色）。
 * 瑚琏化：默认主色吃 `--color-chart-1` token（明暗自适应）；支持鼠标扰动、
 * forward/reverse/pingpong 三种方向；reduced-motion / 无 WebGL 自动降级为静态径向渐变。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Plasma speed={1} direction="pingpong" opacity={0.8} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Plasma({
  color,
  speed = 1,
  direction = "forward",
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  className,
  fallback,
}: PlasmaProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ webgl: 2, canvas, alpha: true, antialias: false, dpr });
      const gl = renderer.gl;

      // 解析主色：显式 color 优先；否则读 chart token；都无 → 不染色（用 shader 原生彩）。
      const resolved = color ? cssColorToRgb01(color) : resolveChartToken(canvas);
      const useCustomColor = resolved ? 1.0 : 0.0;
      const rgb = resolved ?? [1, 1, 1];

      const directionMultiplier = direction === "reverse" ? -1.0 : 1.0;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uCustomColor: { value: new Float32Array(rgb) },
          uUseCustomColor: { value: useCustomColor },
          uSpeed: { value: speed * 0.4 },
          uDirection: { value: directionMultiplier },
          uScale: { value: scale },
          uOpacity: { value: opacity },
          uMouse: { value: new Float32Array([0, 0]) },
          uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 鼠标扰动：监听 helper 新建的 canvas（铺满容器），dispose 时移除。
      const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const u = program.uniforms.uMouse!.value as Float32Array;
        u[0] = e.clientX - rect.left;
        u[1] = e.clientY - rect.top;
      };
      if (mouseInteractive) {
        canvas.addEventListener("mousemove", handleMouseMove);
      }

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        const res = program.uniforms.iResolution!.value as Float32Array;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      const t0 = typeof performance !== "undefined" ? performance.now() : 0;

      return {
        render(t: number) {
          const timeValue = (t - t0) * 0.001;
          if (direction === "pingpong") {
            // smoothstep 缓动的正反往复：每 10s 一段，奇偶段反向，无突变。
            const period = 10;
            const seg = timeValue % period;
            const forward = Math.floor(timeValue / period) % 2 === 0;
            const x = seg / period;
            const smooth = x * x * (3 - 2 * x);
            program.uniforms.iTime!.value = (forward ? smooth : 1 - smooth) * period;
            program.uniforms.uDirection!.value = 1.0;
          } else {
            program.uniforms.iTime!.value = timeValue;
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (mouseInteractive) {
            canvas.removeEventListener("mousemove", handleMouseMove);
          }
          program.remove?.();
        },
      };
    },
    [color, speed, direction, scale, opacity, mouseInteractive],
  );

  // reduced-motion / 无 WebGL：静态径向渐变 fallback（中心发光 → 边缘隐没，仿等离子核心）。
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_60%_80%_at_50%_60%,var(--color-chart-1)_0%,transparent_70%)]",
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
