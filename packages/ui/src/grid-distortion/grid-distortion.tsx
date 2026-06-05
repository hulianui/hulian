"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { GridDistortionProps } from "./grid-distortion.types";

// 吸取自 React Bits GridDistortion：用一张 grid×grid 的 DataTexture 记录每格 rg 位移，鼠标移动时
// 按"速度 × 距离衰减"把涟漪推进位移场，每帧弛豫（×relaxation）回弹，再在 fragment 里用位移偏移
// 采样底图 UV，得到鼠标拖出的液态网格扭曲。
//
// 瑚琏化要点：
// 1. 去 three.js：整套以 ogl 重写（Renderer/Program/Mesh/Triangle/Texture），走共享 useGlCanvas
//    生命周期（懒加载 ogl · SSR 安全 · StrictMode 安全的新建 canvas · RAF/Resize/Intersection）。
// 2. 去外部图：默认不需 imageSrc——shader 内程序化生成 chart token 着色的网格底纹（零远程资源、
//    明暗自适应）；传 imageSrc 则扭曲该图，保留原版玩法。
// 3. 颜色吃 token：底纹主色默认读 --color-chart-1（显式 color prop 优先）。
// 4. 全屏三角 + 屏幕 UV：原版用 OrthographicCamera + PlaneGeometry，这里用 OGL Triangle 全覆盖，
//    位移场以 grid 网格双线性插值采样，等价且更省。
// 5. reduced-motion / 无 WebGL：自动降级为静态 CSS 网格底纹（aria-hidden），DOM 始终是单个根容器。

// 顶点：OGL Triangle 已在 clip-space，直接透传 uv。
const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 片元：
// uDataTexture = grid×grid 的 rg 位移场（OGL Texture，LINEAR 过滤 → 自带双线性插值）。
// uHasImage=1 时采样真实图 uImage；否则程序化网格底纹（细线 + token 主色），同样被位移偏移。
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform sampler2D uDataTexture;
uniform sampler2D uImage;
uniform float uHasImage;
uniform vec3  uColor;
uniform float uGrid;

// 程序化网格底纹：在被扭曲的 uv 上画细网格线，线为 token 主色，格内为暗底。
vec4 proceduralGrid(vec2 uv) {
  vec2 g = uv * uGrid;
  vec2 f = abs(fract(g) - 0.5);
  float line = smoothstep(0.46, 0.5, max(f.x, f.y));
  // 暗底 + token 主色网格线；中心略亮做出纵深
  vec3 base = uColor * 0.12;
  vec3 lit  = mix(base, uColor, line);
  float vign = 1.0 - 0.5 * length(uv - 0.5);
  return vec4(lit * vign, 1.0);
}

