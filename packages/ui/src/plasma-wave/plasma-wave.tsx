"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { PlasmaWaveProps } from "./plasma-wave.types";

// 吸取自 React Bits PlasmaWave：单 fullscreen 三角片 + raymarch 距离场 GLSL，
// 两条正/余弦丝带在镜头纵深里交织流动，按命中权重双色混合得到等离子波纹。
// 瑚琏化：
//   1. 颜色不再写死 hex（原 #A855F7/#06B6D4），默认吃 chart token（var(--color-chart-1/2)，
//      自动明暗适配）；任意 CSS 颜色（含 oklch / var(--color-…)）经离屏 canvas 解析成 0–1 RGB
//      再喂 uColor uniform——避免 shader 内无法解析 oklch。
//   2. 去 ./PlasmaWave.css，尺寸由容器 className 决定（h-full w-full / absolute inset-0）。
//   3. 不直接用 ogl Renderer/RAF，复用瑚琏 useGlCanvas：StrictMode 安全（每挂载新建 canvas，
//      规避 loseContext 毒化）+ 懒载 ogl（代码分割）+ ResizeObserver/IntersectionObserver +
//      render try/catch 不崩页 + SSR 安全。
//   4. reduced-motion / 无 WebGL → 静态双色斜向渐变 fallback（吃同款 token，不消失）。
//   5. 运行时 prop 通过 ref 同步进 RAF，无需重建 GL context。

// ────────────────────────────────────────────────────────────────
// GLSL（raymarch 主体原样移植，仅 uniform 命名沿用 react-bits 语义）
// ────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float iTime;
uniform vec2  iResolution;
uniform vec2  uOffset;
uniform float uRotation;
uniform float uFocalLength;
uniform float uSpeed1;
uniform float uSpeed2;
uniform float uDir2;
uniform float uBend1;
uniform float uBend2;
uniform vec3  uColor1;
uniform vec3  uColor2;

const float lt   = 0.3;
const float pi2  = 6.28318;
const float pi_2 = 1.5708;
#define MAX_STEPS 14

void mainImage(out vec4 C, in vec2 U) {
  float t = iTime * 3.14159;
  float s = 1.0;
  float d = 0.0;
  vec2  R = iResolution;

  vec3 o = vec3(0.0, 0.0, -7.0);
  vec3 u = normalize(vec3((U - 0.5 * R) / R.y, uFocalLength));
  vec2 k = vec2(0.0);
  vec3 p;

  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * uSpeed1;
  float tSpeed2 = t * uSpeed2 * uDir2;

  for (int i = 0; i < MAX_STEPS; ++i) {
    p = o + u * d;
    p.x -= 15.0;

    float px = p.x;
    float wob1 = uBend1 + sin(t1 + px * 0.8) * 0.1;
    float wob2 = uBend2 + cos(t2 + px * 1.1) * 0.1;

    float px2 = px + pi_2;
    vec2 sinOffset = sin(vec2(px, px2) + tSpeed1) * wob1;
    vec2 cosOffset = cos(vec2(px, px2) + tSpeed2) * wob2;

    vec2 yz = p.yz;
    float pxLt = px + lt;
    k.x = max(pxLt, length(yz - sinOffset) - lt);
    k.y = max(pxLt, length(yz - cosOffset) - lt);

    float current = min(k.x, k.y);
    s = min(s, current);
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }

  float sqrtD = sqrt(d);
  vec3 raw = max(cos(d * pi2) - s * sqrtD - vec3(k, 0.0), 0.0);
  raw.gb += 0.1;
  float maxC = max(raw.r, max(raw.g, raw.b));
  if (maxC < 0.15) discard;
  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));
  float w1 = max(0.0, 1.0 - k.x * 2.0);
  float w2 = max(0.0, 1.0 - k.y * 2.0);
  float wt = w1 + w2 + 0.001;
  vec3 c = (uColor1 * w1 + uColor2 * w2) / wt * lum * 3.5;
  C = vec4(c, 1.0);
}

