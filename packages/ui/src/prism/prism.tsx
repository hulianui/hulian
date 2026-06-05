"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { PrismProps } from "./prism.types";

// 吸取自 React Bits Prism：ogl 全屏三角 + 光线步进（ray-march）一个各向异性八面体 SDF 的上半，
// 沿光路累加正弦分光，得到一束透明棱镜般折射出的彩虹体积光，支持呼吸摆动 / 三维旋转 / 指针跟随三种姿态。
// 瑚琏化：① shader 算法逐字保留（精确移植，效果不打折）；② 默认色相 hueShift 从主题 --color-chart-1
// 自动推导，使分光偏向主题强调色（明暗自适应），不再写死品牌色；③ 复用 useGlCanvas（懒加载 ogl·代码分割·
// StrictMode 安全新建 canvas·RAF/Resize/离屏暂停·渲染错误兜底不崩页面）；④ reduced-motion / 无 WebGL
// 自动降级为吃 chart token 的径向辉光静态渐变，DOM 始终是根容器一个 div（两态结构一致）。

// ---------------------------------------------------------------------------
// 顶点 shader：OGL Triangle 已在 clip-space 全覆盖视口，直接透传 position。
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// ---------------------------------------------------------------------------
// 片元 shader：与 React Bits 原版逐行一致（ray-march 八面体 SDF + 正弦分光累加 +
// tanh 压缩 + 噪声 + 饱和度 + 色相旋转）。
// ---------------------------------------------------------------------------
const FRAG = /* glsl */ `
precision highp float;

uniform vec2  iResolution;
uniform float iTime;

uniform float uHeight;
uniform float uBaseHalf;
uniform mat3  uRot;
uniform int   uUseBaseWobble;
uniform float uGlow;
uniform vec2  uOffsetPx;
uniform float uNoise;
uniform float uSaturation;
uniform float uScale;
uniform float uHueShift;
uniform float uColorFreq;
uniform float uBloom;
uniform float uCenterShift;
uniform float uInvBaseHalf;
uniform float uInvHeight;
uniform float uMinAxis;
uniform float uPxScale;
uniform float uTimeScale;

vec4 tanh4(vec4 x){
  vec4 e2x = exp(2.0*x);
  return (e2x - 1.0) / (e2x + 1.0);
}

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

float sdOctaAnisoInv(vec3 p){
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
  float m = q.x + q.y + q.z - 1.0;
  return m * uMinAxis * 0.5773502691896258;
}

float sdPyramidUpInv(vec3 p){
  float oct = sdOctaAnisoInv(p);
  float halfSpace = -p.y;
  return max(oct, halfSpace);
}

mat3 hueRotation(float a){
  float c = cos(a), s = sin(a);
  mat3 W = mat3(
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114
  );
  mat3 U = mat3(
     0.701, -0.587, -0.114,
    -0.299,  0.413, -0.114,
    -0.300, -0.588,  0.886
  );
  mat3 V = mat3(
     0.168, -0.331,  0.500,
     0.328,  0.035, -0.500,
    -0.497,  0.296,  0.201
  );
  return W + U * c + V * s;
}

void main(){
  vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

  float z = 5.0;
  float d = 0.0;

  vec3 p;
  vec4 o = vec4(0.0);

  float centerShift = uCenterShift;
  float cf = uColorFreq;

  mat2 wob = mat2(1.0);
  if (uUseBaseWobble == 1) {
    float t = iTime * uTimeScale;
    float c0 = cos(t + 0.0);
    float c1 = cos(t + 33.0);
    float c2 = cos(t + 11.0);
    wob = mat2(c0, c1, c2, c0);
  }

  const int STEPS = 100;
  for (int i = 0; i < STEPS; i++) {
    p = vec3(f, z);
    p.xz = p.xz * wob;
    p = uRot * p;
    vec3 q = p;
    q.y += centerShift;
    d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
    z -= d;
    o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
  }

  o = tanh4(o * o * (uGlow * uBloom) / 1e5);

  vec3 col = o.rgb;
  float n = rand(gl_FragCoord.xy + vec2(iTime));
  col += (n - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);

  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

  if(abs(uHueShift) > 0.0001){
    col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
  }

  gl_FragColor = vec4(col, o.a);
}
`.trim();

