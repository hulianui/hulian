"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type {
  CircularGalleryItem,
  CircularGalleryProps,
} from "./circular-gallery.types";

// 吸取自 React Bits CircularGallery：ogl 平面网格 + 顶点波动 shader 沿弧线排开一圈
// 图片卡，滚轮 / 拖拽惯性平移、首尾无缝循环，卡片随位置做圆弧弯曲倾斜，标题以
// canvas 文字纹理挂在卡片下方。
//
// 瑚琏化要点：
// 1. 去掉远程字体加载（原版默认拉 Google Fonts 的 Figtree）——改用系统字体栈，离线 / RSC 安全。
// 2. 默认卡片不再用 picsum.photos 远程图——改用 chart token 程序化生成渐变占位（无任何远程资源）。
// 3. 颜色全吃 token：textColor 默认 `var(--color-foreground)`，运行时 getComputedStyle 解析实色喂 canvas。
// 4. 复用 useGlCanvas：懒加载 ogl（代码分割）+ StrictMode 安全（每次挂载新建 canvas，规避 loseContext 毒化）+
//    RAF 容错循环 + ResizeObserver 自适应 + IntersectionObserver 离屏暂停 + 卸载兜底释放 GL context。
// 5. reduced-motion / 无 WebGL：降级为静态横向卡片轨道（吃 token），DOM 不因 reduced 而卸载内容。
// 6. 事件监听从原版的全局 window 收回到 canvas 自身（多实例不互相干扰、不污染全局）。

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

/** 解析 CSS 颜色字符串（含 var(--color-*) token）为实色，喂给 canvas2d / 不解析则原样返回。 */
function resolveColor(value: string, host: HTMLElement): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!match) return trimmed;
  const varName = match[1]!;
  const resolved = getComputedStyle(host).getPropertyValue(varName).trim();
  if (resolved) return resolved;
  return (match[2] ?? "#888888").trim();
}

function getFontSize(font: string): number {
  const m = font.match(/(\d+)px/);
  return m ? parseInt(m[1]!, 10) : 30;
}

