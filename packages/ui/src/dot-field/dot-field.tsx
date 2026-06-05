"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { DotFieldProps } from "./dot-field.types";

// 吸取自 React Bits DotField：canvas2d 点阵背景，光标靠近时点被推挤鼓胀（bulge），
// 快速移动时点阵下方泛起一团径向辉光，可选全局波浪起伏 + 随机星点闪烁。
// 瑚琏化：① 颜色全吃 token（点阵默认 --color-chart-1、辉光默认 --color-primary，自动明暗适配，
//          替原版写死的 rgba 紫 / #120F17 深底）；② 去掉原版 SVG glow 层与全局 mousemove/pageX
//          坐标换算，改为容器局部 pointermove + 单层 canvas 内绘制辉光，更克制、易嵌入；
// ③ "use client" + raw requestAnimationFrame（无新依赖）；④ useReducedMotion() 门控：减弱动画时
//          停掉 RAF 与指针交互，只静态绘制一帧规整点阵（DOM 结构两态一致，从不卸载内容）；
// ⑤ jsdom / 无 2d context 安全：getContext 返回 null 直接早退，不抛错。

/**
 * 离屏解析任意 CSS 颜色（含主题 token 计算值）为 `"r,g,b"` 字符串，浏览器负责颜色空间转换。
 * fallback 传一个合法 CSS 颜色（如 "#9678e6"），token 解析不到时退回它。
 */
function resolveColor(canvas: HTMLCanvasElement, css: string, fallback: string): string {
  // 若是 var(--…) 形式，先从计算样式取真实值；取不到则用 fallback 颜色。
  let value = css;
  const m = css.match(/var\(\s*(--[\w-]+)\s*\)/);
  if (m) {
    const resolved = getComputedStyle(canvas).getPropertyValue(m[1]!).trim();
    value = resolved || fallback;
  }
  try {
    const off = document.createElement("canvas");
    off.width = 1;
    off.height = 1;
    const octx = off.getContext("2d");
    if (!octx) return "150,120,230";
    octx.fillStyle = value || fallback;
    octx.fillRect(0, 0, 1, 1);
    const d = octx.getImageData(0, 0, 1, 1).data;
    return `${d[0]},${d[1]},${d[2]}`;
  } catch {
    return "150,120,230";
  }
}

const TWO_PI = Math.PI * 2;

interface Dot {
  ax: number; // 锚点 x
  ay: number; // 锚点 y
  sx: number; // 当前绘制 x（弹性插值）
  sy: number;
}

export function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 220,
  bulgeStrength = 56,
  color = "var(--color-chart-1)",
  glowColor = "var(--color-primary)",
  glowRadius = 160,
  waveAmplitude = 0,
  sparkle = false,
  className,
  style,
  ...props
}: DotFieldProps) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return; // jsdom / 无 2d context → 早退，不抛错

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    const rgbDot = resolveColor(canvas, color, "#9678e6");
    const rgbGlow = resolveColor(canvas, glowColor, "#786efa");

    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    let engagement = 0;
    let glowOpacity = 0;
    let frame = 0;
    let raf = 0;

    function buildDots() {
      const step = dotRadius + dotSpacing;
      const cols = Math.max(0, Math.floor(w / step));
      const rows = Math.max(0, Math.floor(h / step));
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const next: Dot[] = new Array(rows * cols);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          next[idx++] = { ax, ay, sx: ax, sy: ay };
        }
      }
      dots = next;
    }

    function resize() {
      const rect = parent!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = Math.max(1, Math.floor(w * dpr));
      canvas!.height = Math.max(1, Math.floor(h * dpr));
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    }

    function drawDots(t: number, eng: number) {
      ctx!.clearRect(0, 0, w, h);

      // 辉光层（先画，沉在点阵下方）
      if (glowRadius > 0 && glowOpacity > 0.01) {
        const grad = ctx!.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          glowRadius,
        );
        grad.addColorStop(0, `rgba(${rgbGlow},${(glowOpacity * 0.5).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${rgbGlow},0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      const cr = cursorRadius;
      const crSq = cr * cr;
      const rad = dotRadius;
      const len = dots.length;

      ctx!.fillStyle = `rgb(${rgbDot})`;
      ctx!.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i]!;
        const dx = mouse.x - d.ax;
        const dy = mouse.y - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq) || 0.0001;
          const k = 1 - dist / cr;
          const push = k * k * bulgeStrength * eng;
          const angle = Math.atan2(dy, dx);
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy;
        if (waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * waveAmplitude * 0.5;
        }

        let r = rad;
        if (sparkle) {
          const hash = ((i * 2654435761) ^ (frame >> 3)) >>> 0;
          if (hash % 100 < 3) r = rad * 1.8;
        }
        ctx!.moveTo(drawX + r, drawY);
        ctx!.arc(drawX, drawY, r, 0, TWO_PI);
      }

      ctx!.fill();
    }

    // 静态一帧（reduced-motion 或初始）：规整点阵，无交互
    function drawStatic() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = `rgb(${rgbDot})`;
      ctx!.beginPath();
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]!;
        ctx!.moveTo(d.ax + dotRadius, d.ay);
        ctx!.arc(d.ax, d.ay, dotRadius, 0, TWO_PI);
      }
      ctx!.fill();
    }

    function updateSpeed() {
      const dx = mouse.prevX - mouse.x;
      const dy = mouse.prevY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouse.speed += (dist - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onPointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function tick() {
      frame++;
      const t = frame * 0.02;

      updateSpeed();
      const targetEng = Math.min(mouse.speed / 5, 1);
      engagement += (targetEng - engagement) * 0.06;
      if (engagement < 0.001) engagement = 0;
      glowOpacity += (engagement - glowOpacity) * 0.08;

      drawDots(t, engagement);
      raf = requestAnimationFrame(tick);
    }

    resize();

    // reduced-motion：只画静态点阵一帧，不挂 RAF / 不挂指针监听
    if (reduced) {
      drawStatic();
      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              resize();
              drawStatic();
            })
          : null;
      ro?.observe(parent);
      return () => ro?.disconnect();
    }

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
    ro?.observe(parent);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reduced,
    dotRadius,
    dotSpacing,
    cursorRadius,
    bulgeStrength,
    color,
    glowColor,
    glowRadius,
    waveAmplitude,
    sparkle,
  ]);

  return (
    <div
      {...props}
      aria-hidden
      className={cn("pointer-events-auto relative h-full w-full overflow-hidden", className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}