// ---------------------------------------------------------------------------
// 欧拉角 → mat3（与原版 setMat3FromEuler 一致，列主序写入 9 位 Float32Array）
// ---------------------------------------------------------------------------
function setMat3FromEuler(
  yawY: number,
  pitchX: number,
  rollZ: number,
  out: Float32Array,
): Float32Array {
  const cy = Math.cos(yawY);
  const sy = Math.sin(yawY);
  const cx = Math.cos(pitchX);
  const sx = Math.sin(pitchX);
  const cz = Math.cos(rollZ);
  const sz = Math.sin(rollZ);

  const r00 = cy * cz + sy * sx * sz;
  const r01 = -cy * sz + sy * sx * cz;
  const r02 = sy * cx;
  const r10 = cx * sz;
  const r11 = cx * cz;
  const r12 = -sx;
  const r20 = -sy * cz + cy * sx * sz;
  const r21 = sy * sz + cy * sx * cz;
  const r22 = cy * cx;

  out[0] = r00;
  out[1] = r10;
  out[2] = r20;
  out[3] = r01;
  out[4] = r11;
  out[5] = r21;
  out[6] = r02;
  out[7] = r12;
  out[8] = r22;
  return out;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------------------
// 从挂载容器读取 --color-chart-1，把它的色相映射为 hueShift 弧度，
// 让棱镜分光整体偏向主题强调色。失败则返回 0（中性彩虹）。
// 用离屏 canvas 解析任意 CSS 颜色（含 oklch/var）为 sRGB 字节后转 HSL 取 H。
// ---------------------------------------------------------------------------
function autoHueFromTheme(el: HTMLElement): number {
  try {
    const raw = getComputedStyle(el).getPropertyValue("--color-chart-1").trim();
    if (!raw) return 0;
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return 0;
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data as unknown as [
      number,
      number,
      number,
    ];
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    if (delta < 1e-4) return 0; // 灰色无明确色相
    let h: number;
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
    // 棱镜默认彩虹大致以红/橙为基准（0 弧度），把主题色相换算成相对偏移弧度。
    return (h / 360) * Math.PI * 2;
  } catch {
    return 0;
  }
}

/**
 * Prism — 棱镜分光 WebGL 背景。
 *
 * 基于 react-bits Prism 原版 GLSL ray-march shader（各向异性八面体 SDF + 正弦分光），
 * 瑚琏化：默认色相吃 `--color-chart-1` token（明暗自适应）；reduced-motion / 无 WebGL
 * 自动降级为径向辉光静态渐变兜底。
 *
 * 用法：放在 `relative overflow-hidden` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Prism animationType="3drotate" glow={1.2} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = "rotate",
  glow = 1,
  offset,
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  timeScale = 0.5,
  className,
  fallback,
}: PrismProps) {
  const offX = offset?.x ?? 0;
  const offY = offset?.y ?? 0;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle } = ogl;

      const H = Math.max(0.001, height);
      const BW = Math.max(0.001, baseWidth);
      const BASE_HALF = BW * 0.5;
      const GLOW = Math.max(0, glow);
      const NOISE = Math.max(0, noise);
      const SAT = transparent ? 1.5 : 1;
      const SCALE = Math.max(0.001, scale);
      const CFREQ = Math.max(0, colorFrequency || 1);
      const BLOOM = Math.max(0, bloom || 1);
      const TS = Math.max(0, timeScale || 1);
      const HOVSTR = Math.max(0, hoverStrength || 1);
      const INERT = Math.max(0, Math.min(1, inertia || 0.12));

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, dpr, alpha: transparent, antialias: false });
      const gl = renderer.gl;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.disable(gl.BLEND);

      // 色相：显式 hueShift 优先；否则从主题 chart-1 自动推导。
      const container = canvas.parentElement as HTMLElement | null;
      const autoHue = container ? autoHueFromTheme(container) : 0;
      const HUE = hueShift != null ? hueShift : autoHue;

      const iResBuf = new Float32Array(2);
      const offsetPxBuf = new Float32Array([offX * dpr, offY * dpr]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iResolution: { value: iResBuf },
          iTime: { value: 0 },
          uHeight: { value: H },
          uBaseHalf: { value: BASE_HALF },
          uUseBaseWobble: { value: animationType === "rotate" ? 1 : 0 },
          uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
          uGlow: { value: GLOW },
          uOffsetPx: { value: offsetPxBuf },
          uNoise: { value: NOISE },
          uSaturation: { value: SAT },
          uScale: { value: SCALE },
          uHueShift: { value: HUE },
          uColorFreq: { value: CFREQ },
          uBloom: { value: BLOOM },
          uCenterShift: { value: H * 0.25 },
          uInvBaseHalf: { value: 1 / BASE_HALF },
          uInvHeight: { value: 1 / H },
          uMinAxis: { value: Math.min(BASE_HALF, H) },
          uPxScale: { value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE) },
          uTimeScale: { value: TS },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        iResBuf[0] = gl.drawingBufferWidth;
        iResBuf[1] = gl.drawingBufferHeight;
        program.uniforms.uPxScale!.value =
          1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 旋转状态
      const rotBuf = new Float32Array(9);
      const rnd = () => Math.random();
      const wX = 0.3 + rnd() * 0.6;
      const wY = 0.2 + rnd() * 0.7;
      const wZ = 0.1 + rnd() * 0.5;
      const phX = rnd() * Math.PI * 2;
      const phZ = rnd() * Math.PI * 2;

      let yaw = 0;
      let pitch = 0;
      let roll = 0;

      // hover：全局指针，归一化到视口中心 [-1,1]
      const pointer = { x: 0, y: 0, inside: true };
      let onPointerMove: ((e: PointerEvent) => void) | null = null;
      let onLeave: (() => void) | null = null;
      let onBlur: (() => void) | null = null;
      if (animationType === "hover" && typeof window !== "undefined") {
        onPointerMove = (e: PointerEvent) => {
          const ww = Math.max(1, window.innerWidth);
          const wh = Math.max(1, window.innerHeight);
          const nx = (e.clientX - ww * 0.5) / (ww * 0.5);
          const ny = (e.clientY - wh * 0.5) / (wh * 0.5);
          pointer.x = Math.max(-1, Math.min(1, nx));
          pointer.y = Math.max(-1, Math.min(1, ny));
          pointer.inside = true;
        };
        onLeave = () => {
          pointer.inside = false;
        };
        onBlur = onLeave;
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("mouseleave", onLeave);
        window.addEventListener("blur", onBlur);
      }

      const t0 = typeof performance !== "undefined" ? performance.now() : 0;

      return {
        render(t: number) {
          const time = (t - t0) * 0.001;
          program.uniforms.iTime!.value = time;

          if (animationType === "hover") {
            const maxPitch = 0.6 * HOVSTR;
            const maxYaw = 0.6 * HOVSTR;
            const targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
            const targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;
            yaw = lerp(yaw, targetYaw, INERT);
            pitch = lerp(pitch, targetPitch, INERT);
            roll = lerp(roll, 0, 0.1);
            program.uniforms.uRot!.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
          } else if (animationType === "3drotate") {
            const tScaled = time * TS;
            yaw = tScaled * wY;
            pitch = Math.sin(tScaled * wX + phX) * 0.6;
            roll = Math.sin(tScaled * wZ + phZ) * 0.5;
            program.uniforms.uRot!.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
          } else {
            // rotate：单位旋转，靠 shader 内 base wobble 摆动
            rotBuf.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
            program.uniforms.uRot!.value = rotBuf;
          }

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
          if (onLeave) window.removeEventListener("mouseleave", onLeave);
          if (onBlur) window.removeEventListener("blur", onBlur);
          program.remove?.();
        },
      };
    },
    [
      height,
      baseWidth,
      animationType,
      glow,
      noise,
      transparent,
      scale,
      hueShift,
      colorFrequency,
      hoverStrength,
      inertia,
      bloom,
      timeScale,
      offX,
      offY,
    ],
  );

  // ---------------------------------------------------------------------------
  // reduced-motion / 无 WebGL：径向辉光静态渐变，保留棱镜的色感与中央聚光。
  // ---------------------------------------------------------------------------
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_50%_70%_at_50%_60%,var(--color-chart-1)_0%,var(--color-chart-3)_45%,transparent_80%)]",
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
