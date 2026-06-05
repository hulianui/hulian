"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { MetallicPaintProps } from "./metallic-paint.types";

// 吸取自 React Bits MetallicPaint：用 WebGL 片元 shader 把一张图形 alpha 蒙版渲染成
// 流动的液态金属/水银漆面 —— 多层 fbm 噪声驱动液态扰动 + 折射（RGB 三通道错位制造
// 虹彩色散）+ 金属条纹梯度（mG 多段 smoothstep）+ 菲涅尔轮缘高光。
//
// 瑚琏化要点：
// 1. 去依赖：原版需 import 一张 SVG/PNG 经 canvas2d 预处理成 alpha + 距离场纹理才能跑。
//    瑚琏化改为「无图」全屏装饰背景——用程序化径向 shape mask（cv 曲率项）替代采样纹理，
//    保留原版 fl/rO/bO 流动·折射·金属梯度全部数学，作铺满容器的金属漆面背景。
// 2. Three.js/裸 WebGL → OGL（同 silk/orb/aurora，懒加载代码分割，base bundle 不含 ogl）。
// 3. 颜色全吃 token：高光默认 --color-chart-1、暗部默认 --color-foreground（明暗自适应），
//    替原版写死的 lightColor/darkColor 十六进制。
// 4. RSC：经 useGlCanvas 仅客户端 effect 内建 GL，StrictMode 双挂载安全（每次挂载新建 canvas）。
// 5. reduced-motion / 无 WebGL：自动降级为吃 token 的金属质感 linear-gradient 静态兜底（不消失）。

// ---------------------------------------------------------------------------
// OGL 全屏三角顶点 shader（同 silk：Triangle 几何体已在 clip-space 全覆盖视口）
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
// 液态金属片元 shader
// 移植自 react-bits MetallicPaint（David H Dev）的 fragmentShader：
//   https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/MetallicPaint/MetallicPaint.jsx
// 改造：
//   ① 去掉 u_tex / u_imgRatio / shapeMask 采样 —— 改用程序化 cv 曲率 + 径向蒙版替代距离场 dp
//   ② fbm 噪声链（pW/aF/lM）原样保留，驱动 wave/distort/液态扰动
//   ③ mG 多段金属梯度原样保留（金属漆条纹的灵魂）
//   ④ 折射 rO/bO 三通道错位原样保留（虹彩色散）
//   ⑤ 颜色 uniform u_lightColor/u_darkColor 由 JS 解析 token 后传入
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime, uRatio, uSeed, uScale, uRefract, uBlur, uLiquid;
uniform float uAngle, uDistort;
uniform vec3  uLight, uDark;

vec3 sC, sM;

vec3 pW(vec3 v) {
  vec3 i = floor(v), f = fract(v), s = sign(fract(v * 0.5) - 0.5);
  vec3 h = fract(sM * i + i.yzx), c = f * (f - 1.0);
  return s * c * ((h * 16.0 - 4.0) * c - 1.0);
}

vec3 aF(vec3 b, vec3 c) {
  return pW(b + c.zxy - pW(b.zxy + c.yzx) + pW(b.yzx + c.xyz));
}

vec3 lM(vec3 s, vec3 p) { return (p + aF(s, p)) * 0.5; }

vec2 rot(vec2 p, float r) {
  float c = cos(r), s = sin(r);
  return vec2(p.x * c + p.y * s, p.y * c - p.x * s);
}

