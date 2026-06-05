"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { FlyingPostersProps } from "./flying-posters.types";

// 吸取自 React Bits FlyingPosters：一列海报在 WebGL 透视相机里随卷动无限循环上下飞过，
// 顶点着色器按 distortion 把平面沿轴向翻折"飞起"，离屏即从另一端循环复用。
// 瑚琏化：
//   - 去 gsap 惯性：scroll lerp 用纯 RAF 手算（lerp + 缓动系数），不引第三方依赖。
//   - 滚轮/触摸事件只挂在画布元素上，不劫持整页 window 滚动（组件库友好）。
//   - 走 useGlCanvas 共享生命周期：懒加载 ogl + StrictMode 安全（每次挂载新建 canvas，
//     避免上一轮 loseContext 毒化 context）+ 离屏暂停 + ResizeObserver 自适应。
//   - reduced-motion / 无 WebGL → 静态海报网格 fallback（吃 token 边框，不消失内容）。
//   - 新增 autoScroll：无交互时缓慢自动卷动，让效果在静态/截图场景仍有生命力。
//   - 原片元着色器/顶点翻折数学原样保留（仅去掉未用 uniform、清理事件作用域）。

// ────────────────────────────────────────────────────────────────
// GLSL（顶点翻折 + 片元 cover 裁切，原样从 react-bits 移植）
// ────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uPosition;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;

