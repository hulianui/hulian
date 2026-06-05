"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { OrbProps } from "./orb.types";

// 来源：react-bits DavidHDev/react-bits · Backgrounds/Orb
// GLSL 原样移植；瑚琏化：
//   - 移除 backgroundColor uniform（光球本身透明背景由容器决定）
//   - baseColor 常量保持原蓝紫色系（与 --color-chart-1 oklch(0.62 0.19 255) 蓝色接近）
//   - hue prop 可在 demo 里对齐到其他 chart token 色相
//   - canvas 默认 block h-full w-full；由容器控制尺寸（Orb 是焦点元素，不是全屏背景）
//   - reduced-motion → 静态径向渐变球 fallback，吃 chart token，圆形

// ────────────────────────────────────────────────────────────────
// GLSL shaders（原样从 react-bits 移植，未改动 uniform 语义）
// ────────────────────────────────────────────────────────────────

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

const FRAG = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  varying vec2 vUv;

  vec3 rgb2yiq(vec3 c) {
    float y = dot(c, vec3(0.299, 0.587, 0.114));
    float i = dot(c, vec3(0.596, -0.274, -0.322));
    float q = dot(c, vec3(0.211, -0.523, 0.312));
    return vec3(y, i, q);
  }

  vec3 yiq2rgb(vec3 c) {
    float r = c.x + 0.956 * c.y + 0.621 * c.z;
    float g = c.x - 0.272 * c.y - 0.647 * c.z;
    float b = c.x - 1.106 * c.y + 1.703 * c.z;
    return vec3(r, g, b);
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = hueDeg * 3.14159265 / 180.0;
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    float i = yiq.y * cosA - yiq.z * sinA;
    float q = yiq.y * sinA + yiq.z * cosA;
    yiq.y = i;
    yiq.z = q;
    return yiq2rgb(yiq);
  }

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
      p3.x + p3.y,
      p3.x + p3.z,
      p3.y + p3.z
    ) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(
      dot(d0, d0),
      dot(d1, d1),
      dot(d2, d2),
      dot(d3, d3)
    ), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  /* 基底色：蓝紫色系，与瑚琏 --color-chart-1 (oklch 0.62 0.19 255) 对齐。
     hue prop 可旋转到任意色相（0=蓝紫 / 约120=绿 / 约60=琥珀 / 约-60=紫红）。 */
  const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
  const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
  const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
  const float innerRadius = 0.6;
  const float noiseScale = 0.65;

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }
  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec4 draw(vec2 uv) {
    vec3 color1 = adjustHue(baseColor1, hue);
    vec3 color2 = adjustHue(baseColor2, hue);
    vec3 color3 = adjustHue(baseColor3, hue);

    float ang = atan(uv.y, uv.x);
    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;

    /* 移除 backgroundColor 混合，改为深色底（适合透明背景渲染，
       容器背景由 CSS 决定，光球自身保持暗底发光态）。 */
    float bgLuminance = 0.0;

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
    float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);

    v0 *= smoothstep(r0 * 1.05, r0, len);
    float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
    v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
    float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

    float a = iTime * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 colBase = mix(color1, color2, cl);
    float fadeAmount = mix(1.0, 0.1, bgLuminance);

    vec3 darkCol = mix(color3, colBase, v0);
    darkCol = (darkCol + v1) * v2 * v3;
    darkCol = clamp(darkCol, 0.0, 1.0);

    vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
    lightCol = mix(vec3(0.0), lightCol, v0);
    lightCol = clamp(lightCol, 0.0, 1.0);

    vec3 finalCol = mix(darkCol, lightCol, bgLuminance);

    return extractAlpha(finalCol);
  }

  vec4 mainImage(vec2 fragCoord) {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord - center) / size * 2.0;

    float angle = rot;
    float s = sin(angle);
    float c = cos(angle);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
    uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

    return draw(uv);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec4 col = mainImage(fragCoord);
    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`;

// ────────────────────────────────────────────────────────────────
// Orb 组件
// ────────────────────────────────────────────────────────────────

export function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  className,
  fallback,
}: OrbProps) {
  // 用 ref 把运行时状态暴露给 setup 闭包（避免 setup 被频繁重建）
  const hoverRef = useRef(0);       // current lerped hover value (0–1)
  const targetHoverRef = useRef(0); // target hover (0 or 1)
  const rotRef = useRef(0);         // cumulative rotation (radians)
  const lastTimeRef = useRef(0);    // previous frame timestamp (ms)

  // 把 prop 最新值也挂 ref，让 render 回调直接读，不依赖闭包捕获
  const hueRef = useRef(hue);
  const hoverIntensityRef = useRef(hoverIntensity);
  const rotateOnHoverRef = useRef(rotateOnHover);
  const forceHoverRef = useRef(forceHoverState);

  hueRef.current = hue;
  hoverIntensityRef.current = hoverIntensity;
  rotateOnHoverRef.current = rotateOnHover;
  forceHoverRef.current = forceHoverState;

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec3 } = ogl;

      const renderer = new Renderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Vec3(1, 1, 1) },
          hue: { value: hue },
          hover: { value: 0 },
          rot: { value: 0 },
          hoverIntensity: { value: hoverIntensity },
        },
      });

      const mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program,
      });

      const resize = (w: number, h: number) => {
        const dpr = renderer.dpr;
        renderer.setSize(w || 1, h || 1);
        program.uniforms.iResolution.value.set(
          (w || 1) * dpr,
          (h || 1) * dpr,
          ((w || 1) / (h || 1)) || 1,
        );
      };
      resize(canvas.clientWidth, canvas.clientHeight);

      // ── pointer 事件：命中圆内 → hover；离开 → 重置 ──
      const ROT_SPEED = 0.3; // rad/s

      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;
        const size = Math.min(w, h);
        const uvX = ((x - w / 2) / size) * 2.0;
        const uvY = ((y - h / 2) / size) * 2.0;
        targetHoverRef.current = Math.sqrt(uvX * uvX + uvY * uvY) < 0.8 ? 1 : 0;
      };

      const onPointerLeave = () => {
        targetHoverRef.current = 0;
      };

      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);

      const render = (t: number) => {
        const dt = Math.min((t - lastTimeRef.current) * 0.001, 0.1); // cap at 100ms
        lastTimeRef.current = t;

        // 同步 prop 最新值
        program.uniforms.hue.value = hueRef.current;
        program.uniforms.hoverIntensity.value = hoverIntensityRef.current;

        // hover lerp
        const effective = forceHoverRef.current ? 1 : targetHoverRef.current;
        hoverRef.current += (effective - hoverRef.current) * 0.1;
        program.uniforms.hover.value = hoverRef.current;

        // rotation
        if (rotateOnHoverRef.current && effective > 0.5) {
          rotRef.current += dt * ROT_SPEED;
        }
        program.uniforms.rot.value = rotRef.current;

        program.uniforms.iTime.value = t * 0.001;
        renderer.render({ scene: mesh });
      };

      const dispose = () => {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      };

      return { render, resize, dispose };
    },
    // deps: 只在这些值变化时重建 GL context（pointer handler 通过 ref 读，不加入 deps）
    // hue/hoverIntensity/rotateOnHover/forceHoverState 运行时通过 ref 同步，无需重建
    [],
  );

  // ── reduced-motion / 无 WebGL fallback：静态径向渐变球 ──
  if (reduced) {
    return (
      <div
        className={cn(
          "block h-full w-full rounded-full",
          "bg-[radial-gradient(ellipse_at_center,var(--color-chart-1)_0%,var(--color-chart-4)_45%,transparent_70%)]",
          "opacity-90",
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
      aria-hidden
      className={cn("block h-full w-full", className)}
    />
  );
}
