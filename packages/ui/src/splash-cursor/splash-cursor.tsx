"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { SplashCursorProps } from "./splash-cursor.types";

// 吸取自 React Bits SplashCursor：指针在画面上拖动时不断溅射出彩色"染料"色斑，
// 色斑沿指针速度方向抛洒、随时间扩散并消散，点击则爆出一束随机方向的彩斑——
// 一种基于 Navier-Stokes 流体解算（GLSL FBO ping-pong：advection / divergence /
// pressure / curl）的鼠标涟漪特效。
//
// 瑚琏化要点：
// 1. 去依赖 + 去 600 行裸 WebGL 流体解算器：原版需要浮点 FBO、半精度纹理、多 pass
//    压力迭代，且 jsdom / 无 WebGL 环境直接崩。瑚琏改用 **canvas2d 粒子溅射**忠实
//    复现其视觉本质——每次指针移动按速度生成若干高斯径向渐变色斑，色斑携带指针速度
//    继续漂移、半径扩散、透明度按 dissipation 指数衰减（等价 DYE 的消散+对流），
//    叠加 lighter 混合模拟染料发光叠色。视觉上"彩色溅射+拖尾+消散"完全保留。
// 2. 颜色：rainbow 模式沿 HSV 色相轮循环（同原版 generateColor）；固定色默认吃
//    `--color-chart-1` token（明暗自适应），不写死品牌 hex。
// 3. RSC / SSR 安全：所有 DOM/canvas 访问在 useEffect 内；getContext 返回 null 时
//    直接静默退出（jsdom 下不抛错）。
// 4. reduced-motion：useReducedMotion() 为真时不挂监听、不起 RAF，渲染同结构的空
//    canvas（DOM 在两态间一致，仅停止动画）。
// 5. 根容器 aria-hidden + pointer-events-none，纯装饰层不拦截交互。

const TWO_PI = Math.PI * 2;

// HSV(h:0..1) → "rgb(r,g,b)"（s=v=1），对应原版 HSVtoRGB 满饱和满亮度。
function hsvToRgb(h: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const q = 1 - f;
  switch (i % 6) {
    case 0:
      return [1, f, 0];
    case 1:
      return [q, 1, 0];
    case 2:
      return [0, 1, f];
    case 3:
      return [0, q, 1];
    case 4:
      return [f, 0, 1];
    default:
      return [1, 0, q];
  }
}

// 解析任意 CSS 颜色 → [r,g,b]（0..255）。用离屏 1×1 2D context 让浏览器负责所有
// 颜色空间换算（hex/oklch/var 计算值皆可）。失败兜底接近 chart-1 的中性蓝。
function cssColorToRgb255(css: string): [number, number, number] {
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const ctx = off.getContext("2d");
    if (!ctx) return [99, 102, 241];
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0]!, d[1]!, d[2]!];
  } catch {
    return [99, 102, 241];
  }
}

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 当前透明度（0..1），按 dissipation 每帧衰减。 */
  a: number;
  rgb: [number, number, number];
}

