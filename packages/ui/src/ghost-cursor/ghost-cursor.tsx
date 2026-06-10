"use client";
import { useRef } from "react";
import { useGlCanvas } from "../lib/use-gl-canvas";
import { cn } from "../lib/cn";
import type { GhostCursorProps } from "./ghost-cursor.types";

// 吸取自 React Bits GhostCursor：跟随指针的烟雾/幽灵拖尾——fbm 噪声生成有机烟团，
// 一条环形帧缓冲记录历史指针位置叠加成绵延尾迹，指针停下后靠惯性继续滑行并渐隐。
//
// 瑚琏化要点：
// 1. 去重型依赖：原版用 three.js + EffectComposer + UnrealBloomPass + FilmGrainPass（≈600KB）。
//    瑚琏全部以单张 ogl 全屏 shader 重写——辉光用 brightness 增益近似补偿，颗粒在片元内
//    叠 hash 噪声近似 FilmGrain，去掉 postprocessing 管线（approximated，但视觉接近）。
// 2. 颜色吃 token：默认主色 var(--color-chart-1)，运行时解析为 RGB 喂 shader uniform，
//    自动明暗适配，替原版写死的 #B497CF。
// 3. WebGL 生命周期复用 useGlCanvas：懒加载 ogl（base bundle 零成本）、StrictMode 安全
//    （每挂载新建 canvas 避免 loseContext 毒化）、离屏暂停、ResizeObserver 自适应。
// 4. reduced-motion / 无 WebGL → 静态径向渐变光斑 fallback（吃 chart token，DOM 不卸载内容）。
// 5. RSC 安全靠拆分：本文件 "use client"，纯装饰 aria-hidden。

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

// 片元着色器：fbm 烟雾 blob，沿当前指针 + 历史拖尾累加。
// MAX_TRAIL_LENGTH 由 defines 注入（GLSL 循环上界必须为常量）。
const FRAG = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3  iResolution;
  uniform vec2  iMouse;
  uniform vec2  iPrevMouse[MAX_TRAIL_LENGTH];
  uniform float iOpacity;
  uniform float iScale;
  uniform vec3  iBaseColor;
  uniform float iBrightness;
  uniform float iGrain;
  varying vec2  vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float hash1(float n){ return fract(sin(n) * 43758.5453); }

  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  vec3 tint1(vec3 base){ return mix(base, vec3(1.0), 0.15); }
  vec3 tint2(vec3 base){ return mix(base, vec3(0.8, 0.9, 1.0), 0.25); }

  vec4 blob(vec2 p, vec2 mousePos, float intensity, float activity) {
    vec2 q = vec2(fbm(p * iScale + iTime * 0.1), fbm(p * iScale + vec2(5.2, 1.3) + iTime * 0.1));
    vec2 r = vec2(fbm(p * iScale + q * 1.5 + iTime * 0.15), fbm(p * iScale + q * 1.5 + vec2(8.3, 2.8) + iTime * 0.15));

    float smoke = fbm(p * iScale + r * 0.8);
    float radius = 0.5 + 0.3 * (1.0 / iScale);
    float distFactor = 1.0 - smoothstep(0.0, radius * activity, length(p - mousePos));
    float alpha = pow(smoke, 2.5) * distFactor;

    vec3 c1 = tint1(iBaseColor);
    vec3 c2 = tint2(iBaseColor);
    vec3 col = mix(c1, c2, sin(iTime * 0.5) * 0.5 + 0.5);

    return vec4(col * alpha * intensity, alpha * intensity);
  }

  void main() {
    float aspect = iResolution.x / iResolution.y;
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(aspect, 1.0);
    vec2 mouse = (iMouse * 2.0 - 1.0) * vec2(aspect, 1.0);

    vec3 colorAcc = vec3(0.0);
    float alphaAcc = 0.0;

    vec4 b = blob(uv, mouse, 1.0, iOpacity);
    colorAcc += b.rgb;
    alphaAcc += b.a;

    for (int i = 0; i < MAX_TRAIL_LENGTH; i++) {
      vec2 pm = (iPrevMouse[i] * 2.0 - 1.0) * vec2(aspect, 1.0);
      float t = 1.0 - float(i) / float(MAX_TRAIL_LENGTH);
      t = pow(t, 2.0);
      if (t > 0.01) {
        vec4 bt = blob(uv, pm, t * 0.8, iOpacity);
        colorAcc += bt.rgb;
        alphaAcc += bt.a;
      }
    }

    // 亮度增益：近似补偿被移除的 UnrealBloom 辉光。
    colorAcc *= iBrightness;

    // 胶片颗粒：近似原版 FilmGrainPass，片元内叠 hash 噪点。
    if (iGrain > 0.0) {
      float n = hash1(vUv.x * 1000.0 + vUv.y * 2000.0 + iTime) * 2.0 - 1.0;
      colorAcc += n * iGrain * colorAcc;
    }

    float outAlpha = clamp(alphaAcc * iOpacity, 0.0, 1.0);
    gl_FragColor = vec4(colorAcc, outAlpha);
  }
