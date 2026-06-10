"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { PixelBlastProps, PixelBlastVariant } from "./pixel-blast.types";

// 吸取自 React Bits PixelBlast：FBM 体噪声 + 8×8 Bayer 有序抖动（dithering）把连续噪声量化成
// 一格格亮/灭的像素方块，再按 square/circle/triangle/diamond 形状蒙版绘制，配合四周渐隐——
// 一片随时间翻涌、复古点阵质感的交互式背景。
//
// 瑚琏化要点：
// 1. 去三方依赖：原版用 three.js + postprocessing（EffectComposer 液化/噪声后处理），全部禁用。
//    核心抖动点阵 shader 移植到 ogl（GLSL ES 1.0），经 useGlCanvas 共享生命周期帮手渲染。
//    被砍掉的 liquid（触摸液化）/ noiseAmount（颗粒后处理）/ click-ripple（点击涟漪）需要额外
//    后处理 pass 与指针管线，超出零依赖边界，故移除——保留最核心的抖动点阵 + 形状 + 渐隐。
// 2. 颜色吃 token：默认主色读 --color-primary（明暗自适应），替原版写死的 #B497CF。
// 3. RSC/StrictMode 安全：useGlCanvas 负责懒加载 ogl、每挂载新建 canvas（避免 loseContext 毒化）、
//    RAF 循环容错、ResizeObserver 自适应、IntersectionObserver 离屏暂停。
// 4. reduced-motion / 无 WebGL：useGlCanvas 返回 reduced → 渲染静态 radial-gradient 点阵兜底
//    （DOM 始终是一个根 div，两态结构一致，不条件卸载内容）。

const SHAPE_MAP: Record<PixelBlastVariant, number> = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
};

// OGL Triangle 提供全屏覆盖几何 + 内建 uv；直接写裁剪空间坐标。
// #version 300 es 必须是 shader 首行（ogl 不会自动加）。
const VERT = /* glsl */ `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// 片元 shader：移植自 react-bits PixelBlast 的核心抖动点阵逻辑。
// ogl Renderer 默认建 WebGL2 上下文，ES 1.00 + GL_OES_standard_derivatives 在
// WebGL2/ANGLE 下不被认可（fwidth 报 no matching overloaded function）——
// 故升级为 GLSL ES 3.0（#version 300 es，fwidth 内建），gl_FragColor → out fragColor。
const FRAG = /* glsl */ `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform float uEdgeFade;
uniform int   uShapeType;

const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;

  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;
  // sRGB gamma：线性 → sRGB，保证颜色输出准确（同原版）。
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(vec3(0.0031308), color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（各值 0–1）：离屏 1×1 canvas 2D context 作万能解析器，
// 浏览器负责 hex / oklch / rgb / color() 等所有颜色空间转换。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.71, 0.59, 0.81]; // 兜底 ≈ 原版 #B497CF
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.71, 0.59, 0.81];
  }
}

// 从挂载后的 canvas 计算样式读取 --color-primary（当前主题下的 token 值）。
function resolvePrimaryToken(canvas: HTMLCanvasElement): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue("--color-primary").trim();
  if (!raw) return [0.71, 0.59, 0.81];
  return cssColorToRgb01(raw);
}

/**
 * PixelBlast — 抖动点阵翻涌的 WebGL 背景。
 *
 * 基于 react-bits PixelBlast：FBM 噪声经 8×8 Bayer 有序抖动量化成像素方块，
 * 按 square/circle/triangle/diamond 形状蒙版绘制 + 四周渐隐。
 * 瑚琏化：去 three.js/postprocessing 依赖（改 ogl）、默认色吃 `--color-primary` token、
 * reduced-motion / 无 WebGL 自动降级为静态点阵 radial-gradient 兜底。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <PixelBlast variant="circle" pixelSize={5} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function PixelBlast({
  variant = "square",
  pixelSize = 4,
  color,
  patternScale = 2,
  patternDensity = 1,
  pixelSizeJitter = 0,
  speed = 0.5,
  edgeFade = 0.5,
  className,
  style,
  fallback,
}: PixelBlastProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      // 解析主色：显式 color prop 优先；否则读 canvas 计算样式里的 primary token。
      const [r, g, b] = color
        ? cssColorToRgb01(color)
        : resolvePrimaryToken(canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uColor: { value: new Color(r, g, b) },
          uResolution: { value: new Vec2(1, 1) },
          uTime: { value: 0 },
          uPixelSize: { value: pixelSize * dpr },
          uScale: { value: patternScale },
          uDensity: { value: patternDensity },
          uPixelJitter: { value: pixelSizeJitter },
          uEdgeFade: { value: edgeFade },
          uShapeType: { value: SHAPE_MAP[variant] ?? 0 },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        const rdpr = renderer.dpr;
        renderer.setSize(w || 1, h || 1);
        // 物理像素分辨率 = CSS 尺寸 × dpr（与 setSize 后的 drawingBuffer 一致）。
        program.uniforms.uResolution!.value.set((w || 1) * rdpr, (h || 1) * rdpr);
        // 像素尺寸亦按 dpr 换算到物理像素，保持视觉尺寸跨屏一致。
        program.uniforms.uPixelSize!.value = pixelSize * rdpr;
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
    [variant, pixelSize, color, patternScale, patternDensity, pixelSizeJitter, speed, edgeFade],
  );

  // reduced-motion / 无 WebGL：静态点阵兜底——radial-gradient 圆点平铺模拟像素网点。
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(var(--color-primary)_22%,transparent_24%)]",
          "[background-size:8px_8px] opacity-60",
          className,
        )}
        style={style}
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
      style={style}
      aria-hidden
    />
  );
}
