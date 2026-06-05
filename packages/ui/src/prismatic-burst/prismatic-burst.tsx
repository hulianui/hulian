"use client";
// 吸取自 React Bits PrismaticBurst：体积步进（raymarch）的棱镜光爆背景——
// 从中心放射出被光谱渐变染色、可弯曲扭曲、可梳理成 N 瓣的射线，边缘自然衰减。
// 瑚琏化：色带默认吃 `--color-chart-1..5` token（明暗自适应，去掉品牌 hex）；
// 复用 useGlCanvas 的 StrictMode 安全挂载 + 懒加载 ogl（去依赖、base bundle 零成本）；
// "use client" + RSC 安全；reduced-motion / 无 WebGL 自动降级为静态径向光爆 gradient。
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type {
  PrismaticBurstAnimationType,
  PrismaticBurstProps,
} from "./prismatic-burst.types";

// ---------------------------------------------------------------------------
// WebGL2 顶点 shader（全屏三角，clip-space 直出，无需投影矩阵）
// 原版用 ogl 的 Triangle 几何 + #version 300 es；这里照搬保持像素一致。
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// ---------------------------------------------------------------------------
// 棱镜光爆片元 shader
// 原版来自 react-bits（David H Dev）PrismaticBurst 背景：
//   https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/PrismaticBurst/PrismaticBurst.jsx
// 移植要点：
//   ① 完整保留 raymarch（44 步）+ edgeFade + layeredNoise + bendAngle 算法，像素级一致
//   ② uniform 名 uResolution/uTime/uIntensity/uSpeed/uAnimType/uMouse/uColorCount/
//      uDistort/uOffset/uGradient/uNoiseAmount/uRayCount 全部沿用原版
//   ③ 渐变纹理 uGradient 改由瑚琏 token 烘焙（见下方 buildGradientData）
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
  p = floor(p);
  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
  return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 q = rot30() * p;
  float n = 0.0;
  n += 0.40 * hash21(q);
  n += 0.25 * hash21(q * 2.0 + 17.0);
  n += 0.20 * hash21(q * 4.0 + 47.0);
  n += 0.10 * hash21(q * 8.0 + 113.0);
  n += 0.05 * hash21(q * 16.0 + 191.0);
  return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
  float focal = res.y * max(dist, 1e-3);
  return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
  vec2 toC = frag - 0.5 * res - offset;
  float r = length(toC) / (0.5 * min(res.x, res.y));
  float x = clamp(r, 0.0, 1.0);
  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  float s = q * 0.5;
  s = pow(s, 1.5);
  float tail = 1.0 - pow(1.0 - s, 2.0);
  s = mix(s, tail, 0.2);
  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
  return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
  t = clamp(t, 0.0, 1.0);
  return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
  float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
          + 0.7 * sin(q.y * 0.50 - t * 0.5)
          + 0.6 * sin(q.z * 0.60 + t * 0.7);
  return a;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  float t = uTime * uSpeed;
  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
  vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
  float marchT = 0.0;
  vec3 col = vec3(0.0);
  float n = layeredNoise(frag);
  vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
  mat2 M2 = mat2(c.x, c.y, c.z, c.w);
  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

  mat3 rot3dMat = mat3(1.0);
  if(uAnimType == 1){
    vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
    rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
  }
  mat3 hoverMat = mat3(1.0);
  if(uAnimType == 2){
    vec2 m = uMouse * 2.0 - 1.0;
    vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
    hoverMat = rotY(ang.y) * rotX(ang.x);
  }

  for (int i = 0; i < 44; ++i) {
    vec3 P = marchT * dir;
    P.z -= 2.0;
    float rad = length(P);
    vec3 Pl = P * (10.0 / max(rad, 1e-6));

    if(uAnimType == 0){
      Pl.xz *= M2;
    } else if(uAnimType == 1){
      Pl = rot3dMat * Pl;
    } else {
      Pl = hoverMat * Pl;
    }

    float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

    float grow = smoothstep(0.35, 3.0, marchT);
    float a1 = amp * grow * bendAngle(Pl * 0.6, t);
    float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
    vec3 Pb = Pl;
    Pb.xz = rot2(Pb.xz, a1);
    Pb.xy = rot2(Pb.xy, a2);

    float rayPattern = smoothstep(
      0.5, 0.7,
      sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
      sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
    );

    if (uRayCount > 0) {
      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);
    }

    vec3 spectralDefault = 1.0 + vec3(
      cos(marchT * 3.0 + 0.0),
      cos(marchT * 3.0 + 1.0),
      cos(marchT * 3.0 + 2.0)
    );

    float saw = fract(marchT * 0.25);
    float tRay = saw * saw * (3.0 - 2.0 * saw);
    vec3 userGradient = 2.0 * sampleGradient(tRay);
    vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
    vec3 base = (0.05 / (0.4 + stepLen))
              * smoothstep(5.0, 0.0, rad)
              * spectral;

    col += base * rayPattern;
    marchT += stepLen;
  }

  col *= edgeFade(frag, uResolution, uOffset);
  col *= uIntensity;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（各值 0–255 字节）
// 用离屏 1×1 canvas 解析任意 CSS 颜色（hex / oklch / rgb / 计算后的 var()）。
// 浏览器负责所有颜色空间换算，最稳妥。
// ---------------------------------------------------------------------------
function cssColorToBytes(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [255, 255, 255];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]!, d[1]!, d[2]!];
  } catch {
    return [255, 255, 255];
  }
}

