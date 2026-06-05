"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { MagicRingsProps } from "./magic-rings.types";

// 吸取自 React Bits MagicRings：一组同心光环在 GLSL 中循环扩张/淡入淡出，按层数在双色间插值，
// 叠加颗粒噪点 + 可选鼠标视差/悬停缩放/点击爆发，呈"魔法波纹"质感。
// 瑚琏化：
//   1. 去 three.js 依赖 → 改用 ogl（与 Aurora/Silk/Orb 同栈），经 useGlCanvas 共享生命周期
//      （懒加载 ogl·StrictMode 安全 canvas·离屏暂停·RAF 单帧抛错不崩·无 WebGL 静默降级）。
//   2. 颜色不再写死品牌 hex，默认吃 chart token（var(--color-chart-1/4)，自动明暗适配）；
//      任意 CSS 颜色字符串经容器内探针元素 getComputedStyle 解析为 RGB 喂 shader。
//   3. 全屏 Triangle 取代 PlaneGeometry + OrthographicCamera，片元逻辑（ring/fade/noise）原样保留。
//   4. reduced-motion / 无 WebGL → useGlCanvas 返回 reduced，渲染静态同心环径向渐变 fallback（吃 token）。
//   5. props 全程通过 ref 同步进 RAF，避免重建 GL context；事件挂容器，鼠标视差平滑插值。

const VERT = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// 片元着色器：原 React Bits 逻辑移植（ring 扩张 + fade 生命周期 + 角向裂口 + 噪点）。
const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime, uAttenuation, uLineThickness;
  uniform float uBaseRadius, uRadiusStep, uScaleRate;
  uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
  uniform float uFadeIn, uFadeOut;
  uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
  uniform vec2 uResolution, uMouse;
  uniform vec3 uColor, uColorTwo;
  uniform int uRingCount;

  const float HP = 1.5707963;
  const float CYCLE = 3.45;

  float fade(float t) {
    return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
  }

  float ring(vec2 p, float ri, float cut, float t0, float px) {
    float t = mod(uTime + t0, CYCLE);
    float r = ri + t / CYCLE * uScaleRate;
    float d = abs(length(p) - r);
    float a = atan(abs(p.y), abs(p.x)) / HP;
    float th = max(1.0 - a, 0.5) * px * uLineThickness;
    float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
    d += pow(cut * a, 3.0) * r;
    return h * exp(-uAttenuation * d) * fade(t);
  }

  void main() {
    float px = 1.0 / min(uResolution.x, uResolution.y);
    vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
    float cr = cos(uRotation), sr = sin(uRotation);
    p = mat2(cr, -sr, sr, cr) * p;
    p -= uMouse * uMouseInfluence;
    float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
    p /= sc;
    vec3 c = vec3(0.0);
    float rcf = max(float(uRingCount) - 1.0, 1.0);
    for (int i = 0; i < 10; i++) {
      if (i >= uRingCount) break;
      float fi = float(i);
      vec2 pr = p - fi * uParallax * uMouse;
      vec3 rc = mix(uColor, uColorTwo, fi / rcf);
      c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
    }
    c *= 1.0 + uBurst * 2.0;
    float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
    c += (n - 0.5) * uNoiseAmount;
    gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)) * uOpacity);
  }
