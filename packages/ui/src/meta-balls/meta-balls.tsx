"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { MetaBallsProps } from "./meta-balls.types";

// 吸取自 React Bits MetaBalls：一组 metaball（黏液球）在屏幕上公转游走，靠
// 距离平方反比的势场叠加 + smoothstep 等值面阈值产生「融合 / 分裂」的有机黏连感，
// 外加一个跟随鼠标（或自动巡游）的光标球与主体球在交界处混色。
//
// 瑚琏化要点：
// 1. 颜色全吃 chart token（默认 color=chart-1 / cursorBallColor=chart-4，自动明暗适配），
//    替原版写死的 #ffffff。token 经 var() 解析后用离屏画布转 RGB 喂 shader uniform。
// 2. 去掉原版自管的 Renderer/RAF/resize/loseContext 样板，统一走 useGlCanvas helper：
//    懒加载 ogl（代码分割）、SSR 安全、每次挂载新建 canvas 规避 StrictMode loseContext 毒化、
//    RAF 容错、IntersectionObserver 离屏暂停、ResizeObserver 自适应。
// 3. pointer / 运行时 prop 全部走 ref，setup 闭包不进 deps，避免频繁重建 GL context。
// 4. reduced-motion / 无 WebGL → 静态径向渐变球团 fallback（吃 token，圆形，DOM 不消失）。
// 5. 装饰语义 aria-hidden。

const VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform float iAnimationSize;
uniform int iBallCount;
uniform float iCursorBallSize;
uniform vec3 iMetaBalls[50];
uniform bool enableTransparency;
out vec4 outColor;