float PI = 3.141592653589793238;

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,          oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                               0.0,                                0.0,                                1.0
  );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? 16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;
  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.0) / norm;
  float localprogress = clamp(
    (fract(uPosition * 5.0 * 0.01) - 0.01 * uDistortion * offset) / (1.0 - 0.01 * uDistortion),
    0.0,
    2.0
  );
  localprogress = qinticInOut(localprogress) * PI;
  newpos = rotate(newpos, rotationAxis, localprogress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;
varying vec2 vUv;

void main() {
  float imageAspect = uImageSize.x / uImageSize.y;
  float planeAspect = uPlaneSize.x / uPlaneSize.y;
  vec2 scale = vec2(1.0, 1.0);
  if (planeAspect > imageAspect) {
    scale.x = imageAspect / planeAspect;
  } else {
    scale.y = planeAspect / imageAspect;
  }
  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;
  gl_FragColor = texture2D(tMap, uv);
}
`;

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function mapRange(num: number, min1: number, max1: number, min2: number, max2: number) {
  const n = (num - min1) / (max1 - min1);
  return n * (max2 - min2) + min2;
}

export function FlyingPosters({
  items = [],
  planeWidth = 320,
  planeHeight = 320,
  distortion = 3,
  scrollEase = 0.01,
  cameraFov = 45,
  cameraZ = 20,
  autoScroll = true,
  autoScrollSpeed = 0.6,
  className,
  style,
  fallback,
}: FlyingPostersProps) {
  // 运行时可变 prop 挂 ref，render 回调直接读最新值，不靠闭包捕获、不重建 GL。
  const distortionRef = useRef(distortion);
  const scrollEaseRef = useRef(scrollEase);
  const autoScrollRef = useRef(autoScroll);
  const autoScrollSpeedRef = useRef(autoScrollSpeed);
  distortionRef.current = distortion;
  scrollEaseRef.current = scrollEase;
  autoScrollRef.current = autoScroll;
  autoScrollSpeedRef.current = autoScrollSpeed;

  // items 序列化进 deps，列表变化时重建场景。
  const itemsKey = items.join("|");

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } = ogl;

      const renderer = new Renderer({
        canvas,
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl);
      camera.fov = cameraFov;
      camera.position.z = cameraZ;

      const scene = new Transform();
      const geometry = new Plane(gl, { heightSegments: 1, widthSegments: 100 });

      // 卷动状态（lerp 平滑）
      const scroll = { current: 0, target: 0 };

      let screen = { width: 1, height: 1 };
      let viewport = { width: 1, height: 1 };

      const computeViewport = () => {
        const fovRad = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fovRad / 2) * camera.position.z;
        const width = height * camera.aspect;
        viewport = { width, height };
      };

      type Media = {
        mesh: InstanceType<typeof Mesh>;
        program: InstanceType<typeof Program>;
        extra: number;
        y: number;
        height: number;
        heightTotal: number;
        layout: () => void;
        update: () => void;
      };

      const length = items.length;
      const medias: Media[] = items.map((src, index) => {
        const texture = new Texture(gl, { generateMipmaps: false });
        const program = new Program(gl, {
          depthTest: false,
          depthWrite: false,
          vertex: VERT,
          fragment: FRAG,
          cullFace: false,
          uniforms: {
            tMap: { value: texture },
            uPosition: { value: 0 },
            uPlaneSize: { value: [0, 0] },
            uImageSize: { value: [1, 1] },
            rotationAxis: { value: [0, 1, 0] },
            distortionAxis: { value: [1, 1, 0] },
            uDistortion: { value: distortionRef.current },
          },
        });

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
          texture.image = img;
          program.uniforms.uImageSize.value = [img.naturalWidth || 1, img.naturalHeight || 1];
        };

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        const media: Media = {
          mesh,
          program,
          extra: 0,
          y: 0,
          height: 0,
          heightTotal: 0,
          layout() {
            mesh.scale.x = (viewport.width * planeWidth) / screen.width;
            mesh.scale.y = (viewport.height * planeHeight) / screen.height;
            mesh.position.x = 0;
            program.uniforms.uPlaneSize.value = [mesh.scale.x, mesh.scale.y];
            const padding = 5;
            media.height = mesh.scale.y + padding;
            media.heightTotal = media.height * length;
            media.y = -media.heightTotal / 2 + (index + 0.5) * media.height;
          },
          update() {
            mesh.position.y = media.y - scroll.current - media.extra;
            const position = mapRange(
              mesh.position.y,
              -viewport.height,
              viewport.height,
              5,
              15,
            );
            program.uniforms.uPosition.value = position;
            program.uniforms.uDistortion.value = distortionRef.current;

            const planeH = mesh.scale.y;
            const topEdge = mesh.position.y + planeH / 2;
            const bottomEdge = mesh.position.y - planeH / 2;
            if (topEdge < -viewport.height / 2) {
              media.extra -= media.heightTotal;
            } else if (bottomEdge > viewport.height / 2) {
              media.extra += media.heightTotal;
            }
          },
        };
        return media;
      });

      const resize = (w: number, h: number) => {
        screen = { width: w || 1, height: h || 1 };
        renderer.setSize(screen.width, screen.height);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        computeViewport();
        medias.forEach((m) => m.layout());
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // ── 卷动输入：只在画布上监听，不劫持整页 ──
      let isDown = false;
      let startY = 0;
      let scrollAtDown = 0;
      let interacted = false;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        interacted = true;
        scroll.target += e.deltaY * 0.005;
      };
      const onPointerDown = (e: PointerEvent) => {
        isDown = true;
        interacted = true;
        scrollAtDown = scroll.current;
        startY = e.clientY;
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!isDown) return;
        const distance = (startY - e.clientY) * 0.1;
        scroll.target = scrollAtDown + distance;
      };
      const onPointerUp = () => {
        isDown = false;
      };

      canvas.addEventListener("wheel", onWheel, { passive: false });
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerUp);

      let lastT = 0;

      const render = (t: number) => {
        const dt = lastT ? Math.min((t - lastT) * 0.001, 0.1) : 0;
        lastT = t;

        // 无交互时自动缓慢卷动
        if (autoScrollRef.current && !interacted && !isDown) {
          scroll.target += autoScrollSpeedRef.current * dt;
        }

        scroll.current = lerp(scroll.current, scroll.target, scrollEaseRef.current);
        medias.forEach((m) => m.update());
        renderer.render({ scene, camera });
      };

      const dispose = () => {
        canvas.removeEventListener("wheel", onWheel);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerUp);
      };

      return { render, resize, dispose };
    },
    // 列表 / 几何相关 prop 变化才重建；distortion/scrollEase/autoScroll 运行时走 ref。
    [itemsKey, planeWidth, planeHeight, cameraFov, cameraZ],
  );

  // ── reduced-motion / 无 WebGL fallback：静态海报网格（内容不消失） ──
  if (reduced) {
    const preview = items.slice(0, 3);
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden",
          className,
        )}
        style={style}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col gap-2">
            {preview.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                aria-hidden
                className="h-20 w-32 rounded-lg border border-border object-cover shadow-sm"
              />
            ))}
          </div>
          {fallback}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("relative block h-full w-full overflow-hidden", className)}
      style={style}
    />
  );
}