// ---------------------------------------------------------------------------
// 解析默认色带：从 canvas 计算样式读 --color-chart-1..5（当前主题）
// 任一 token 解析失败则跳过，全失败时返回空（shader 走内建光谱兜底）。
// ---------------------------------------------------------------------------
function resolveDefaultColors(host: HTMLElement): string[] {
  const cs = getComputedStyle(host);
  const out: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const raw = cs.getPropertyValue(`--color-chart-${i}`).trim();
    if (raw) out.push(raw);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 把色带烘焙成一维 RGBA 纹理数据（每色一像素，shader 内 LINEAR 采样补间）
// ---------------------------------------------------------------------------
function buildGradientData(colors: string[]): { data: Uint8Array; count: number } {
  const capped = colors.slice(0, 64);
  const count = capped.length;
  const data = new Uint8Array(Math.max(count, 1) * 4);
  for (let i = 0; i < count; i++) {
    const [r, g, b] = cssColorToBytes(capped[i]!);
    data[i * 4 + 0] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { data, count };
}

const ANIM_TYPE_MAP: Record<PrismaticBurstAnimationType, number> = {
  rotate: 0,
  rotate3d: 1,
  hover: 2,
};

/**
 * PrismaticBurst — 棱镜光爆 WebGL 背景。
 *
 * 基于 react-bits PrismaticBurst 原版 GLSL（44 步体积 raymarch + 光谱渐变 + 射线梳理 + 边缘衰减），
 * 瑚琏化：色带默认吃 `--color-chart-1..5` token（明暗自适应）；复用 useGlCanvas 懒加载 ogl +
 * StrictMode 安全挂载；reduced-motion / 无 WebGL 自动降级为静态径向光爆。
 *
 * 用法：放在 `relative overflow-hidden` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <PrismaticBurst intensity={2} rayCount={0} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function PrismaticBurst({
  intensity = 2,
  speed = 1,
  animationType = "rotate",
  colors,
  distort = 0,
  noiseAmount = 0,
  rayCount = 0,
  offset,
  mixBlendMode = "none",
  className,
  fallback,
}: PrismaticBurstProps) {
  const offX = offset?.x ?? 0;
  const offY = offset?.y ?? 0;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Texture } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, dpr });
      const gl = renderer.gl;

      // 色带：显式 colors 优先；否则读 chart-1..5 token
      const host = (canvas.parentElement ?? canvas) as HTMLElement;
      const palette =
        colors && colors.length > 0 ? colors : resolveDefaultColors(host);
      const { data, count } = buildGradientData(palette);

      const gradient = new Texture(gl, {
        image: data,
        width: Math.max(count, 1),
        height: 1,
        generateMipmaps: false,
        flipY: false,
      });
      // LINEAR + CLAMP，让 1px-per-color 的色带平滑补间、边缘不溢出
      gradient.minFilter = gl.LINEAR;
      gradient.magFilter = gl.LINEAR;
      gradient.wrapS = gl.CLAMP_TO_EDGE;
      gradient.wrapT = gl.CLAMP_TO_EDGE;

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uResolution: { value: [1, 1] },
          uTime: { value: 0 },
          uIntensity: { value: intensity },
          uSpeed: { value: speed },
          uAnimType: { value: ANIM_TYPE_MAP[animationType] },
          uMouse: { value: [0.5, 0.5] },
          uColorCount: { value: count },
          uDistort: { value: distort },
          uOffset: { value: [offX, offY] },
          uGradient: { value: gradient },
          uNoiseAmount: { value: noiseAmount },
          uRayCount: { value: Math.max(0, Math.floor(rayCount)) },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // 指针平滑跟随（仅 hover 模式有视觉效果，但始终更新无害）
      const mouseTarget: [number, number] = [0.5, 0.5];
      const mouseSmooth: [number, number] = [0.5, 0.5];
      const onPointer = (e: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
        const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
        mouseTarget[0] = Math.min(Math.max(x, 0), 1);
        mouseTarget[1] = Math.min(Math.max(y, 0), 1);
      };
      host.addEventListener("pointermove", onPointer, { passive: true });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uResolution!.value = [
          gl.drawingBufferWidth,
          gl.drawingBufferHeight,
        ];
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      let last = 0;

      return {
        render(now: number) {
          // 指数平滑指针，照原版 hover 阻尼手感
          const dt = last === 0 ? 0 : Math.max(0, now - last) * 0.001;
          last = now;
          const alpha = 1 - Math.exp(-dt / 0.08);
          mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
          mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;

          program.uniforms.uMouse!.value = mouseSmooth;
          program.uniforms.uTime!.value = now * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          host.removeEventListener("pointermove", onPointer);
          try {
            gl.deleteTexture(gradient.texture);
          } catch {
            /* ignore */
          }
          program.remove?.();
        },
      };
    },
    [
      intensity,
      speed,
      animationType,
      colors,
      distort,
      noiseAmount,
      rayCount,
      offX,
      offY,
    ],
  );

  // ---------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：静态径向光爆 gradient（吃 chart token）
  // ---------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_at_center,var(--color-chart-1)_0%,var(--color-chart-3)_30%,transparent_70%)]",
          "opacity-80",
          className,
        )}
        style={
          mixBlendMode && mixBlendMode !== "none"
            ? { mixBlendMode: mixBlendMode as React.CSSProperties["mixBlendMode"] }
            : undefined
        }
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
      style={
        mixBlendMode && mixBlendMode !== "none"
          ? { mixBlendMode: mixBlendMode as React.CSSProperties["mixBlendMode"] }
          : undefined
      }
      aria-hidden
    />
  );
}