void main() {
  vec2 coord = gl_FragCoord.xy + uOffset;
  coord -= 0.5 * iResolution;
  float c = cos(uRotation), s = sin(uRotation);
  coord = mat2(c, -s, s, c) * coord;
  coord += 0.5 * iResolution;

  vec4 color;
  mainImage(color, coord);
  gl_FragColor = color;
}
`;

const DEFAULT_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)"];

// 把任意 CSS 颜色（hex / rgb / oklch / var(--color-…)）解析成 0–1 RGB。
// shader uniform 只认数值，oklch / var() 无法直接进 GLSL，须先在浏览器侧渲染解析。
// 离屏 1×1 canvas：填色后读像素即得标准化 sRGB（var() 借元素 computed style 求值）。
function resolveColor(input: string, fallback: [number, number, number]): [number, number, number] {
  if (typeof document === "undefined") return fallback;
  try {
    let css = input;
    // var(--…) 需在真实元素上求值（canvas fillStyle 不解析 CSS 变量）
    if (input.includes("var(")) {
      const probe = document.createElement("span");
      probe.style.color = input;
      document.body.appendChild(probe);
      css = getComputedStyle(probe).color || input;
      probe.remove();
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = "#000";
    ctx.fillStyle = css; // 非法值时维持上一次 #000，可控
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  } catch {
    return fallback;
  }
}

const FALLBACK_C1: [number, number, number] = [0.659, 0.333, 0.969]; // 近 chart-1 紫蓝
const FALLBACK_C2: [number, number, number] = [0.024, 0.714, 0.831]; // 近 chart-2 青

export function PlasmaWave({
  colors = DEFAULT_COLORS,
  xOffset = 0,
  yOffset = 0,
  rotationDeg = 0,
  focalLength = 0.8,
  speed1 = 0.05,
  speed2 = 0.05,
  dir2 = 1,
  bend1 = 1,
  bend2 = 0.5,
  className,
  fallback,
}: PlasmaWaveProps) {
  // 运行时 prop 挂 ref，供 RAF 回调直读，避免重建 GL context。
  const propsRef = useRef({
    colors,
    xOffset,
    yOffset,
    rotationDeg,
    focalLength,
    speed1,
    speed2,
    dir2,
    bend1,
    bend2,
  });
  propsRef.current = {
    colors,
    xOffset,
    yOffset,
    rotationDeg,
    focalLength,
    speed1,
    speed2,
    dir2,
    bend1,
    bend2,
  };

  const { ref, reduced } = useGlCanvas(({ ogl, canvas }) => {
    const { Renderer, Program, Mesh, Geometry } = ogl;

    const renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      powerPreference: "high-performance",
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    });

    const resolution = new Float32Array([1, 1]);
    const offset = new Float32Array([xOffset, yOffset]);
    const c1 = resolveColor(colors[0] ?? DEFAULT_COLORS[0]!, FALLBACK_C1);
    const c2 = resolveColor(colors[1] ?? DEFAULT_COLORS[1]!, FALLBACK_C2);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: resolution },
        uOffset: { value: offset },
        uRotation: { value: (rotationDeg * Math.PI) / 180 },
        uFocalLength: { value: focalLength },
        uSpeed1: { value: speed1 },
        uSpeed2: { value: speed2 },
        uDir2: { value: dir2 },
        uBend1: { value: bend1 },
        uBend2: { value: bend2 },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = (w: number, h: number) => {
      const dpr = renderer.dpr;
      renderer.setSize(w || 1, h || 1);
      resolution[0] = (w || 1) * dpr;
      resolution[1] = (h || 1) * dpr;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    resize(canvas.clientWidth, canvas.clientHeight);

    // 仅当颜色字符串变化时才重解析（avoid 每帧建离屏 canvas）
    let lastColor0 = colors[0] ?? DEFAULT_COLORS[0]!;
    let lastColor1 = colors[1] ?? DEFAULT_COLORS[1]!;

    const startTime = performance.now();

    const render = (now: number) => {
      const p = propsRef.current;
      offset[0] = p.xOffset;
      offset[1] = p.yOffset;
      program.uniforms.iTime.value = (now - startTime) * 0.001;
      program.uniforms.uRotation.value = (p.rotationDeg * Math.PI) / 180;
      program.uniforms.uFocalLength.value = p.focalLength;
      program.uniforms.uSpeed1.value = p.speed1;
      program.uniforms.uSpeed2.value = p.speed2;
      program.uniforms.uDir2.value = p.dir2;
      program.uniforms.uBend1.value = p.bend1;
      program.uniforms.uBend2.value = p.bend2;

      const nc0 = p.colors[0] ?? DEFAULT_COLORS[0]!;
      const nc1 = p.colors[1] ?? DEFAULT_COLORS[1]!;
      if (nc0 !== lastColor0) {
        program.uniforms.uColor1.value = resolveColor(nc0, FALLBACK_C1);
        lastColor0 = nc0;
      }
      if (nc1 !== lastColor1) {
        program.uniforms.uColor2.value = resolveColor(nc1, FALLBACK_C2);
        lastColor1 = nc1;
      }

      renderer.render({ scene: mesh });
    };

    return { render, resize };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── reduced-motion / 无 WebGL fallback：静态双色斜向渐变（不消失，吃同款 token）──
  if (reduced) {
    const f0 = colors[0] ?? DEFAULT_COLORS[0]!;
    const f1 = colors[1] ?? DEFAULT_COLORS[1]!;
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn("relative block h-full w-full overflow-hidden", className)}
        style={{
          backgroundImage: `linear-gradient(115deg, ${f0} 0%, transparent 45%, ${f1} 100%)`,
        }}
      >
        {fallback}
      </div>
    );
  }

  return <div ref={ref} aria-hidden className={cn("block h-full w-full", className)} />;
}
