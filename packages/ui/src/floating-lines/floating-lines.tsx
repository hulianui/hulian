"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { FloatingLinesProps } from "./floating-lines.types";

// 吸取自 React Bits FloatingLines：三组（顶/中/底）正弦波线束在屏幕坐标系下随时间漂浮、
// 沿 log(length(uv)) 旋转扭曲，叠加可选指针径向弯曲牵引，线条颜色沿渐变色带插值。
// 瑚琏化：
// 1. 去依赖——原版基于 three.js（Scene/OrthographicCamera/ShaderMaterial/Clock），
//    本版改用 ogl（与 Silk/Orb 同栈），通过共享 useGlCanvas 帮手承载懒加载 + StrictMode
//    安全挂载 + RAF + 离屏暂停 + 卸载清理，shader 核心算法（wave/rotate/log 扭曲/指针弯曲）保留。
// 2. token——渐变色默认吃 --color-chart-1/2/4，离屏 canvas 解析任意 CSS 颜色为 0–1 rgb，
//    替原版写死的 PINK/BLUE 背景与十六进制色带，明暗自适应。
// 3. RSC——"use client"（含 hook/ref/WebGL）；纯装饰 aria-hidden。
// 4. reduced-motion / 无 WebGL——useGlCanvas 返回 reduced，渲染静态线性渐变兜底（不消失，仍有色层）。

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-4)",
];

const MAX_STOPS = 5;

// ---------------------------------------------------------------------------
// 顶点 shader：OGL Triangle 全屏覆盖，clip-space 直出，uv 由 Triangle 内建。
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
// 片元 shader：移植自 react-bits FloatingLines 的 wave/rotate/log 扭曲算法。
// gl_FragCoord + iResolution 推 baseUv（保持宽高比、Y 翻转），三组波各自旋转扭曲后
// 用 wave() 累加亮度，乘以沿色带插值的线条色。指针弯曲为可选径向牵引。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec3  uResolution;
uniform float uSpeed;
uniform int   uLineCount;
uniform float uLineDistance;

uniform vec2  uMouse;
uniform float uInteractive;   // 0/1
uniform float uBendRadius;
uniform float uBendStrength;
uniform float uBendInfluence; // 平滑后的 0..1

uniform vec3 uGradient[${MAX_STOPS}];
uniform int  uGradientCount;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 getLineColor(float t) {
  if (uGradientCount <= 1) {
    return uGradient[0];
  }
  float clampedT = clamp(t, 0.0, 0.9999);
  float scaled = clampedT * float(uGradientCount - 1);
  // GLSL ES 100 不支持动态数组下标，按固定步长展开混合。
  vec3 c = uGradient[0];
  for (int i = 1; i < ${MAX_STOPS}; ++i) {
    if (i < uGradientCount) {
      float seg = float(i);
      float w = clamp(scaled - (seg - 1.0), 0.0, 1.0);
      c = mix(c, uGradient[i], w);
    }
  }
  return c;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, float shouldBend) {
  float time = uTime * uSpeed;
  float x_movement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + offset + x_movement) * amp;

  if (shouldBend > 0.5) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * uBendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * uBendStrength * uBendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  // 注：不加原版的 +0.01 环境底光——它会在整幅画布积累成半透明薄雾，
  // 浅色主题下表现为脏灰罩（深色页才显得"有氛围"）。光晕系数较原版收细
  // （0.0175→0.012），长尾叠加是雾感的主要来源。
  return 0.012 / max(abs(m) + 0.008, 1e-3);
}

void main() {
  vec2 baseUv = (2.0 * gl_FragCoord.xy - uResolution.xy) / uResolution.y;
  baseUv.y *= -1.0;

  vec2 mouseUv = vec2(-1000.0);
  if (uInteractive > 0.5) {
    mouseUv = (2.0 * uMouse - uResolution.xy) / uResolution.y;
    mouseUv.y *= -1.0;
  }

  vec3 col = vec3(0.0);

  // 底波
  for (int i = 0; i < ${MAX_STOPS * 4}; ++i) {
    if (i >= uLineCount) break;
    float fi = float(i);
    float t = fi / max(float(uLineCount - 1), 1.0);
    vec3 lineCol = getLineColor(t) * 0.5;
    float angle = 0.4 * log(length(baseUv) + 1.0);
    vec2 ruv = baseUv * rotate(angle);
    col += lineCol * wave(ruv + vec2(uLineDistance * fi + 2.0, -0.7), 1.5 + 0.2 * fi, baseUv, mouseUv, uInteractive) * 0.2;
  }

  // 中波
  for (int i = 0; i < ${MAX_STOPS * 4}; ++i) {
    if (i >= uLineCount) break;
    float fi = float(i);
    float t = fi / max(float(uLineCount - 1), 1.0);
    vec3 lineCol = getLineColor(t) * 0.5;
    float angle = 0.2 * log(length(baseUv) + 1.0);
    vec2 ruv = baseUv * rotate(angle);
    col += lineCol * wave(ruv + vec2(uLineDistance * fi + 5.0, 0.0), 2.0 + 0.15 * fi, baseUv, mouseUv, uInteractive);
  }

  // 顶波
  for (int i = 0; i < ${MAX_STOPS * 4}; ++i) {
    if (i >= uLineCount) break;
    float fi = float(i);
    float t = fi / max(float(uLineCount - 1), 1.0);
    vec3 lineCol = getLineColor(t) * 0.5;
    float angle = -0.4 * log(length(baseUv) + 1.0);
    vec2 ruv = baseUv * rotate(angle);
    ruv.x *= -1.0;
    col += lineCol * wave(ruv + vec2(uLineDistance * fi + 10.0, 0.5), 1.0 + 0.2 * fi, baseUv, mouseUv, uInteractive) * 0.1;
  }

  // alpha 按线条亮度输出（同 line-waves 范式）：线外区域 alpha≈0 透明露出页面背景，
  // 明暗主题通用。原版 alpha=1.0 会让整个画布成不透明黑底（仅适配深色页）。
  // 低强度平滑截断：1/x 光晕长尾在大面积上叠成薄雾（浅色底显脏灰），cut 同乘 col 与 alpha
  // 保持 premultiplied 约束（col ≤ alpha 分量恒成立）。
  // 幂次 tone-map：压低低强度雾区、保留亮核（浅色底上雾区即"脏灰"）
  col = pow(col, vec3(1.5)) * 1.35;
  col *= smoothstep(0.01, 0.08, length(col));
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r,g,b]（0–1）：离屏 1×1 canvas 解析任意格式（hex/oklch/rgb/var 计算后值）。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.5, 0.5, 0.6];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.5, 0.5, 0.6];
  }
}

