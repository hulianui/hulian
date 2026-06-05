"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { SoftAuroraProps } from "./soft-aurora.types";

// 吸取自 React Bits SoftAurora：基于 3D Perlin 噪声 + cosine 色彩渐变的柔和极光带，
// 双层错位叠加 + 可选鼠标视差，整片背景在水平方向缓缓流动、垂直方向呈辉光带分布。
// 瑚琏化：① 颜色不再写死 hex（原 #f7f7f7 / #e100ff），改吃任意 CSS 颜色串并通过离屏
// canvas 解析为 shader 的 vec3，故 color1/color2 默认取 --color-chart token、自动明暗适配；
// ② 复用 useGlCanvas（懒加载 ogl·StrictMode 安全·离屏暂停·ResizeObserver），去掉原组件
// 手写的 window resize 监听与 canvas 复用；③ prop 运行时经 ref 同步进 RAF，避免重建 GL；
// ④ reduced-motion / 无 WebGL 自动降级为静态 token 渐变层（DOM 结构保持，aria-hidden）。

// ────────────────────────────────────────────────────────────────
// GLSL shaders（自 react-bits 原样移植，uniform 语义未改）
// ────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uResolution;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uBrightness;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uNoiseFreq;
  uniform float uNoiseAmp;
  uniform float uBandHeight;
  uniform float uBandSpread;
  uniform float uOctaveDecay;
  uniform float uLayerOffset;
  uniform float uColorSpeed;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  uniform bool uEnableMouse;

  #define TAU 6.28318

  vec3 gradientHash(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 234.6)),
      dot(p, vec3(269.5, 183.3, 198.3)),
      dot(p, vec3(169.5, 283.3, 156.9))
    );
    vec3 h = fract(sin(p) * 43758.5453123);
    float phi = acos(2.0 * h.x - 1.0);
    float theta = TAU * h.y;
    return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
  }

  float quinticSmooth(float t) {
    float t2 = t * t;
    float t3 = t * t2;
    return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
  }

  vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(TAU * (c * t + d));
  }

  float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
    float x = px * frequency;
    float y = py * frequency;

    float fx = floor(x); float fy = floor(y); float fz = floor(pz);
    float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);

    vec3 g000 = gradientHash(vec3(fx, fy, fz));
    vec3 g100 = gradientHash(vec3(cx, fy, fz));
    vec3 g010 = gradientHash(vec3(fx, cy, fz));
    vec3 g110 = gradientHash(vec3(cx, cy, fz));
    vec3 g001 = gradientHash(vec3(fx, fy, cz));
    vec3 g101 = gradientHash(vec3(cx, fy, cz));
    vec3 g011 = gradientHash(vec3(fx, cy, cz));
    vec3 g111 = gradientHash(vec3(cx, cy, cz));

    float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
    float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
    float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
    float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
    float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
    float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
    float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
    float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

    float sx = quinticSmooth(x - fx);
    float sy = quinticSmooth(y - fy);
    float sz = quinticSmooth(pz - fz);

    float lx00 = mix(d000, d100, sx);
    float lx10 = mix(d010, d110, sx);
    float lx01 = mix(d001, d101, sx);
    float lx11 = mix(d011, d111, sx);

    float ly0 = mix(lx00, lx10, sy);
    float ly1 = mix(lx01, lx11, sy);

    return amplitude * mix(ly0, ly1, sz);
  }

  float auroraGlow(float t, vec2 shift) {
    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv += shift;

    float noiseVal = 0.0;
    float freq = uNoiseFreq;
    float amp = uNoiseAmp;
    vec2 samplePos = uv * uScale;

    for (float i = 0.0; i < 3.0; i += 1.0) {
      noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
      amp *= uOctaveDecay;
      freq *= 2.0;
    }

    float yBand = uv.y * 10.0 - uBandHeight * 10.0;
    return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float t = uSpeed * 0.4 * uTime;

    vec2 shift = vec2(0.0);
    if (uEnableMouse) {
      shift = (uMouse - 0.5) * uMouseInfluence;
    }

    vec3 col = vec3(0.0);
    col += 0.99 * auroraGlow(t, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
    col += 0.99 * auroraGlow(t + uLayerOffset, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;

    col *= uBrightness;
    float alpha = clamp(length(col), 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ────────────────────────────────────────────────────────────────
// 颜色解析：把任意 CSS 颜色串（含 var(--color-…) token / oklch / hex）
// 解析为 [r,g,b]（0–1）。token 须在 DOM 中就地求值，故用一个临时元素读
// computedStyle，再喂离屏 canvas 反读 sRGB —— 比手写 oklch→rgb 稳。
// ────────────────────────────────────────────────────────────────
function resolveColor(input: string, fallback: [number, number, number]): [number, number, number] {
  if (typeof document === "undefined") return fallback;
  try {
    // 先就地解析 token：放进一个临时元素让浏览器把 var(--color-…) 算成具体颜色
    let resolved = input;
    if (input.includes("var(")) {
      const probe = document.createElement("span");
      probe.style.color = input;
      probe.style.display = "none";
      document.body.appendChild(probe);
      resolved = getComputedStyle(probe).color || input;
      probe.remove();
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.fillStyle = "#000";
    ctx.fillStyle = resolved; // 非法值会被忽略，保持 #000
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  } catch {
    return fallback;
  }
}

export function SoftAurora({
  color1 = "var(--color-chart-1)",
  color2 = "var(--color-chart-4)",
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1.0,
  enableMouseInteraction = true,
  mouseInfluence = 0.25,
  className,
  fallback,
  style,
}: SoftAuroraProps) {
  // 把所有运行时可变的 prop 挂 ref，让 RAF 回调直接读最新值，无需重建 GL context。
  const color1Ref = useRef(color1);
  const color2Ref = useRef(color2);
  const speedRef = useRef(speed);
  const scaleRef = useRef(scale);
  const brightnessRef = useRef(brightness);
  const noiseFrequencyRef = useRef(noiseFrequency);
  const noiseAmplitudeRef = useRef(noiseAmplitude);
  const bandHeightRef = useRef(bandHeight);
  const bandSpreadRef = useRef(bandSpread);
  const octaveDecayRef = useRef(octaveDecay);
  const layerOffsetRef = useRef(layerOffset);
  const colorSpeedRef = useRef(colorSpeed);
  const enableMouseRef = useRef(enableMouseInteraction);
  const mouseInfluenceRef = useRef(mouseInfluence);

  color1Ref.current = color1;
  color2Ref.current = color2;
  speedRef.current = speed;
  scaleRef.current = scale;
  brightnessRef.current = brightness;
  noiseFrequencyRef.current = noiseFrequency;
  noiseAmplitudeRef.current = noiseAmplitude;
  bandHeightRef.current = bandHeight;
  bandSpreadRef.current = bandSpread;
  octaveDecayRef.current = octaveDecay;
  layerOffsetRef.current = layerOffset;
  colorSpeedRef.current = colorSpeed;
  enableMouseRef.current = enableMouseInteraction;
  mouseInfluenceRef.current = mouseInfluence;

  // 鼠标视差状态（lerp 平滑），跨帧保留
  const currentMouseRef = useRef<[number, number]>([0.5, 0.5]);
  const targetMouseRef = useRef<[number, number]>([0.5, 0.5]);

  const { ref, reduced } = useGlCanvas(({ ogl, canvas }) => {
    const { Renderer, Program, Mesh, Triangle, Vec3 } = ogl;

    const renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const c1 = resolveColor(color1Ref.current, [0.97, 0.97, 0.97]);
    const c2 = resolveColor(color2Ref.current, [0.88, 0.0, 1.0]);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec3(1, 1, 1) },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
        uColor1: { value: new Vec3(c1[0], c1[1], c1[2]) },
        uColor2: { value: new Vec3(c2[0], c2[1], c2[2]) },
        uNoiseFreq: { value: noiseFrequency },
        uNoiseAmp: { value: noiseAmplitude },
        uBandHeight: { value: bandHeight },
        uBandSpread: { value: bandSpread },
        uOctaveDecay: { value: octaveDecay },
        uLayerOffset: { value: layerOffset },
        uColorSpeed: { value: colorSpeed },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: mouseInfluence },
        uEnableMouse: { value: enableMouseInteraction },
      },
    });

    const mesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program,
    });

    let lastColor1 = color1Ref.current;
    let lastColor2 = color2Ref.current;

    const resize = (w: number, h: number) => {
      const dpr = renderer.dpr;
      renderer.setSize(w || 1, h || 1);
      program.uniforms.uResolution.value.set(
        (w || 1) * dpr,
        (h || 1) * dpr,
        ((w || 1) / (h || 1)) || 1,
      );
    };
    resize(canvas.clientWidth, canvas.clientHeight);

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current = [
        (e.clientX - rect.left) / (rect.width || 1),
        1.0 - (e.clientY - rect.top) / (rect.height || 1),
      ];
    };
    const onPointerLeave = () => {
      targetMouseRef.current = [0.5, 0.5];
    };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const render = (t: number) => {
      program.uniforms.uTime.value = t * 0.001;

      // 同步运行时 prop
      program.uniforms.uSpeed.value = speedRef.current;
      program.uniforms.uScale.value = scaleRef.current;
      program.uniforms.uBrightness.value = brightnessRef.current;
      program.uniforms.uNoiseFreq.value = noiseFrequencyRef.current;
      program.uniforms.uNoiseAmp.value = noiseAmplitudeRef.current;
      program.uniforms.uBandHeight.value = bandHeightRef.current;
      program.uniforms.uBandSpread.value = bandSpreadRef.current;
      program.uniforms.uOctaveDecay.value = octaveDecayRef.current;
      program.uniforms.uLayerOffset.value = layerOffsetRef.current;
      program.uniforms.uColorSpeed.value = colorSpeedRef.current;
      program.uniforms.uMouseInfluence.value = mouseInfluenceRef.current;
      program.uniforms.uEnableMouse.value = enableMouseRef.current;

      // 颜色变化才重新解析（解析含 DOM 操作，避免逐帧做）
      if (color1Ref.current !== lastColor1) {
        const c = resolveColor(color1Ref.current, [0.97, 0.97, 0.97]);
        program.uniforms.uColor1.value.set(c[0], c[1], c[2]);
        lastColor1 = color1Ref.current;
      }
      if (color2Ref.current !== lastColor2) {
        const c = resolveColor(color2Ref.current, [0.88, 0.0, 1.0]);
        program.uniforms.uColor2.value.set(c[0], c[1], c[2]);
        lastColor2 = color2Ref.current;
      }

      // 鼠标视差 lerp
      if (enableMouseRef.current) {
        const cur = currentMouseRef.current;
        const tgt = targetMouseRef.current;
        cur[0] += 0.05 * (tgt[0] - cur[0]);
        cur[1] += 0.05 * (tgt[1] - cur[1]);
        program.uniforms.uMouse.value[0] = cur[0];
        program.uniforms.uMouse.value[1] = cur[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
    };

    const dispose = () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };

    return { render, resize, dispose };
  }, []);

  // reduced-motion / 无 WebGL 降级：静态 token 极光渐变（DOM 保持，仅作背景）
  if (reduced) {
    return (
      <div
        className={cn("relative block h-full w-full overflow-hidden", className)}
        style={style}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[linear-gradient(115deg,var(--color-chart-1)_0%,transparent_40%,var(--color-chart-4)_70%,transparent_100%)]",
            "opacity-70 blur-2xl",
          )}
        />
        {fallback != null && <div className="relative z-10">{fallback}</div>}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("block h-full w-full", className)}
      style={style}
    />
  );
}
