"use client";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { BeamsProps } from "./beams.types";

// 吸取自 React Bits Beams：一束束沿轴流动的体积光柱，由 perlin 噪声扰动起伏 +
// 方向光打亮 + 整体倾斜旋转，叠加胶片颗粒。
// 瑚琏化：
// 1. 去依赖——原版用 three.js + @react-three/fiber + drei 搭 3D 场景（堆叠平面 +
//    MeshStandardMaterial 顶点位移 + 方向光阴影）。这些都在禁用清单里，整体用 ogl
//    单个全屏 fragment shader 重新想象：把"3D 受光平面条带"压成 2D 程序化光柱，
//    用 classic perlin noise 调制每束亮度、用 dot(normal,light) 近似的纵向梯度模拟受光。
// 2. token——光束色默认读 canvas 计算样式里的 --color-chart-1（明暗自适应），
//    替原版写死 #ffffff；显式 lightColor 优先。
// 3. RSC / 降级——复用 useGlCanvas：懒加载 ogl（代码分割）、SSR 安全、StrictMode 安全
//    （每次挂载新建 canvas 避 loseContext 毒化）、离屏暂停、卸载兜底清理。
// 4. reduced-motion / 无 WebGL——useGlCanvas 返回 reduced=true 时渲染静态斜向渐变兜底，
//    DOM 始终是单个根 div（两态结构一致，不条件卸载内容）。

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`.trim();

// 体积光柱 fragment：
//  ① rotateUvs 把坐标整体倾斜（对应原版 group rotation）
//  ② x 方向用 beamNumber 个相位条带切出每束光，beamWidth 控制束内亮度峰宽
//  ③ y 方向 + 时间 喂入 classic perlin cnoise 做有机起伏（对应原版顶点 z 位移）
//  ④ 纵向梯度 + 噪声法线近似一个朝上的方向光，制造"受光"明暗
//  ⑤ 末尾减 hash 颗粒（对应原版 dithering_fragment 的 randomNoise）
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uColor;
uniform float uBeamNumber;
uniform float uBeamWidth;
uniform float uSpeed;
uniform float uNoiseIntensity;
uniform float uScale;
uniform float uRotation;

// classic perlin noise（cnoise，3D）—— 与原版同款 Stefan Gustavson 实现
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}

float hash(vec2 p){
  return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 rotate(vec2 v, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * v;
}

// 沿一束光的轴线给出噪声驱动的"凸起"高度（对应原版 getPos）
float beamHeight(vec2 p){
  vec3 np = vec3(0.0, p.y, p.x + uTime * uSpeed * 0.3) * uScale;
  return cnoise(np);
}

void main() {
  // 纠正画面纵横比 + 居中，使旋转不被拉伸
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv - 0.5;
  p.x *= aspect;
  p = rotate(p, radians(uRotation));

  // x 方向切条带：把 x 映射到 [0, beamNumber) 个相位
  float lane = (p.x + aspect * 0.5) * uBeamNumber;
  float laneId = floor(lane);
  float laneFrac = fract(lane);

  // 每束随机相位错开，避免机械感
  float phase = hash(vec2(laneId, 7.0)) * 6.2831853;

  // 束内亮度峰：以束中线为峰，beamWidth 控制峰宽（越大越饱满）
  float center = abs(laneFrac - 0.5) * 2.0;       // 0=中线 1=束缝
  float fill = clamp(uBeamWidth * 0.5, 0.05, 1.0);
  float band = smoothstep(1.0, 1.0 - fill, center);

  // 沿束的噪声起伏（"受光面"高度）
  float h = beamHeight(vec2(laneId * 0.7 + phase, p.y * 3.0));
  // 近似方向光：相邻采样求梯度作法线，与朝上光向点乘
  float hx = beamHeight(vec2(laneId * 0.7 + phase + 0.01, p.y * 3.0));
  float hy = beamHeight(vec2(laneId * 0.7 + phase, p.y * 3.0 + 0.01));
  vec3 normal = normalize(vec3(-(hx - h), -(hy - h), 0.25));
  float diffuse = clamp(dot(normal, normalize(vec3(0.0, 0.6, 1.0))), 0.0, 1.0);

  // 纵向渐隐 + 噪声调制亮度
  float vertical = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
  float glow = band * (0.35 + 0.65 * diffuse) * (0.6 + 0.4 * (h * 0.5 + 0.5));
  glow *= mix(0.55, 1.0, vertical);

  vec3 col = uColor * glow;

  // 胶片颗粒（对应原版 dithering_fragment）
  float grain = hash(gl_FragCoord.xy + uTime);
  col -= grain / 15.0 * uNoiseIntensity;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`.trim();

// CSS 颜色 → [r,g,b]（0..1），借离屏 canvas 让浏览器解析任意颜色空间
function cssColorToRgb01(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [1, 1, 1];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return [1, 1, 1];
  }
}

// 从挂载后的 canvas 读取当前主题下的 --color-chart-1
function resolveChartToken(canvas: HTMLCanvasElement): [number, number, number] {
  const raw = getComputedStyle(canvas).getPropertyValue("--color-chart-1").trim();
  if (!raw) return [1, 1, 1];
  return cssColorToRgb01(raw);
}

/**
 * Beams — 流动体积光柱 WebGL 背景。
 *
 * 重新想象自 react-bits Beams：原版 three.js 3D 受光平面 → 瑚琏 ogl 单 fragment shader。
 * 默认颜色吃 `--color-chart-1` token；reduced-motion / 无 WebGL 自动降级为静态斜向渐变。
 *
 * 用法：放在 `relative` 容器里，组件自带 `absolute inset-0 z-0`。
 */
export function Beams({
  beamNumber = 12,
  beamWidth = 2,
  speed = 2,
  lightColor,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 30,
  className,
  fallback,
}: BeamsProps) {
  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Color, Vec2 } = ogl;

      const dpr = Math.min(
        typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        2,
      );
      const renderer = new Renderer({ canvas, alpha: false, dpr });
      const gl = renderer.gl;

      const [r, g, b] = lightColor
        ? cssColorToRgb01(lightColor)
        : resolveChartToken(canvas);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Vec2(1, 1) },
          uColor: { value: new Color(r, g, b) },
          uBeamNumber: { value: beamNumber },
          uBeamWidth: { value: beamWidth },
          uSpeed: { value: speed },
          uNoiseIntensity: { value: noiseIntensity },
          uScale: { value: scale },
          uRotation: { value: rotation },
        },
      });

      const geometry = new Triangle(gl);
      const mesh = new Mesh(gl, { geometry, program });

      const resize = (w: number, h: number) => {
        renderer.setSize(w || 1, h || 1);
        program.uniforms.uResolution!.value.set(
          gl.drawingBufferWidth || 1,
          gl.drawingBufferHeight || 1,
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      return {
        render(t: number) {
          program.uniforms.uTime!.value = t * 0.001;
          renderer.render({ scene: mesh });
        },
        resize,
        dispose() {
          program.remove?.();
        },
      };
    },
    [beamNumber, beamWidth, speed, lightColor, noiseIntensity, scale, rotation],
  );

  // reduced-motion / 无 WebGL：静态斜向渐变兜底（用 chart token 营造光柱层次感）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          "[background:repeating-linear-gradient(115deg,transparent_0%,var(--color-chart-1)_6%,transparent_12%,transparent_18%)]",
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