`;

const DEFAULT_COLOR = "var(--color-chart-1)";

// ---------------------------------------------------------------------------
// CSS 颜色 → [r, g, b]（0–1）：离屏 1×1 canvas2d 解析（hex/named/rgb/oklch 全格式）。
// 注意：ogl 的 Color 只认 hex/named/rgb，遇 var(--…)/oklch() 只 warn 不 throw 且返回
// (0,0,0) —— 黑色在 mix-blend-mode:screen 下完全不可见（文档站"纯黑无拖尾"根因）。
// 故颜色解析一律走 canvas2d（与 ripple-grid / plasma 同模式），不走 ogl Color。
// ---------------------------------------------------------------------------
function cssColorToRgb01(css: string): [number, number, number] | null {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    // 哨兵：无效颜色赋值会被 canvas 静默忽略（fillStyle 保持原值），先放哨兵即可甄别。
    ctx.fillStyle = "#ff00fe";
    ctx.fillStyle = css;
    if (ctx.fillStyle === "#ff00fe") return null;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]! / 255, d[1]! / 255, d[2]! / 255];
  } catch {
    return null;
  }
}

export function GhostCursor({
  trailLength = 32,
  inertia = 0.5,
  grainIntensity = 0.05,
  brightness = 1.2,
  color = DEFAULT_COLOR,
  scale = 1,
  mixBlendMode = "screen",
  className,
  style,
}: GhostCursorProps) {
  // 把最新 prop 挂 ref，让 render 回调直接读，避免重建 GL context。
  const inertiaRef = useRef(inertia);
  const brightnessRef = useRef(brightness);
  const grainRef = useRef(grainIntensity);
  const scaleRef = useRef(scale);
  const colorRef = useRef(color);
  inertiaRef.current = inertia;
  brightnessRef.current = brightness;
  grainRef.current = grainIntensity;
  scaleRef.current = scale;
  colorRef.current = color;

  // trailLength 决定 shader define（数组长度），变化须重建 → 进 deps。
  const maxTrail = Math.max(1, Math.floor(trailLength));

  const { ref, reduced } = useGlCanvas(
    ({ ogl, canvas }) => {
      const { Renderer, Program, Mesh, Triangle, Vec2, Vec3 } = ogl;

      const renderer = new Renderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        depth: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      // 解析颜色字符串 → RGB float：
      // var(--…) 先从挂载中的 canvas 计算样式取 token 真值（随明暗主题），
      // 真值/直接值（hex/rgb/oklch/named）再经离屏 canvas2d 转 rgb。
      // 全部失败兜底原版默认蓝紫（≈ #B497CF）。
      const parseColor = (input: string): [number, number, number] => {
        let css = input.trim();
        const varMatch = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/.exec(css);
        if (varMatch) {
          const resolved = getComputedStyle(canvas).getPropertyValue(varMatch[1]!).trim();
          css = resolved || (varMatch[2]?.trim() ?? "");
        }
        return (css ? cssColorToRgb01(css) : null) ?? [0.71, 0.59, 0.81];
      };

      const baseColor = parseColor(colorRef.current);

      // ogl 无 three 的 defines 选项 → 把 GLSL 循环上界常量直接字符串替换进片元源码。
      const patchedFrag = FRAG.replace(/MAX_TRAIL_LENGTH/g, String(maxTrail));

      // 环形帧缓冲：记录历史指针 UV，render 每帧推进 head，按时间序填 iPrevMouse。
      const trail: Array<[number, number]> = Array.from({ length: maxTrail }, () => [0.5, 0.5]);
      let head = 0;

      const prevMouse: InstanceType<typeof Vec2>[] = Array.from(
        { length: maxTrail },
        () => new Vec2(0.5, 0.5),
      );

      const program = new Program(gl, {
        vertex: VERT,
        fragment: patchedFrag,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Vec3(1, 1, 1) },
          iMouse: { value: new Vec2(0.5, 0.5) },
          iPrevMouse: { value: prevMouse },
          iOpacity: { value: 1 },
          iScale: { value: Math.max(0.1, scaleRef.current) },
          iBaseColor: { value: new Vec3(baseColor[0], baseColor[1], baseColor[2]) },
          iBrightness: { value: brightnessRef.current },
          iGrain: { value: grainRef.current },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

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

      // ── 指针跟踪状态 ──
      const target: [number, number] = [0.5, 0.5]; // 目标 UV（最新指针）
      const cur: [number, number] = [0.5, 0.5]; // 当前 UV（含惯性插值）
      const vel: [number, number] = [0, 0];
      let pointerActive = false;
      let lastMove = performance.now();
      let fadeOpacity = 1;
      const FADE_DELAY = 800; // ms 停止后多久开始渐隐
      const FADE_DURATION = 1200; // ms 渐隐时长

      // 监听挂 window（同 splash-cursor 模式）：根容器是 pointer-events-none 的装饰
      // overlay，canvas 永远不会成为事件目标——挂 canvas 上的监听一次都不会触发。
      // 在 window 层收事件后按 canvas rect 判定进出 + 换算 UV。
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (!inside) {
          if (pointerActive) {
            pointerActive = false;
            lastMove = performance.now();
          }
          return;
        }
        target[0] = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width)));
        target[1] = Math.min(
          1,
          Math.max(0, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)),
        );
        pointerActive = true;
        lastMove = performance.now();
      };
      // 指针离开整个窗口（relatedTarget 为空）→ 视为离场，开始惯性滑行 + 渐隐。
      const onPointerOut = (e: PointerEvent) => {
        if (!e.relatedTarget) {
          pointerActive = false;
          lastMove = performance.now();
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerout", onPointerOut, { passive: true });

      const render = (t: number) => {
        // 同步运行时 props。
        program.uniforms.iBrightness.value = brightnessRef.current;
        program.uniforms.iGrain.value = grainRef.current;
        program.uniforms.iScale.value = Math.max(0.1, scaleRef.current);

        const now = performance.now();
        const inert = Math.min(0.99, Math.max(0, inertiaRef.current));

        if (pointerActive) {
          vel[0] = target[0] - cur[0];
          vel[1] = target[1] - cur[1];
          cur[0] = target[0];
          cur[1] = target[1];
          fadeOpacity = 1;
        } else {
          // 惯性滑行：速度按 inertia 衰减继续推进当前位置。
          vel[0] *= inert;
          vel[1] *= inert;
          if (vel[0] * vel[0] + vel[1] * vel[1] > 1e-6) {
            cur[0] += vel[0];
            cur[1] += vel[1];
          }
          const dt = now - lastMove;
          if (dt > FADE_DELAY) {
            const k = Math.min(1, (dt - FADE_DELAY) / FADE_DURATION);
            fadeOpacity = Math.max(0, 1 - k);
          }
        }

        program.uniforms.iMouse.value.set(cur[0], cur[1]);

        // 推进环形缓冲并按时间序填充 iPrevMouse[0..N-1]（0=最新）。
        const N = trail.length;
        head = (head + 1) % N;
        trail[head][0] = cur[0];
        trail[head][1] = cur[1];
        for (let i = 0; i < N; i++) {
          const srcIdx = (head - i + N) % N;
          prevMouse[i].set(trail[srcIdx][0], trail[srcIdx][1]);
        }

        program.uniforms.iOpacity.value = fadeOpacity;
        program.uniforms.iTime.value = t * 0.001;

        renderer.render({ scene: mesh });
      };

      const dispose = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerout", onPointerOut);
      };

      return { render, resize, dispose };
    },
    // trailLength 变化须重建（GLSL 数组长度是编译期常量）；color 通过下方 key 强制 remount。
    [maxTrail],
  );

  // reduced-motion / 无 WebGL fallback：静态径向渐变光斑（吃 chart token，内容不卸载）。
  if (reduced) {
    return (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,var(--color-chart-1)_0%,transparent_70%)]",
          "opacity-40",
          className,
        )}
        style={style}
      />
    );
  }

  return (
    <div
      // color 改变时换 key 触发 remount，让 shader 重新解析颜色（避免每帧解析开销）。
      key={color}
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ mixBlendMode, ...style }}
    />
  );
}
