"use client";
import { useId, useRef } from "react";
import type { CSSProperties } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { PixelTrailProps } from "./pixel-trail.types";

// 吸取自 React Bits PixelTrail：鼠标划过时，背后的像素网格被逐格「点亮」，
// 拖尾随时间淡灭，形成跟随光标的颗粒状余晖；可选 gooey 滤镜把相邻像素融成液态团块。
//
// 瑚琏化要点：
// 1. 去 three.js / @react-three/fiber / @react-three/drei / drei useTrailTexture
//    三件依赖，改用 ogl（与 aurora/silk/orb 同栈）+ 自维护的 CPU 拖尾缓冲：
//    指针移动写入格子「年龄」，每帧统一衰减，作为 LUMINANCE data texture 上传，
//    片元着色器按格中心采样得拖尾强度 → alpha。算法等价于原 useTrailTexture。
// 2. 颜色吃 chart token（默认 var(--color-chart-1)，自动明暗适配），喂 shader 前
//    用离屏 canvas 解析成 RGB（var(--color-…) 在 GL 里不可直接用）。
// 3. gooey 滤镜用 SVG feGaussianBlur + feColorMatrix（同原版），id 用 useId 防多实例撞名。
// 4. reduced-motion / 无 WebGL：useGlCanvas 返回 reduced=true → 渲染静态空容器（DOM 同构，
//    不点亮、不动），内容结构与正常态一致。
// 5. StrictMode/remount 安全、离屏暂停、自适应尺寸全由 useGlCanvas 兜底。

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

// 片元：把 uv 映射到 cols×rows 方格，取所在格中心采样拖尾纹理（NEAREST），
// 拖尾强度 r 作为 alpha；颜色为传入的 pixelColor。等价原版 sdfCircle/gridUvCenter 逻辑。
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D trail;     // 拖尾年龄纹理（cols×rows，r 通道 0–1）
  uniform vec2 gridDims;       // (cols, rows)
  uniform vec3 pixelColor;

  void main() {
    // uv 原点在左下，翻 y 让格子行列与 CPU 缓冲一致（行 0 在顶部）
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
    vec2 cell = floor(uv * gridDims);
    vec2 center = (cell + 0.5) / gridDims;
    float t = texture2D(trail, center).r;
    gl_FragColor = vec4(pixelColor, t);
  }