void main() {
  // 位移以 UNSIGNED_BYTE 编码，128 为零偏移；解码回 [-1,1]。
  vec2 offset = texture2D(uDataTexture, vUv).rg * 2.0 - 1.0;
  vec2 uv = vUv - 0.04 * offset;
  if (uHasImage > 0.5) {
    gl_FragColor = texture2D(uImage, uv);
  } else {
    gl_FragColor = proceduralGrid(uv);
  }
}
`.trim();

// CSS 颜色 → [r,g,b] 0..1：用离屏 1×1 canvas 让浏览器解析任意 CSS 颜色（hex/oklch/rgb/var 计算值）。
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [0.55, 0.55, 0.62];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [0.55, 0.55, 0.62];
  }
}

// 从挂载后的元素读取 --color-chart-1（当前主题下的 token 值）。
function resolveChartToken(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [0.55, 0.55, 0.62];
  return cssColorToRgb01(raw);
}

/**
 * GridDistortion — 鼠标拖拽的液态网格扭曲 WebGL 背景。
 *
 * 默认零外部资源：shader 内程序化生成 chart token 着色的网格底纹，鼠标划过即推出涟漪扭曲；
 * 也可传 imageSrc 扭曲真实图片（同 react-bits 原版）。
 * reduced-motion / 无 WebGL 自动降级为静态网格底纹。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
 *   <GridDistortion grid={18} strength={0.2} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function GridDistortion({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc,
  color,
  className,
  fallback,
}: GridDistortionProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Texture } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: true, dpr });
      const gl = renderer.gl;

      const size = Math.max(2, Math.floor(grid));

      // 位移场数据（CPU 端用 Float32 累积涟漪，更新前编码到 Uint8）：
      // - field：rg 浮点位移，围绕 0；其余备用
      // - data ：上传 GPU 的字节缓冲，128 = 零偏移
      const field = new Float32Array(2 * size * size);
      const data = new Uint8Array(4 * size * size);
      for (let i = 0; i < size * size; i++) data[i * 4 + 3] = 255;

      const dataTexture = new Texture(gl, {
        image: data,
        width: size,
        height: size,
        magFilter: gl.LINEAR,
        minFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        generateMipmaps: false,
        flipY: false,
      });

      // 底图（可选）：默认程序化网格，故无需任何远程资源。
      const imageTexture = new Texture(gl, { generateMipmaps: false });
      let hasImage = 0;
      if (imageSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          imageTexture.image = img;
          hasImage = 1;
          program.uniforms.uHasImage!.value = 1;
        };
        img.src = imageSrc;
      }

      // 主色：显式 color 优先，否则读 token（在 setup 时 canvas 已挂载，可拿当前主题值）。
      const parent = (canvas.parentElement as HTMLElement | null) ?? canvas;
      const [r, g, b] = color
        ? cssColorToRgb01(color)
        : resolveChartToken(parent);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uDataTexture: { value: dataTexture },
          uImage: { value: imageTexture },
          uHasImage: { value: hasImage },
          uColor: { value: [r, g, b] },
          uGrid: { value: size },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // 鼠标状态：归一化坐标 + 帧间速度（涟漪驱动力）。
      const m = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
      const onMove = (e: MouseEvent) => {
        const rect = parent.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height;
        m.vX = x - m.prevX;
        m.vY = y - m.prevY;
        m.x = x;
        m.y = y;
        m.prevX = x;
        m.prevY = y;
      };
      const onLeave = () => {
        m.x = m.y = m.prevX = m.prevY = m.vX = m.vY = 0;
      };
      parent.addEventListener("mousemove", onMove);
      parent.addEventListener("mouseleave", onLeave);

      const maxR = size * mouse;
      const maxRSq = maxR * maxR;

      return {
        render() {
          // 每帧弛豫衰减（浮点位移场）
          for (let i = 0; i < size * size; i++) {
            field[i * 2] *= relaxation;
            field[i * 2 + 1] *= relaxation;
          }

          // 鼠标涟漪：在影响半径内的格子按距离衰减叠加速度
          const gx = size * m.x;
          const gy = size * m.y;
          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              const dx = gx - i;
              const dy = gy - j;
              const distSq = dx * dx + dy * dy;
              if (distSq < maxRSq) {
                const fi = 2 * (i + size * j);
                const power = Math.min(maxR / Math.sqrt(distSq || 1e-4), 10);
                field[fi] += strength * m.vX * power;
                field[fi + 1] -= strength * m.vY * power;
              }
            }
          }

          // 编码浮点位移 → Uint8（128 为零，clamp 防越界）
          for (let k = 0; k < size * size; k++) {
            const rx = Math.max(-1, Math.min(1, field[k * 2]!));
            const ry = Math.max(-1, Math.min(1, field[k * 2 + 1]!));
            data[k * 4] = (rx * 0.5 + 0.5) * 255;
            data[k * 4 + 1] = (ry * 0.5 + 0.5) * 255;
          }

          dataTexture.image = data;
          dataTexture.needsUpdate = true;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          parent.removeEventListener("mousemove", onMove);
          parent.removeEventListener("mouseleave", onLeave);
          program.remove?.();
        },
      };
    },
    [grid, mouse, strength, relaxation, imageSrc, color],
  );

  // reduced-motion / 无 WebGL：静态 CSS 网格底纹（吃 token，无动画无扭曲）。
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background-image:linear-gradient(var(--color-chart-1)_1px,transparent_1px),linear-gradient(90deg,var(--color-chart-1)_1px,transparent_1px)]",
          "[background-size:24px_24px]",
          "opacity-30",
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
      className={cn(
        "absolute inset-0 z-0 block h-full w-full",
        className,
      )}
    />
  );
}