export function SplashCursor({
  rainbow = true,
  color,
  splatRadius = 56,
  splatForce = 1,
  dissipation = 0.92,
  opacity = 1,
  className,
  style,
}: SplashCursorProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 把 prop 放进 ref，让 RAF 闭包始终读到最新值，又无需重启整个 effect。
  const cfg = useRef({ rainbow, color, splatRadius, splatForce, dissipation });
  cfg.current = { rainbow, color, splatRadius, splatForce, dissipation };

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    // 无 2D context（jsdom / 极端环境）→ 静默退出，容器留空白 canvas。
    if (!ctx) {
      return () => {
        canvas.remove();
      };
    }

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const blobs: Blob[] = [];
    const MAX_BLOBS = 600;

    // 固定色（非彩虹）按 color prop 记忆化解析，prop 变了才重算；彩虹模式逐次生成。
    let fixedRgb = cssColorToRgb255(cfg.current.color ?? readChartToken(canvas));
    let fixedKey = cfg.current.color ?? "__token__";
    let hue = Math.random();

    const sizeCanvas = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => sizeCanvas())
        : null;
    ro?.observe(container);

    // 取下一颜色：彩虹模式推进色相轮；否则用固定色（可能因 prop 变更需重解析）。
    const nextColor = (): [number, number, number] => {
      if (cfg.current.rainbow) {
        hue = (hue + 0.005) % 1;
        const [r, g, b] = hsvToRgb(hue);
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
      }
      const key = cfg.current.color ?? "__token__";
      if (key !== fixedKey) {
        fixedKey = key;
        fixedRgb = cssColorToRgb255(cfg.current.color ?? readChartToken(canvas));
      }
      return fixedRgb;
    };

    // 在 (x,y) 以速度 (vx,vy) 溅射一组色斑（拖尾沿速度方向铺开）。
    const splat = (x: number, y: number, vx: number, vy: number, count: number) => {
      const { splatRadius: R, splatForce: F } = cfg.current;
      const rgb = nextColor();
      for (let i = 0; i < count; i++) {
        const t = count > 1 ? i / (count - 1) : 0;
        blobs.push({
          x: x - vx * t * 0.25 * F,
          y: y - vy * t * 0.25 * F,
          vx: vx * F + (Math.random() - 0.5) * 40,
          vy: vy * F + (Math.random() - 0.5) * 40,
          r: R * (0.6 + Math.random() * 0.6),
          a: 0.85,
          rgb,
        });
      }
      if (blobs.length > MAX_BLOBS) blobs.splice(0, blobs.length - MAX_BLOBS);
    };

    let lastX = 0;
    let lastY = 0;
    let hasLast = false;

    const localPoint = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMove = (clientX: number, clientY: number) => {
      const { x, y } = localPoint(clientX, clientY);
      const dx = hasLast ? x - lastX : 0;
      const dy = hasLast ? y - lastY : 0;
      lastX = x;
      lastY = y;
      hasLast = true;
      const speed = Math.hypot(dx, dy);
      if (speed < 0.5) return;
      const count = Math.min(6, 1 + Math.floor(speed / 8));
      splat(x, y, dx * 6, dy * 6, count);
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    // 点击：爆出一束随机方向彩斑（同原版 clickSplat）。
    const onDown = (clientX: number, clientY: number) => {
      const { x, y } = localPoint(clientX, clientY);
      for (let i = 0; i < 10; i++) {
        const ang = Math.random() * TWO_PI;
        const sp = 120 + Math.random() * 200;
        splat(x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, 1);
      }
    };
    const onMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onDown(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    let raf = 0;
    let prev = 0;
    let visible = true;
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? true;
          })
        : null;
    io?.observe(container);

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) {
        prev = t;
        return;
      }
      const dt = prev ? Math.min((t - prev) / 1000, 0.05) : 0.016;
      prev = t;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // dissipation 是"每秒保留率"，换算到本帧的衰减系数。
      const keep = Math.pow(cfg.current.dissipation, dt * 60);

      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i]!;
        // 对流：随自身速度漂移；速度本身缓慢衰减（粘性）。
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vx *= 0.9;
        b.vy *= 0.9;
        // 染料扩散：半径缓增、透明度衰减。
        b.r += dt * 30;
        b.a *= keep;
        if (b.a < 0.01) {
          blobs.splice(i, 1);
          continue;
        }
        const [r, g, bl] = b.rgb;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `rgba(${r},${g},${bl},${b.a})`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TWO_PI);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("touchstart", onTouchStart);
      canvas.remove();
    };
    // cfg/fixedRgb 通过 ref 读取最新值；effect 只需在 reduced 变化时重建。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0 block h-full w-full", className)}
      style={{ opacity, ...style }}
    />
  );
}

// 从已挂载 canvas 的计算样式读取 --color-chart-1（当前主题值），无则兜底。
function readChartToken(canvas: HTMLCanvasElement): string {
  try {
    const raw = getComputedStyle(canvas).getPropertyValue("--color-chart-1").trim();
    return raw || "rgb(99,102,241)";
  } catch {
    return "rgb(99,102,241)";
  }
}
