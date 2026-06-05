"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { HyperspeedProps } from "./hyperspeed.types";

// 吸取自 React Bits Hyperspeed：原版用 three.js + postprocessing 渲染一条无尽公路 —
// 两侧车灯拖出光带、灯柱飞掠、turbulentDistortion 让路面湍流弯曲、Bloom 辉光，营造"超空间跃迁"加速感。
// 瑚琏化：
//   1. 去依赖 —— three.js / postprocessing / Bloom / SMAA 全部禁用，改用 ogl 单 shader 重构：
//      从消失点放射的光带流向观察者（warp tunnel），程序化辉光替代后处理 Bloom，零运行时新依赖。
//   2. token —— 左/右车灯色默认吃 chart token（紫红 chart-4 / 青蓝 chart-2，原版 leftCars/rightCars 同色系），
//      可经 leftColor/rightColor 传任意 CSS 颜色；颜色经离屏 canvas 解析为 0..1 sRGB 喂 uniform。
//   3. RSC —— "use client" + ogl 懒加载（useGlCanvas 代码分割，非 WebGL 用户零成本）。
//   4. reduced-motion / 无 WebGL —— 自动降级为静态径向隧道渐变兜底（chart token），DOM 结构同形不卸载内容。

const VERT = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// 程序化 warp 隧道：以屏幕中心为消失点，沿放射方向生成多条「向观察者冲来」的光带。
// 用极坐标 (ang, len)：ang 决定光带落在哪条车道（量化到 density 条），len + 时间相位决定纵深推进。
const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uRes;
  uniform float uSpeed;
  uniform float uDensity;
  uniform float uDistortion;
  uniform float uFade;
  uniform vec3  uLeft;
  uniform vec3  uRight;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    // 归一化到以中心为原点、纵横比修正的坐标
    vec2 uv = (vUv - 0.5);
    uv.x *= uRes.x / max(uRes.y, 1.0);

    // turbulentDistortion 近似：随纵深与时间让道路左右湍流摆动
    float r = length(uv);
    float ang = atan(uv.y, uv.x);
    float sway =
      sin(r * 6.0 - uTime * 1.3) * 0.06 +
      sin(r * 11.0 + uTime * 0.7) * 0.03;
    uv.x += sway * uDistortion;

    // 重新求极坐标（含扰动）
    r = max(length(uv), 1e-4);
    ang = atan(uv.y, uv.x);

    // 把角度量化成 density 条车道，每条灯带一个随机相位/亮度/左右归属
    float lanes = max(uDensity, 1.0);
    float laneF = (ang / 6.2831853 + 0.5) * lanes;
    float lane = floor(laneF);
    float laneFrac = fract(laneF);

    // 灯带横向轮廓：靠车道中线最亮，向两侧衰减（细长光带）
    float across = smoothstep(0.5, 0.0, abs(laneFrac - 0.5));

    // 纵深推进：1/r 把屏幕中心（消失点）映射到无穷远，叠加时间形成「冲来」错觉
    float seed = hash(lane * 1.37);
    float depth = 1.0 / r;
    float travel = depth * 0.35 + uTime * (0.6 + seed * 0.8) * uSpeed + seed * 10.0;
    // 沿光带方向的明暗脉冲，制造一段段拖尾的车灯
    float streak = pow(fract(travel) , 3.0);
    streak = smoothstep(0.0, 1.0, streak);

    // 远处（r 小 = 靠近消失点）淡出，营造纵深雾化
    float fog = smoothstep(0.0, 0.55 + uFade * 0.4, r);

    float intensity = across * streak * fog;

    // 左右车道分色：lane 落在前半 = 左灯，后半 = 右灯
    float side = step(lanes * 0.5, lane);
    vec3 col = mix(uLeft, uRight, side);

    // 程序化辉光（替代 Bloom）：强度做幂次提亮 + 核心泛白
    vec3 glow = col * intensity * 1.8;
    glow += vec3(pow(intensity, 3.0)) * 0.5;

    gl_FragColor = vec4(glow, 1.0);
  }
`;

// 把任意 CSS 颜色解析成 0..1 sRGB —— 浏览器负责所有色彩空间换算（hex/oklch/rgb/var() 计算值皆可）。
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.5, 0.5, 0.5];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.5, 0.5, 0.5];
  }
}

// 读 canvas 计算样式里的 chart token（挂载时 canvas 已在 DOM，能拿到当前主题值）
function resolveToken(canvas: HTMLCanvasElement, name: string, fb: [number, number, number]) {
  const raw = getComputedStyle(canvas).getPropertyValue(name).trim();
  if (!raw) return fb;
  return cssColorToRgb01(raw);
}

export function Hyperspeed({
  speed = 1,
  density = 40,
  distortion = 1,
  fade = 0.4,
  leftColor,
  rightColor,
  className,
  fallback,
  style,
}: HyperspeedProps) {
  // 运行时 prop 挂 ref，render 回调直接读，避免每次变更重建 GL context
  const speedRef = useRef(speed);
  const densityRef = useRef(density);
  const distortionRef = useRef(distortion);
  const fadeRef = useRef(fade);
  speedRef.current = speed;
  densityRef.current = density;
  distortionRef.current = distortion;
  fadeRef.current = fade;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const renderer = new Renderer({ canvas, alpha: false, dpr });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 1);

      // 左右车灯色：显式 prop 优先，否则吃 chart token（chart-4 紫红 / chart-2 青蓝）
      const [lr, lg, lb] = leftColor
        ? cssColorToRgb01(leftColor)
        : resolveToken(canvas, "--color-chart-4", [0.82, 0.34, 0.75]);
      const [rr, rg, rb] = rightColor
        ? cssColorToRgb01(rightColor)
        : resolveToken(canvas, "--color-chart-2", [0.01, 0.7, 0.76]);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new Vec2(1, 1) },
          uSpeed: { value: speed },
          uDensity: { value: density },
          uDistortion: { value: distortion },
          uFade: { value: fade },
          uLeft: { value: new Color(lr, lg, lb) },
          uRight: { value: new Color(rr, rg, rb) },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uRes!.value.set((w || 1) * renderer.dpr, (h || 1) * renderer.dpr);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001;
          program.uniforms.uSpeed!.value = speedRef.current;
          program.uniforms.uDensity!.value = densityRef.current;
          program.uniforms.uDistortion!.value = distortionRef.current;
          program.uniforms.uFade!.value = fadeRef.current;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    // leftColor/rightColor 影响初始 uniform，变更需重建拿新色；其余运行时走 ref
    [leftColor, rightColor],
  );

  // reduced-motion / 无 WebGL：静态径向隧道渐变兜底（chart token，DOM 同形）
  if (reduced) {
    return (
      <div
        aria-hidden
        style={style}
        className={cn(
          "relative block h-full w-full overflow-hidden",
          "[background:radial-gradient(circle_at_center,var(--color-chart-2)_0%,var(--color-chart-4)_30%,#000_75%)]",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      style={style}
      className={cn("block h-full w-full bg-black", className)}
    />
  );
}