`;

const DEFAULT_COLOR = "var(--color-chart-1)";

/** 把任意 CSS 颜色（含 var(--color-…)）解析为 0–1 的 RGB；解析失败回退到一个柔和蓝。 */
function resolveColor(input: string): [number, number, number] {
  if (typeof document === "undefined") return [0.4, 0.5, 1];
  try {
    const probe = document.createElement("span");
    probe.style.color = input;
    probe.style.display = "none";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color; // → "rgb(r, g, b)"
    document.body.removeChild(probe);
    const m = resolved.match(/(\d+(?:\.\d+)?)/g);
    if (m && m.length >= 3) {
      return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
    }
  } catch {
    /* noop */
  }
  return [0.4, 0.5, 1];
}

export function PixelTrail({
  gridSize = 40,
  trailSize = 0.1,
  maxAge = 320,
  color = DEFAULT_COLOR,
  gooey = false,
  gooeyStrength = 8,
  className,
  style,
}: PixelTrailProps) {
  const rawId = useId();
  const filterId = `hulian-pixeltrail-goo-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // 运行时参数挂 ref，render 回调直接读最新值，无需重建 GL context
  const gridSizeRef = useRef(gridSize);
  const trailSizeRef = useRef(trailSize);
  const maxAgeRef = useRef(maxAge);
  const colorRef = useRef(color);
  gridSizeRef.current = gridSize;
  trailSizeRef.current = trailSize;
  maxAgeRef.current = maxAge;
  colorRef.current = color;

  const { ref, reduced } = useGlCanvas(({ ogl, canvas }) => {
    const { Renderer, Program, Mesh, Triangle, Texture, Vec2, Vec3 } = ogl;

    const renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // ── CPU 拖尾缓冲：每格存「上次点亮时刻」，每帧按 maxAge 衰减为 0–1 强度 ──
    let cols = 1;
    let rows = 1;
    let cellLit: Float32Array = new Float32Array(1); // 各格点亮时刻（ms），-Infinity = 未亮
    let data: Uint8Array = new Uint8Array(4); // RGBA，仅用 r 通道
    let viewW = 1;
    let viewH = 1;

    const texture = new Texture(gl, {
      image: data,
      width: 1,
      height: 1,
      flipY: false,
      generateMipmaps: false,
      minFilter: gl.NEAREST,
      magFilter: gl.NEAREST,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        trail: { value: texture },
        gridDims: { value: new Vec2(1, 1) },
        pixelColor: { value: new Vec3(0.4, 0.5, 1) },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    // 依据容器尺寸与 gridSize 重建网格缓冲（保持方格：行数按宽高比推算）
    const rebuildGrid = (w: number, h: number) => {
      viewW = w || 1;
      viewH = h || 1;
      const c = Math.max(2, Math.round(gridSizeRef.current));
      const r = Math.max(2, Math.round((c * viewH) / viewW));
      if (c === cols && r === rows) return;
      cols = c;
      rows = r;
      cellLit = new Float32Array(cols * rows).fill(-Infinity);
      data = new Uint8Array(cols * rows * 4);
      texture.image = data;
      texture.width = cols;
      texture.height = rows;
      program.uniforms.gridDims.value.set(cols, rows);
    };

    const resize = (w: number, h: number) => {
      renderer.setSize(w || 1, h || 1);
      rebuildGrid(w, h);
    };
    resize(canvas.clientWidth, canvas.clientHeight);

    // ── 指针轨迹：把命中半径内的格子标记为「现在点亮」 ──
    const paint = (clientX: number, clientY: number, now: number) => {
      const rect = canvas.getBoundingClientRect();
      const px = ((clientX - rect.left) / (rect.width || 1)) * cols;
      const py = ((clientY - rect.top) / (rect.height || 1)) * rows;
      // 半径以短边为基准换算成格数
      const radCells =
        Math.max(trailSizeRef.current, 0) * Math.min(cols, rows) * 0.5 + 0.5;
      const r2 = radCells * radCells;
      const minX = Math.max(0, Math.floor(px - radCells));
      const maxX = Math.min(cols - 1, Math.ceil(px + radCells));
      const minY = Math.max(0, Math.floor(py - radCells));
      const maxY = Math.min(rows - 1, Math.ceil(py + radCells));
      for (let gy = minY; gy <= maxY; gy++) {
        for (let gx = minX; gx <= maxX; gx++) {
          const dx = gx + 0.5 - px;
          const dy = gy + 0.5 - py;
          if (dx * dx + dy * dy <= r2) cellLit[gy * cols + gx] = now;
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      paint(e.clientX, e.clientY, performance.now());
    };
    canvas.addEventListener("pointermove", onPointerMove);

    // 颜色解析较贵（建离屏节点），按字符串缓存，仅在 color prop 变化时重算
    let lastColorStr = "";
    let lastRgb: [number, number, number] = [0.4, 0.5, 1];

    const render = (t: number) => {
      void t;
      // 同步颜色（prop 可能变）——命中缓存则不重新解析
      if (colorRef.current !== lastColorStr) {
        lastColorStr = colorRef.current;
        lastRgb = resolveColor(lastColorStr);
      }
      program.uniforms.pixelColor.value.set(lastRgb[0], lastRgb[1], lastRgb[2]);

      // 衰减：强度 = 1 - age/maxAge，clamp 到 0–1，写入 data 的 r 通道
      const age = Math.max(maxAgeRef.current, 1);
      const now = performance.now();
      let any = false;
      for (let i = 0; i < cellLit.length; i++) {
        const lit = cellLit[i] ?? -Infinity;
        let v = 0;
        if (lit > -Infinity) {
          v = 1 - (now - lit) / age;
          if (v <= 0) {
            v = 0;
            cellLit[i] = -Infinity;
          } else any = true;
        }
        const px = i * 4;
        const byte = Math.round(v * 255);
        data[px] = byte;
        data[px + 1] = byte;
        data[px + 2] = byte;
        data[px + 3] = 255;
      }
      // any 仅作语义标记；始终上传以保证淡灭那一帧也被刷新
      void any;
      texture.needsUpdate = true;

      renderer.render({ scene: mesh });
    };

    const dispose = () => {
      canvas.removeEventListener("pointermove", onPointerMove);
    };

    return { render, resize, dispose };
  }, []);

  const glStyle: CSSProperties | undefined =
    gooey && !reduced ? { filter: `url(#${filterId})` } : undefined;

  return (
    <div className={cn("relative block h-full w-full", className)} style={style}>
      {gooey && !reduced && (
        // gooey 滤镜定义：高斯模糊 + feColorMatrix 提高 alpha 对比 → 相邻点融合成团块
        <svg
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        >
          <defs>
            <filter id={filterId}>
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation={gooeyStrength}
                result="blur"
              />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      )}
      {/* GL 画布容器（reduced 态下 useGlCanvas 不建 canvas，留空但 DOM 同构） */}
      <div
        ref={ref}
        aria-hidden
        className="absolute inset-0 block h-full w-full"
        style={glStyle}
      />
    </div>
  );
}