`;

const DEFAULT_COLOR = "var(--color-chart-1)";
const DEFAULT_COLOR_TWO = "var(--color-chart-4)";

/** 把任意 CSS 颜色字符串经探针元素解析为归一化 RGB（0–1）三元组。
 *  探针挂进真实容器，var(--…) token 才能按级联解析；失败回退到一个中性紫蓝色。 */
function resolveRgb(color: string, host: HTMLElement): [number, number, number] {
  try {
    const probe = document.createElement("span");
    probe.style.color = color;
    probe.style.display = "none";
    host.appendChild(probe);
    const computed = getComputedStyle(probe).color; // "rgb(r, g, b)" / "rgba(...)"
    host.removeChild(probe);
    const m = computed.match(/[\d.]+/g);
    if (m && m.length >= 3) {
      return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
    }
  } catch {
    /* 解析失败：落到默认色 */
  }
  return [0.61, 0.26, 0.99];
}

export function MagicRings({
  color = DEFAULT_COLOR,
  colorTwo = DEFAULT_COLOR_TWO,
  speed = 1,
  ringCount = 6,
  attenuation = 10,
  lineThickness = 2,
  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,
  opacity = 1,
  blur = 0,
  noiseAmount = 0.1,
  rotation = 0,
  ringGap = 1.5,
  fadeIn = 0.7,
  fadeOut = 0.5,
  followMouse = false,
  mouseInfluence = 0.2,
  hoverScale = 1.2,
  parallax = 0.05,
  clickBurst = false,
  className,
}: MagicRingsProps) {
  // 全部 prop 挂 ref，让 RAF 回调读最新值，不重建 GL context。
  const p = {
    color,
    colorTwo,
    speed,
    ringCount,
    attenuation,
    lineThickness,
    baseRadius,
    radiusStep,
    scaleRate,
    opacity,
    noiseAmount,
    rotation,
    ringGap,
    fadeIn,
    fadeOut,
    followMouse,
    mouseInfluence,
    hoverScale,
    parallax,
    clickBurst,
  };
  const propsRef = useRef(p);
  propsRef.current = p;

  // 鼠标 / 悬停 / 爆发运行时状态
  const mouseRef = useRef<[number, number]>([0, 0]);
  const smoothMouseRef = useRef<[number, number]>([0, 0]);
  const hoverAmountRef = useRef(0);
  const isHoveredRef = useRef(false);
  const burstRef = useRef(0);

  const { ref, reduced } = useGlCanvas(({ ogl, canvas }) => {
    const { Renderer, Program, Mesh, Triangle, Vec2, Vec3, Color } = ogl;

    const renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const host = canvas.parentElement ?? canvas;
    const c0 = resolveRgb(propsRef.current.color, host);
    const c1 = resolveRgb(propsRef.current.colorTwo, host);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uAttenuation: { value: attenuation },
        uResolution: { value: new Vec2(1, 1) },
        uColor: { value: new Color(c0[0], c0[1], c0[2]) },
        uColorTwo: { value: new Color(c1[0], c1[1], c1[2]) },
        uLineThickness: { value: lineThickness },
        uBaseRadius: { value: baseRadius },
        uRadiusStep: { value: radiusStep },
        uScaleRate: { value: scaleRate },
        uRingCount: { value: ringCount },
        uOpacity: { value: opacity },
        uNoiseAmount: { value: noiseAmount },
        uRotation: { value: 0 },
        uRingGap: { value: ringGap },
        uFadeIn: { value: fadeIn },
        uFadeOut: { value: fadeOut },
        uMouse: { value: new Vec2(0, 0) },
        uMouseInfluence: { value: 0 },
        uHoverAmount: { value: 0 },
        uHoverScale: { value: hoverScale },
        uParallax: { value: parallax },
        uBurst: { value: 0 },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms;

    // 上次解析的颜色字符串，变化时才重新解析（探针有 DOM 成本）
    let lastColor = propsRef.current.color;
    let lastColorTwo = propsRef.current.colorTwo;

    const resize = (w: number, h: number) => {
      const dpr = renderer.dpr;
      renderer.setSize(w || 1, h || 1);
      u.uResolution.value.set((w || 1) * dpr, (h || 1) * dpr);
    };
    resize(canvas.clientWidth, canvas.clientHeight);

    // ── 事件：鼠标视差 / 悬停 / 点击爆发 ──
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current[0] = (e.clientX - rect.left) / rect.width - 0.5;
      mouseRef.current[1] = -((e.clientY - rect.top) / rect.height - 0.5);
    };
    const onEnter = () => {
      isHoveredRef.current = true;
    };
    const onLeave = () => {
      isHoveredRef.current = false;
      mouseRef.current[0] = 0;
      mouseRef.current[1] = 0;
    };
    const onClick = () => {
      burstRef.current = 1;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerenter", onEnter);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    const render = (t: number) => {
      const pr = propsRef.current;

      // 平滑插值鼠标 / 悬停 / 爆发
      smoothMouseRef.current[0] += (mouseRef.current[0] - smoothMouseRef.current[0]) * 0.08;
      smoothMouseRef.current[1] += (mouseRef.current[1] - smoothMouseRef.current[1]) * 0.08;
      hoverAmountRef.current += ((isHoveredRef.current ? 1 : 0) - hoverAmountRef.current) * 0.08;
      burstRef.current *= 0.95;
      if (burstRef.current < 0.001) burstRef.current = 0;

      // 颜色字符串变了才重新解析
      if (pr.color !== lastColor) {
        lastColor = pr.color;
        const rgb = resolveRgb(pr.color, host);
        u.uColor.value.set(rgb[0], rgb[1], rgb[2]);
      }
      if (pr.colorTwo !== lastColorTwo) {
        lastColorTwo = pr.colorTwo;
        const rgb = resolveRgb(pr.colorTwo, host);
        u.uColorTwo.value.set(rgb[0], rgb[1], rgb[2]);
      }

      u.uTime.value = t * 0.001 * pr.speed;
      u.uAttenuation.value = pr.attenuation;
      u.uLineThickness.value = pr.lineThickness;
      u.uBaseRadius.value = pr.baseRadius;
      u.uRadiusStep.value = pr.radiusStep;
      u.uScaleRate.value = pr.scaleRate;
      u.uRingCount.value = Math.max(1, Math.min(10, Math.round(pr.ringCount)));
      u.uOpacity.value = pr.opacity;
      u.uNoiseAmount.value = pr.noiseAmount;
      u.uRotation.value = (pr.rotation * Math.PI) / 180;
      u.uRingGap.value = pr.ringGap;
      u.uFadeIn.value = pr.fadeIn;
      u.uFadeOut.value = pr.fadeOut;
      u.uMouse.value.set(smoothMouseRef.current[0], smoothMouseRef.current[1]);
      u.uMouseInfluence.value = pr.followMouse ? pr.mouseInfluence : 0;
      u.uHoverAmount.value = hoverAmountRef.current;
      u.uHoverScale.value = pr.hoverScale;
      u.uParallax.value = pr.parallax;
      u.uBurst.value = pr.clickBurst ? burstRef.current : 0;

      renderer.render({ scene: mesh });
    };

    const dispose = () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerenter", onEnter);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };

    return { render, resize, dispose };
  }, []);

  // ── reduced-motion / 无 WebGL fallback：静态同心环径向渐变 ──
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn("block h-full w-full", className)}
        style={
          blur > 0 ? { filter: `blur(${blur}px)` } : undefined
        }
      >
        <div
          className={cn(
            "h-full w-full",
            "bg-[repeating-radial-gradient(circle_at_center,transparent_0,transparent_18px,var(--color-chart-1)_19px,transparent_22px,transparent_40px)]",
            "opacity-80",
          )}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("block h-full w-full", className)}
      style={blur > 0 ? { filter: `blur(${blur}px)` } : undefined}
    />
  );
}