// CSS 变量 var(--…) → 经 getComputedStyle 取计算值后再解析；非变量原样解析。
function resolveColor(el: HTMLElement, css: string): [number, number, number] {
  let value = css.trim();
  const m = value.match(/^var\((--[^,)]+)(?:,([^)]+))?\)$/);
  if (m) {
    const computed = getComputedStyle(el).getPropertyValue(m[1]!.trim()).trim();
    value = computed || (m[2] ? m[2].trim() : "");
    if (!value) return [0.5, 0.5, 0.6];
  }
  return cssColorToRgb01(value);
}

/**
 * FloatingLines — 漂浮线束 WebGL 背景。
 *
 * 三组正弦波线束随时间漂浮、按 log 半径扭曲旋转，颜色沿渐变色带插值；
 * 可选指针径向弯曲牵引。基于 ogl（零新依赖），默认色吃 chart token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为静态线性渐变兜底。
 *
 * 用法：放进 `relative overflow-hidden` 容器（建议深色底），组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-64 overflow-hidden bg-neutral-950">
 *   <FloatingLines />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function FloatingLines({
  colors = DEFAULT_COLORS,
  lineCount = 6,
  lineDistance = 5,
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5,
  bendStrength = -0.5,
  className,
  fallback,
}: FloatingLinesProps) {
  // 线数上限钳制：shader 循环上界为 MAX_STOPS*4=20。
  const count = Math.max(1, Math.min(Math.round(lineCount), MAX_STOPS * 4));
  const colorsKey = colors.join("|");

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      // alpha: true —— 透明画布让线条叠加在页面背景上（React Bits 原版假设深色页用不透明
      // 黑底；瑚琏组件须明暗主题通用，浅色页面会被不透明黑底整块涂黑）。shader 已输出
      // alpha=length(col)，线外区域 alpha≈0，透明合成正确，同 line-waves。
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 解析渐变色带（最多 MAX_STOPS 段），不足处用最后一段补齐。
      const stops = (colors.length > 0 ? colors : DEFAULT_COLORS).slice(0, MAX_STOPS);
      const resolved = stops.map((c) => resolveColor(canvas, c));
      const gradient = Array.from({ length: MAX_STOPS }, (_unused, i) => {
        const rgb = resolved[Math.min(i, resolved.length - 1)] ?? [0.5, 0.5, 0.6];
        return new Vec3(rgb[0], rgb[1], rgb[2]);
      });

      const mouse = new Vec2(-1000, -1000);
      const targetMouse = new Vec2(-1000, -1000);
      let targetInfluence = 0;
      let currentInfluence = 0;
      const DAMP = 0.08;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec3(1, 1, 1) },
          uSpeed: { value: animationSpeed },
          uLineCount: { value: count },
          uLineDistance: { value: lineDistance * 0.01 },
          uMouse: { value: new Vec2(-1000, -1000) },
          uInteractive: { value: interactive ? 1 : 0 },
          uBendRadius: { value: bendRadius },
          uBendStrength: { value: bendStrength },
          uBendInfluence: { value: 0 },
          uGradient: { value: gradient },
          uGradientCount: { value: resolved.length },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        const cw = gl.drawingBufferWidth || 1;
        const ch = gl.drawingBufferHeight || 1;
        program.uniforms.uResolution!.value.set(cw, ch, 1);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      const onMove = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const ratio = renderer.dpr;
        targetMouse.set(x * ratio, (rect.height - y) * ratio);
        targetInfluence = 1;
      };
      const onLeave = () => {
        targetInfluence = 0;
      };
      if (interactive) {
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);
      }

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001;
          if (interactive) {
            mouse.x += (targetMouse.x - mouse.x) * DAMP;
            mouse.y += (targetMouse.y - mouse.y) * DAMP;
            program.uniforms.uMouse!.value.set(mouse.x, mouse.y);
            currentInfluence += (targetInfluence - currentInfluence) * DAMP;
            program.uniforms.uBendInfluence!.value = currentInfluence;
          }
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (interactive) {
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerleave", onLeave);
          }
          program.remove?.();
        },
      };
    },
    [colorsKey, count, lineDistance, animationSpeed, interactive, bendRadius, bendStrength],
  );

  // reduced-motion / 无 WebGL：静态线性渐变兜底（保留色层，不消失）。
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(105deg,var(--color-chart-1)_0%,transparent_35%,var(--color-chart-2)_60%,transparent_85%,var(--color-chart-4)_100%)]",
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