float mG(float hi, float lo, float t, float sh, float cv) {
  float ci = smoothstep(0.15, 0.85, cv), r = lo;
  float e1 = 0.08 / uScale;
  r = mix(r, hi, smoothstep(0.0, sh * 1.5, t));
  r = mix(r, lo, smoothstep(e1 - sh, e1 + sh, t));
  float e2 = e1 + 0.05 / uScale * (1.0 - ci * 0.35);
  r = mix(r, hi, smoothstep(e2 - sh, e2 + sh, t));
  float e3 = e2 + 0.025 / uScale * (1.0 - ci * 0.45);
  r = mix(r, lo, smoothstep(e3 - sh, e3 + sh, t));
  float e4 = e1 + 0.1 / uScale;
  r = mix(r, hi, smoothstep(e4 - sh, e4 + sh, t));
  float rm = 1.0 - e4, gT = clamp((t - e4) / rm, 0.0, 1.0);
  r = mix(r, mix(hi, lo, smoothstep(0.0, 1.0, gT)), smoothstep(e4 - sh * 0.5, e4 + sh * 0.5, t));
  return r;
}

void main() {
  sC = fract(vec3(0.7548, 0.5698, 0.4154) * (uSeed + 17.31)) + 0.5;
  sM = fract(sC.zxy - sC.yzx * 1.618);

  vec2 sc = vec2(vUv.x * uRatio, vUv.y);
  float angleRad = uAngle * 3.14159 / 180.0;
  sc = rot(sc - 0.5, angleRad) + 0.5;
  sc = clamp(sc, 0.0, 1.0);

  float sl = sc.x - sc.y;
  float an = uTime;

  // 程序化形状蒙版 + 曲率（替原版的距离场纹理）
  vec2 fC = sc - 0.5;
  float rd = length(fC + vec2(0.0, sl * 0.15));
  float cv = 1.0 - pow(rd * 1.65, 1.15);
  cv *= pow(max(sc.y, 0.001), 0.35);
  cv = clamp(cv, 0.0, 1.0);
  float dp = smoothstep(0.0, 0.9, cv); // 程序化"深度"代替 texture.r

  vec3 hi = uLight;
  vec3 lo = uDark;
  lo.b += smoothstep(0.6, 1.4, sc.x + sc.y) * 0.08;

  vec2 ag = rot(fC, (0.22 - sl * 0.18) * 3.14159);

  // fbm 流动场
  float mT = an * 0.0625;
  vec3 wO = vec3(-1.05, 1.35, 1.55);
  vec3 wA = aF(vec3(31.0, 73.0, 56.0), mT + wO) * 0.22;
  vec3 wB = aF(vec3(24.0, 64.0, 42.0), mT - wO.yzx) * 0.22;
  vec2 nC = sc * 45.0;
  nC += aF(sC.zxy, an * 0.17 * sC.yzx - sc.yxy * 0.35).xy * 18.0;
  vec3 tC = vec3(0.00041, 0.00053, 0.00076) * mT + wB * nC.x + wA * nC.y;
  tC = lM(sC, tC);
  tC = lM(sC + 1.618, tC);
  float tb = sin(tC.x * 3.14159) * 0.5 + 0.5;
  tb = tb * 2.0 - 1.0;

  float noiseVal = pW(vec3(sc * 8.0 + an, an * 0.5)).x;
  float edgeFactor = smoothstep(0.0, 0.5, dp) * smoothstep(1.0, 0.5, dp);

  // 液态扰动深度
  float lD = dp + (1.0 - dp) * uLiquid * tb;
  lD += noiseVal * uDistort * 0.15 * edgeFactor;

  float rB = clamp(1.0 - cv, 0.0, 1.0);
  float fl = ag.x + sl;
  fl += noiseVal * sl * uDistort * edgeFactor;
  float eI = smoothstep(0.0, 1.0, lD) * smoothstep(1.0, 0.0, lD);
  fl -= tb * sl * 1.8 * eI;
  float cA = cv * clamp(pow(max(sc.y, 0.001), 0.12), 0.25, 1.0);
  fl *= 0.12 + (1.05 - lD) * cA;
  fl *= smoothstep(1.0, 0.65, lD);
  float vA1 = smoothstep(0.08, 0.18, sc.y) * smoothstep(0.38, 0.18, sc.y);
  float vA2 = smoothstep(0.08, 0.18, 1.0 - sc.y) * smoothstep(0.38, 0.18, 1.0 - sc.y);
  fl += vA1 * 0.16 + vA2 * 0.025;
  fl *= 0.45 + pow(sc.y, 2.0) * 0.55;
  fl *= uScale;
  fl -= an;

  // 折射：RGB 三通道错位
  float rO = rB + cv * tb * 0.025;
  rO -= sl;
  float bO = rB * 1.25;
  bO -= lD * 0.18;
  rO *= uRefract;
  bO *= uRefract;

  float sf = uBlur;
  float rP = fract(fl + rO);
  float rC = mG(hi.r, lo.r, rP, sf + 0.018 + uRefract * cv * 0.025, cv);
  float gP = fract(fl);
  float gC = mG(hi.g, lo.g, gP, sf + 0.008 / max(0.01, 1.0 - sl), cv);
  float bP = fract(fl - bO);
  float bC = mG(hi.b, lo.b, bP, sf + 0.008, cv);

  vec3 col = vec3(rC, gC, bC);
  col = clamp(col, 0.0, 1.0);

  // 径向 alpha：形状蒙版边缘羽化
  float vs = smoothstep(0.0, 0.12, cv);
  gl_FragColor = vec4(col, vs);
}
`.trim();

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）—— 离屏 1×1 canvas 让浏览器负责全格式颜色空间转换
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.85, 0.85, 0.9];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.85, 0.85, 0.9];
  }
}

// 从容器计算样式读取 token 颜色（挂载时已在 DOM 中，getComputedStyle 拿当前主题值）
function resolveToken(
  el: HTMLElement,
  name: string,
  fallbackRgb: [number, number, number],
): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  if (!raw) return fallbackRgb;
  return cssColorToRgb01(raw);
}

/**
 * MetallicPaint — 液态金属漆面 WebGL 装饰背景。
 *
 * 移植自 react-bits MetallicPaint 的金属漆 GLSL shader（fbm 液态扰动 + 折射色散 +
 * 多段金属条纹梯度 + 菲涅尔轮缘）。瑚琏化：去掉对图片纹理的依赖，改为程序化全屏背景；
 * 高光/暗部颜色吃 `--color-chart-1` / `--color-foreground` token（明暗自适应）；
 * reduced-motion / 无 WebGL 自动降级为金属质感 linear-gradient 静态兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
 *   <MetallicPaint speed={1.2} liquid={0.8} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function MetallicPaint({
  lightColor,
  darkColor,
  speed = 1,
  scale = 1,
  refraction = 1,
  liquid = 0.6,
  blur = 0.6,
  angle = -45,
  className,
  fallback,
}: MetallicPaintProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 高光：显式 lightColor 优先，否则读 chart-1 token；暗部：darkColor 优先否则 foreground
      const [lr, lg, lb] = lightColor
        ? cssColorToRgb01(lightColor)
        : resolveToken(canvas, "--color-chart-1", [0.85, 0.85, 0.9]);
      const [dr, dg, db] = darkColor
        ? cssColorToRgb01(darkColor)
        : resolveToken(canvas, "--color-foreground", [0.1, 0.1, 0.12]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uRatio: { value: 1 },
          uSeed: { value: 3.7 },
          uScale: { value: scale },
          uRefract: { value: refraction },
          uBlur: { value: blur },
          uLiquid: { value: liquid },
          uAngle: { value: angle },
          uDistort: { value: 1 },
          uLight: { value: new Color(lr, lg, lb) },
          uDark: { value: new Color(dr, dg, db) },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        const ww = w || 1;
        const hh = h || 1;
        renderer.setSize(ww, hh);
        program.uniforms.uRatio!.value = ww / hh;
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001 * speed;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [lightColor, darkColor, speed, scale, refraction, liquid, blur, angle],
  );

  // reduced-motion / 无 WebGL：金属质感静态渐变兜底
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:linear-gradient(135deg,var(--color-foreground)_0%,var(--color-chart-1)_35%,var(--color-foreground)_55%,var(--color-chart-1)_75%,var(--color-foreground)_100%)]",
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