float getMetaBallValue(vec2 c, float r, vec2 p) {
  vec2 d = p - c;
  float dist2 = dot(d, d);
  return (r * r) / dist2;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float scale = iAnimationSize / iResolution.y;
  vec2 coord = (fc - iResolution.xy * 0.5) * scale;
  vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;
  float m1 = 0.0;
  for (int i = 0; i < 50; i++) {
    if (i >= iBallCount) break;
    m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord);
  }
  float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);
  float total = m1 + m2;
  float f = smoothstep(-1.0, 1.0, (total - 1.3) / min(1.0, fwidth(total)));
  vec3 cFinal = vec3(0.0);
  if (total > 0.0) {
    float alpha1 = m1 / total;
    float alpha2 = m2 / total;
    cFinal = iColor * alpha1 + iCursorColor * alpha2;
  }
  outColor = vec4(cFinal * f, enableTransparency ? f : 1.0);
}
`;

// ── 工具：哈希函数（移植自原版，生成每个小球的稳定轨道参数）──
function fract(x: number) {
  return x - Math.floor(x);
}

function hash31(p: number): [number, number, number] {
  const r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
  const ryzx = [r[1]!, r[2]!, r[0]!];
  const dotVal =
    r[0]! * (ryzx[0]! + 33.33) +
    r[1]! * (ryzx[1]! + 33.33) +
    r[2]! * (ryzx[2]! + 33.33);
  return [fract(r[0]! + dotVal), fract(r[1]! + dotVal), fract(r[2]! + dotVal)];
}

function hash33(v: [number, number, number]): [number, number, number] {
  const p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
  const pyxz = [p[1]!, p[0]!, p[2]!];
  const dotVal =
    p[0]! * (pyxz[0]! + 33.33) +
    p[1]! * (pyxz[1]! + 33.33) +
    p[2]! * (pyxz[2]! + 33.33);
  const np = [fract(p[0]! + dotVal), fract(p[1]! + dotVal), fract(p[2]! + dotVal)];
  const pxxy = [np[0]!, np[0]!, np[1]!];
  const pyxx = [np[1]!, np[0]!, np[0]!];
  const pzyx = [np[2]!, np[1]!, np[0]!];
  return [
    fract((pxxy[0]! + pyxx[0]!) * pzyx[0]!),
    fract((pxxy[1]! + pyxx[1]!) * pzyx[1]!),
    fract((pxxy[2]! + pyxx[2]!) * pzyx[2]!),
  ];
}

// ── 工具：任意 CSS 颜色（含 token var()/oklch）→ 归一化 RGB（0–1）──
// 原版只支持 #rrggbb；瑚琏喂的是 var(--color-chart-1) 这类 oklch token，
// 用离屏画布让浏览器替我们解析成 rgb，再归一化。失败兜底中性灰。
function resolveColor(input: string): [number, number, number] {
  const fallback: [number, number, number] = [0.8, 0.8, 0.85];
  if (typeof document === "undefined") return fallback;
  try {
    const probe = document.createElement("span");
    probe.style.color = input;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color; // 例 "rgb(98, 116, 255)"
    document.body.removeChild(probe);
    const m = resolved.match(/rgba?\(([^)]+)\)/);
    if (!m) return fallback;
    const parts = m[1]!.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return fallback;
    return [parts[0]! / 255, parts[1]! / 255, parts[2]! / 255];
  } catch {
    return fallback;
  }
}

export function MetaBalls({
  color = "var(--color-chart-1)",
  cursorBallColor = "var(--color-chart-4)",
  speed = 0.3,
  enableMouseInteraction = true,
  hoverSmoothness = 0.05,
  animationSize = 30,
  ballCount = 15,
  clumpFactor = 1,
  cursorBallSize = 3,
  enableTransparency = true,
  className,
  fallback,
}: MetaBallsProps) {
  // 运行时 prop 走 ref，render 回调直接读，不进 setup deps（避免重建 GL context）
  const colorRef = useRef(color);
  const cursorColorRef = useRef(cursorBallColor);
  const speedRef = useRef(speed);
  const enableMouseRef = useRef(enableMouseInteraction);
  const hoverSmoothRef = useRef(hoverSmoothness);
  const animSizeRef = useRef(animationSize);
  const ballCountRef = useRef(ballCount);
  const clumpRef = useRef(clumpFactor);
  const cursorSizeRef = useRef(cursorBallSize);

  colorRef.current = color;
  cursorColorRef.current = cursorBallColor;
  speedRef.current = speed;
  enableMouseRef.current = enableMouseInteraction;
  hoverSmoothRef.current = hoverSmoothness;
  animSizeRef.current = animationSize;
  ballCountRef.current = ballCount;
  clumpRef.current = clumpFactor;
  cursorSizeRef.current = cursorBallSize;

  const { ref, reduced } = useGlCanvas(({ ogl, canvas }) => {
    const { Renderer, Program, Mesh, Triangle, Vec3 } = ogl;

    const renderer = new Renderer({
      canvas,
      dpr: 1,
      alpha: true,
      premultipliedAlpha: false,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, enableTransparency ? 0 : 1);

    const metaBallsUniform: Array<InstanceType<typeof Vec3>> = [];
    for (let i = 0; i < 50; i++) metaBallsUniform.push(new Vec3(0, 0, 0));

    const [r1, g1, b1] = resolveColor(colorRef.current);
    const [r2, g2, b2] = resolveColor(cursorColorRef.current);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(0, 0, 0) },
        iMouse: { value: new Vec3(0, 0, 0) },
        iColor: { value: new Vec3(r1, g1, b1) },
        iCursorColor: { value: new Vec3(r2, g2, b2) },
        iAnimationSize: { value: animSizeRef.current },
        iBallCount: { value: ballCountRef.current },
        iCursorBallSize: { value: cursorSizeRef.current },
        iMetaBalls: { value: metaBallsUniform },
        enableTransparency: { value: enableTransparency },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    // 每个小球的稳定轨道参数（hash 驱动，对 idx 确定性）
    const maxBalls = 50;
    const effectiveBallCount = Math.min(Math.max(ballCountRef.current, 1), maxBalls);
    const ballParams: Array<{
      st: number;
      dtFactor: number;
      baseScale: number;
      toggle: number;
      radius: number;
    }> = [];
    for (let i = 0; i < effectiveBallCount; i++) {
      const h1 = hash31(i + 1);
      const st = h1[0] * (2 * Math.PI);
      const dtFactor = 0.1 * Math.PI + h1[1] * (0.4 * Math.PI - 0.1 * Math.PI);
      const baseScale = 5.0 + h1[1] * (10.0 - 5.0);
      const h2 = hash33(h1);
      const toggle = Math.floor(h2[0] * 2.0);
      const radius = 0.5 + h2[2] * (2.0 - 0.5);
      ballParams.push({ st, dtFactor, baseScale, toggle, radius });
    }

    const mouseBallPos = { x: 0, y: 0 };
    let pointerInside = false;
    let pointerX = 0;
    let pointerY = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (!enableMouseRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      pointerX = (px / rect.width) * gl.canvas.width;
      pointerY = (1 - py / rect.height) * gl.canvas.height;
    };
    const onPointerEnter = () => {
      if (enableMouseRef.current) pointerInside = true;
    };
    const onPointerLeave = () => {
      pointerInside = false;
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const startTime = performance.now();

    const resize = (w: number, h: number) => {
      renderer.setSize(w || 1, h || 1);
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 0);
    };
    resize(canvas.clientWidth, canvas.clientHeight);

    const render = (t: number) => {
      const elapsed = (t - startTime) * 0.001;
      const spd = speedRef.current;
      const clump = clumpRef.current;

      // 同步运行时 prop
      program.uniforms.iAnimationSize.value = animSizeRef.current;
      program.uniforms.iCursorBallSize.value = cursorSizeRef.current;
      program.uniforms.iTime.value = elapsed;

      for (let i = 0; i < effectiveBallCount; i++) {
        const p = ballParams[i]!;
        const dt = elapsed * spd * p.dtFactor;
        const th = p.st + dt;
        const x = Math.cos(th);
        const y = Math.sin(th + dt * p.toggle);
        metaBallsUniform[i]!.set(x * p.baseScale * clump, y * p.baseScale * clump, p.radius);
      }

      let targetX: number;
      let targetY: number;
      if (pointerInside) {
        targetX = pointerX;
        targetY = pointerY;
      } else {
        const cx = gl.canvas.width * 0.5;
        const cy = gl.canvas.height * 0.5;
        const rx = gl.canvas.width * 0.15;
        const ry = gl.canvas.height * 0.15;
        targetX = cx + Math.cos(elapsed * spd) * rx;
        targetY = cy + Math.sin(elapsed * spd) * ry;
      }
      const sm = hoverSmoothRef.current;
      mouseBallPos.x += (targetX - mouseBallPos.x) * sm;
      mouseBallPos.y += (targetY - mouseBallPos.y) * sm;
      program.uniforms.iMouse.value.set(mouseBallPos.x, mouseBallPos.y, 0);

      renderer.render({ scene: mesh });
    };

    const dispose = () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };

    return { render, resize, dispose };
    // 颜色 / ballCount 变化时重建（影响 hash 轨道数 + clearColor + uniform 初值）
  }, [color, cursorBallColor, ballCount, enableTransparency]);

  // reduced-motion / 无 WebGL fallback：静态径向渐变球团（吃 token，DOM 不消失）
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn(
          "block h-full w-full overflow-hidden",
          "bg-[radial-gradient(circle_at_38%_42%,var(--color-chart-1)_0%,transparent_28%),radial-gradient(circle_at_64%_58%,var(--color-chart-4)_0%,transparent_30%),radial-gradient(circle_at_52%_50%,var(--color-chart-1)_0%,transparent_22%)]",
          className,
        )}
      >
        {fallback}
      </div>
    );
  }

  return <div ref={ref} aria-hidden className={cn("block h-full w-full", className)} />;
}
