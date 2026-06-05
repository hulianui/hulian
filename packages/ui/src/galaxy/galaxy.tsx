"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { GalaxyProps } from "./galaxy.types";

// 吸取自 React Bits Galaxy：OGL 全屏三角片元 shader 程序化生成多层视差星河——
// Hash21 哈希铺点 + Star() 十字辉光 + HSV 调色 + 三角波闪烁 + 自转 / 鼠标斥力，
// 4 层不同尺度叠加出深空纵深感。
//
// 瑚琏化要点：
// 1. 复用 useGlCanvas 共享生命周期帮手——懒加载 ogl（代码分割，base bundle 不含）、
//    StrictMode/remount 安全（每次挂载新建 canvas 避 loseContext 毒化）、RAF 离屏暂停、
//    ResizeObserver 自适应、render try/catch 不崩页面。
// 2. reduced-motion / 无 WebGL：自动降级为吃 chart token 的径向渐变深空 fallback（不消失，留观感）。
// 3. 鼠标交互在 setup 内对 canvas 挂监听（canvas 铺满容器），lerp 平滑光标位置喂 uniform。
// 4. RSC 安全：纯客户端 effect（"use client"），无第三方 runtime 依赖（仅 ogl，与 silk/orb 同源）。
// 5. shader 与原版逐字保持（uniform 名不改），仅去掉 import './Galaxy.css' 改用 token 类。

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`.trim();

/**
 * Galaxy — 程序化生成的多层视差星河 WebGL 背景。
 *
 * 基于 react-bits Galaxy 原版 GLSL shader（Hash 铺点 + 十字辉光 + HSV 调色 +
 * 三角波闪烁 + 自转 / 鼠标斥力，4 层不同尺度叠加出深空纵深）。
 * 瑚琏化：复用 `useGlCanvas` 懒加载 ogl + StrictMode 安全 + 离屏暂停；
 * reduced-motion / 无 WebGL 自动降级为吃 chart token 的径向渐变深空 fallback。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 *
 * @example
 * <div className="relative h-screen overflow-hidden bg-neutral-950">
 *   <Galaxy density={1.2} hueShift={220} />
 *   <div className="relative z-10">内容</div>
 * </div>
 */
export function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  className,
  fallback,
}: GalaxyProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({
        canvas,
        alpha: transparent,
        premultipliedAlpha: false,
        dpr,
      });
      const gl = renderer.gl;

      if (transparent) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
      } else {
        gl.clearColor(0, 0, 0, 1);
      }

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: {
            value: new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / Math.max(gl.canvas.height, 1),
            ),
          },
          uFocal: { value: new Float32Array(focal) },
          uRotation: { value: new Float32Array(rotation) },
          uStarSpeed: { value: starSpeed },
          uDensity: { value: density },
          uHueShift: { value: hueShift },
          uSpeed: { value: speed },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uGlowIntensity: { value: glowIntensity },
          uSaturation: { value: saturation },
          uMouseRepulsion: { value: mouseRepulsion },
          uTwinkleIntensity: { value: twinkleIntensity },
          uRotationSpeed: { value: rotationSpeed },
          uRepulsionStrength: { value: repulsionStrength },
          uMouseActiveFactor: { value: 0.0 },
          uAutoCenterRepulsion: { value: autoCenterRepulsion },
          uTransparent: { value: transparent },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      // lerp 平滑光标 —— 目标值由 mousemove 写入，每帧逼近
      const target = { x: 0.5, y: 0.5, active: 0.0 };
      const smooth = { x: 0.5, y: 0.5, active: 0.0 };

      const onMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        target.x = (e.clientX - rect.left) / rect.width;
        target.y = 1.0 - (e.clientY - rect.top) / rect.height;
        target.active = 1.0;
      };
      const onLeave = () => {
        target.active = 0.0;
      };
      if (mouseInteraction) {
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
      }

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uResolution!.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / Math.max(gl.canvas.height, 1),
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          const time = t * 0.001;
          program.uniforms.uTime!.value = time;
          program.uniforms.uStarSpeed!.value = (time * starSpeed) / 10.0;

          const lerp = 0.05;
          smooth.x += (target.x - smooth.x) * lerp;
          smooth.y += (target.y - smooth.y) * lerp;
          smooth.active += (target.active - smooth.active) * lerp;

          const mouse = program.uniforms.uMouse!.value as Float32Array;
          mouse[0] = smooth.x;
          mouse[1] = smooth.y;
          program.uniforms.uMouseActiveFactor!.value = smooth.active;

          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          if (mouseInteraction) {
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
          }
          program.remove?.();
        },
      };
    },
    [
      focal[0],
      focal[1],
      rotation[0],
      rotation[1],
      starSpeed,
      density,
      hueShift,
      speed,
      mouseInteraction,
      glowIntensity,
      saturation,
      mouseRepulsion,
      repulsionStrength,
      twinkleIntensity,
      rotationSpeed,
      autoCenterRepulsion,
      transparent,
    ],
  );

  // reduced-motion / 无 WebGL：静态深空径向渐变 + 几点 token 微光
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:radial-gradient(ellipse_at_50%_50%,var(--color-chart-1)_0%,transparent_45%),radial-gradient(circle_at_30%_70%,var(--color-chart-4)_0%,transparent_25%),radial-gradient(circle_at_70%_30%,var(--color-chart-2)_0%,transparent_20%)]",
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
        "absolute inset-0 z-0 block h-full w-full",
        // 开启鼠标交互时需接收指针事件；否则纯装饰放行点击穿透
        mouseInteraction ? "pointer-events-auto" : "pointer-events-none",
        className,
      )}
      aria-hidden
    />
  );
}