/** 标题：把文字画到离屏 canvas，作为纹理贴到一个小平面，挂在图片卡下方。 */
function createTextTexture(
  TextureCtor: typeof import("ogl").Texture,
  gl: import("ogl").OGLRenderingContext,
  text: string,
  font: string,
  color: string,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    const texture = new TextureCtor(gl, { generateMipmaps: false });
    return { texture, width: 1, height: 1 };
  }
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new TextureCtor(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

/** 程序化生成一张 token 化渐变占位纹理（用于未提供 image 的卡片，离线可用）。 */
export function makePlaceholderCanvas(seed: number, host: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  // 纹理最终只承载平滑渐变，64x48 足够；直接交给 WebGL，避免把 800x600 canvas
  // 同步编码为 PNG data URL，再通过 Image 解码回像素的主线程往返。
  canvas.width = 64;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const a = resolveColor(`var(--color-chart-${(seed % 5) + 1})`, host);
  const b = resolveColor(`var(--color-chart-${((seed + 2) % 5) + 1})`, host);
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, a || "#5b8def");
  grad.addColorStop(1, b || "#9b6dff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

const VERTEX = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec2 uImageSizes;
  uniform vec2 uPlaneSizes;
  uniform sampler2D tMap;
  uniform float uBorderRadius;
  varying vec2 vUv;

  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b;
    return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
  }

  void main() {
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    vec4 color = texture2D(tMap, uv);
    float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
    float edgeSmooth = 0.002;
    float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
    gl_FragColor = vec4(color.rgb, alpha);
  }
`;

const TITLE_VERTEX = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const TITLE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tMap;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(tMap, vUv);
    if (color.a < 0.1) discard;
    gl_FragColor = color;
  }
`;

const DEFAULT_ITEMS: CircularGalleryItem[] = [
  { text: "Bridge" },
  { text: "Desk Setup" },
  { text: "Waterfall" },
  { text: "Strawberries" },
  { text: "Deep Diving" },
  { text: "Train Track" },
  { text: "Santorini" },
  { text: "Blurry Lights" },
  { text: "New York" },
  { text: "Good Boy" },
  { text: "Coastline" },
  { text: "Palm Trees" },
];

const DEFAULT_FONT = "bold 30px ui-sans-serif, system-ui, sans-serif";
export const CIRCULAR_GALLERY_PLANE_SEGMENTS = { width: 32, height: 16 } as const;

export function CircularGallery({
  items,
  bend = 3,
  textColor = "var(--color-foreground)",
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
  font = DEFAULT_FONT,
  className,
  fallback,
}: CircularGalleryProps) {
  // 运行时可变的 prop 通过 ref 注入 setup 闭包，避免频繁重建 GL context。
  const itemsRef = useRef(items);
  const bendRef = useRef(bend);
  const textColorRef = useRef(textColor);
  const borderRadiusRef = useRef(borderRadius);
  const scrollSpeedRef = useRef(scrollSpeed);
  const scrollEaseRef = useRef(scrollEase);
  const fontRef = useRef(font);

  itemsRef.current = items;
  bendRef.current = bend;
  textColorRef.current = textColor;
  borderRadiusRef.current = borderRadius;
  scrollSpeedRef.current = scrollSpeed;
  scrollEaseRef.current = scrollEase;
  fontRef.current = font;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } = ogl;
      const host = canvas.parentElement ?? document.body;

      const renderer = new Renderer({
        canvas,
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl);
      camera.fov = 45;
      camera.position.z = 20;

      const scene = new Transform();
      // 32x16 已能平滑承载顶点波动。原 100x50 每张卡片会创建约十倍顶点，
      // 在 16 张无缝循环卡片初始化时容易把单任务推过 100ms。
      const planeGeometry = new Plane(gl, {
        heightSegments: CIRCULAR_GALLERY_PLANE_SEGMENTS.height,
        widthSegments: CIRCULAR_GALLERY_PLANE_SEGMENTS.width,
      });
      const titleGeometry = new Plane(gl);

      const resolvedTextColor = resolveColor(textColorRef.current, host) || "#888888";
      const galleryItems =
        itemsRef.current && itemsRef.current.length ? itemsRef.current : DEFAULT_ITEMS;
      // 首尾拼接两份达成无缝循环。
      const doubled = galleryItems.concat(galleryItems);

      let screen = { width: canvas.clientWidth || 1, height: canvas.clientHeight || 1 };
      let viewport = { width: 1, height: 1 };
      const scroll = { ease: scrollEaseRef.current, current: 0, target: 0, last: 0, position: 0 };

      // ── Media：每张卡片 ──
      interface MediaItem {
        update: (dir: "left" | "right") => void;
        resize: () => void;
        readonly width: number;
      }

      const computeViewport = () => {
        camera.perspective({ aspect: screen.width / screen.height });
        const fovRad = (camera.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fovRad / 2) * camera.position.z;
        const w = h * camera.aspect;
        viewport = { width: w, height: h };
      };

      const createMedia = (data: CircularGalleryItem, index: number): MediaItem => {
        const texture = new Texture(gl, { generateMipmaps: true });
        const program = new Program(gl, {
          depthTest: false,
          depthWrite: false,
          vertex: VERTEX,
          fragment: FRAGMENT,
          uniforms: {
            tMap: { value: texture },
            uPlaneSizes: { value: [0, 0] },
            uImageSizes: { value: [0, 0] },
            uSpeed: { value: 0 },
            uTime: { value: 100 * Math.random() },
            uBorderRadius: { value: borderRadiusRef.current },
          },
          transparent: true,
        });

        if (data.image) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            texture.image = img;
            program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
          };
          img.src = data.image;
        } else {
          const placeholder = makePlaceholderCanvas(index, host);
          texture.image = placeholder;
          program.uniforms.uImageSizes.value = [placeholder.width, placeholder.height];
        }

        const plane = new Mesh(gl, { geometry: planeGeometry, program });
        plane.setParent(scene);

        // 标题子平面
        const titleTex = createTextTexture(
          Texture,
          gl,
          data.text,
          fontRef.current,
          resolvedTextColor,
        );
        const titleProgram = new Program(gl, {
          vertex: TITLE_VERTEX,
          fragment: TITLE_FRAGMENT,
          uniforms: { tMap: { value: titleTex.texture } },
          transparent: true,
        });
        const titleMesh = new Mesh(gl, {
          geometry: titleGeometry,
          program: titleProgram,
        });
        titleMesh.setParent(plane);

        let extra = 0;
        let widthVal = 0;
        let widthTotal = 0;
        let xPos = 0;

        const resize = () => {
          const scale = screen.height / 1500;
          plane.scale.y = (viewport.height * (900 * scale)) / screen.height;
          plane.scale.x = (viewport.width * (700 * scale)) / screen.width;
          program.uniforms.uPlaneSizes.value = [plane.scale.x, plane.scale.y];
          const padding = 2;
          widthVal = plane.scale.x + padding;
          widthTotal = widthVal * doubled.length;
          xPos = widthVal * index;
          // 标题位置 / 尺寸
          const aspect = titleTex.width / titleTex.height;
          const th = plane.scale.y * 0.15;
          titleMesh.scale.set(th * aspect, th, 1);
          titleMesh.position.y = -plane.scale.y * 0.5 - th * 0.5 - 0.05;
        };

        const update = (direction: "left" | "right") => {
          plane.position.x = xPos - scroll.current - extra;
          const x = plane.position.x;
          const H = viewport.width / 2;
          const bendVal = bendRef.current;
          if (bendVal === 0) {
            plane.position.y = 0;
            plane.rotation.z = 0;
          } else {
            const bAbs = Math.abs(bendVal);
            const R = (H * H + bAbs * bAbs) / (2 * bAbs);
            const effX = Math.min(Math.abs(x), H);
            const arc = R - Math.sqrt(R * R - effX * effX);
            if (bendVal > 0) {
              plane.position.y = -arc;
              plane.rotation.z = -Math.sign(x) * Math.asin(effX / R);
            } else {
              plane.position.y = arc;
              plane.rotation.z = Math.sign(x) * Math.asin(effX / R);
            }
          }
          const speed = scroll.current - scroll.last;
          program.uniforms.uTime.value += 0.04;
          program.uniforms.uSpeed.value = speed;
          program.uniforms.uBorderRadius.value = borderRadiusRef.current;

          const planeOffset = plane.scale.x / 2;
          const viewportOffset = viewport.width / 2;
          const isBefore = plane.position.x + planeOffset < -viewportOffset;
          const isAfter = plane.position.x - planeOffset > viewportOffset;
          if (direction === "right" && isBefore) extra -= widthTotal;
          if (direction === "left" && isAfter) extra += widthTotal;
        };

        return {
          update,
          resize,
          get width() {
            return widthVal;
          },
        } as MediaItem;
      };

      computeViewport();
      const medias = doubled.map((data, i) => createMedia(data, i));
      medias.forEach((m) => m.resize());

      // ── 交互：滚轮 + 指针拖拽，吸附到最近卡片 ──
      let isDown = false;
      let start = 0;

      const onCheck = () => {
        const w = medias[0]?.width ?? 1;
        if (!w) return;
        const itemIndex = Math.round(Math.abs(scroll.target) / w);
        const item = w * itemIndex;
        scroll.target = scroll.target < 0 ? -item : item;
      };
      let checkTimeout = 0;
      const onCheckDebounce = () => {
        clearTimeout(checkTimeout);
        checkTimeout = window.setTimeout(onCheck, 200);
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY;
        scroll.target += (delta > 0 ? scrollSpeedRef.current : -scrollSpeedRef.current) * 0.2;
        onCheckDebounce();
      };
      const onPointerDown = (e: PointerEvent) => {
        isDown = true;
        scroll.position = scroll.current;
        start = e.clientX;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* best-effort */
        }
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!isDown) return;
        const distance = (start - e.clientX) * (scrollSpeedRef.current * 0.025);
        scroll.target = scroll.position + distance;
      };
      const onPointerUp = () => {
        isDown = false;
        onCheck();
      };

      canvas.addEventListener("wheel", onWheel, { passive: false });
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerUp);

      const resize = (w: number, h: number) => {
        screen = { width: w || 1, height: h || 1 };
        renderer.setSize(screen.width, screen.height);
        computeViewport();
        medias.forEach((m) => m.resize());
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      const render = () => {
        scroll.ease = scrollEaseRef.current;
        scroll.current = lerp(scroll.current, scroll.target, scroll.ease);
        const direction = scroll.current > scroll.last ? "right" : "left";
        medias.forEach((m) => m.update(direction));
        renderer.render({ scene, camera });
        scroll.last = scroll.current;
      };

      const dispose = () => {
        clearTimeout(checkTimeout);
        canvas.removeEventListener("wheel", onWheel);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerUp);
      };

      return { render, resize, dispose };
    },
    [],
  );

  // ── reduced-motion / 无 WebGL fallback：静态横向卡片轨道（DOM 内容不卸载） ──
  if (reduced) {
    const galleryItems = items && items.length ? items : DEFAULT_ITEMS;
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center gap-4 overflow-x-auto px-6 py-8",
          className,
        )}
      >
        {galleryItems.slice(0, 8).map((it, i) => (
          <figure
            key={`${it.text}-${i}`}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <div
              className="h-40 w-56 rounded-xl border border-border bg-surface"
              style={{
                background: `linear-gradient(135deg, var(--color-chart-${(i % 5) + 1}), var(--color-chart-${((i + 2) % 5) + 1}))`,
              }}
              aria-hidden
            />
            <figcaption className="text-sm font-medium text-foreground">
              {it.text}
            </figcaption>
          </figure>
        ))}
        {fallback}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-full w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing",
        className,
      )}
    />
  );
}
