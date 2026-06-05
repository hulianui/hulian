"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type {
  ShapeGridProps,
  ShapeGridShape,
  ShapeGridDirection,
} from "./shape-grid.types";

// 吸取自 React Bits ShapeGrid：canvas2d 绘制的无限滚动几何网格
// （square / circle / triangle / hexagon 四形），单元沿指定方向匀速平移、首尾环绕；
// 鼠标悬停的单元缓动淡入填充色，可带渐隐拖尾。
//
// 瑚琏化要点：
// 1. 颜色全吃 token：边线默认 var(--color-border)、悬停填充默认 var(--color-primary)，
//    挂载时用 getComputedStyle 解析当前主题真实值，明暗自适应（替原版写死 #999 / #222）。
// 2. 零新依赖：纯 canvas2d + requestAnimationFrame，无 WebGL / 无 gsap。
// 3. reduced-motion：useReducedMotion() 为真时停止平移（speed=0），网格静态铺满、
//    悬停交互保留，DOM 不变（始终是同一个 canvas）。
// 4. jsdom 安全：getContext 返回 null 时静默不绘制、不抛错。
// 5. RSC：canvas 需 ref/effect/事件，故 "use client"；canvas 自身 aria-hidden 装饰层。

/** 把任意 CSS 颜色解析为 #rrggbb / rgba 字符串可直接喂给 ctx；解析失败回退。 */
function resolveColor(canvas: HTMLCanvasElement, css: string, fallback: string): string {
  // var(--…) 走 getComputedStyle 取真实值；其余原样返回（ctx 自己能解析 hex/oklch/rgb）。
  const trimmed = css.trim();
  const varMatch = /^var\(\s*(--[\w-]+)\s*\)$/.exec(trimmed);
  if (varMatch) {
    try {
      const resolved = getComputedStyle(canvas).getPropertyValue(varMatch[1]!).trim();
      return resolved || fallback;
    } catch {
      return fallback;
    }
  }
  return trimmed || fallback;
}

export function ShapeGrid({
  direction = "right",
  speed = 1,
  borderColor = "var(--color-border)",
  squareSize = 40,
  hoverFillColor = "var(--color-primary)",
  shape = "square",
  hoverTrailAmount = 0,
  className,
  style,
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  // 用 ref 持有最新参数，避免 effect 依赖频繁重建（事件/RAF 闭包读 latest）。
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // jsdom / 无 2d 上下文：静默降级，不抛错。
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dir: ShapeGridDirection = direction;
    const shp: ShapeGridShape = shape;
    const isHex = shp === "hexagon";
    const isTri = shp === "triangle";
    const hexHoriz = squareSize * 1.5;
    const hexVert = squareSize * Math.sqrt(3);

    // 主题色解析（挂载时一次性，跟随当前 data-theme）。
    const stroke = resolveColor(canvas, borderColor, "#999");
    const fill = resolveColor(canvas, hoverFillColor, "#222");

    const gridOffset = { x: 0, y: 0 };
    let hovered: { x: number; y: number } | null = null;
    const trail: Array<{ x: number; y: number }> = [];
    const opacities = new Map<string, number>();

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth || 1;
      canvas.height = canvas.offsetHeight || 1;
    };
    resizeCanvas();

    const drawHex = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    };

    const drawCircle = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    const drawTriangle = (cx: number, cy: number, size: number, flip: boolean) => {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + size / 2);
        ctx.lineTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy - size / 2);
      } else {
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
      }
      ctx.closePath();
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isHex) {
        const colShift = Math.floor(gridOffset.x / hexHoriz);
        const offsetX = ((gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.y % hexVert) + hexVert) % hexVert;
        const cols = Math.ceil(canvas.width / hexHoriz) + 3;
        const rows = Math.ceil(canvas.height / hexVert) + 3;
        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * hexHoriz + offsetX;
            const cy =
              row * hexVert + ((col + colShift) % 2 !== 0 ? hexVert / 2 : 0) + offsetY;
            const alpha = opacities.get(`${col},${row}`);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawHex(cx, cy, squareSize);
              ctx.fillStyle = fill;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            drawHex(cx, cy, squareSize);
            ctx.strokeStyle = stroke;
            ctx.stroke();
          }
        }
      } else if (isTri) {
        const halfW = squareSize / 2;
        const colShift = Math.floor(gridOffset.x / halfW);
        const rowShift = Math.floor(gridOffset.y / squareSize);
        const offsetX = ((gridOffset.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
        const cols = Math.ceil(canvas.width / halfW) + 4;
        const rows = Math.ceil(canvas.height / squareSize) + 4;
        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * halfW + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const flip = ((((col + colShift + row + rowShift) % 2) + 2) % 2) !== 0;
            const alpha = opacities.get(`${col},${row}`);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawTriangle(cx, cy, squareSize, flip);
              ctx.fillStyle = fill;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            drawTriangle(cx, cy, squareSize, flip);
            ctx.strokeStyle = stroke;
            ctx.stroke();
          }
        }
      } else if (shp === "circle") {
        const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
        const cols = Math.ceil(canvas.width / squareSize) + 3;
        const rows = Math.ceil(canvas.height / squareSize) + 3;
        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const cx = col * squareSize + squareSize / 2 + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const alpha = opacities.get(`${col},${row}`);
            if (alpha) {
              ctx.globalAlpha = alpha;
              drawCircle(cx, cy, squareSize);
              ctx.fillStyle = fill;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            drawCircle(cx, cy, squareSize);
            ctx.strokeStyle = stroke;
            ctx.stroke();
          }
        }
      } else {
        const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
        const cols = Math.ceil(canvas.width / squareSize) + 3;
        const rows = Math.ceil(canvas.height / squareSize) + 3;
        for (let col = -2; col < cols; col++) {
          for (let row = -2; row < rows; row++) {
            const sx = col * squareSize + offsetX;
            const sy = row * squareSize + offsetY;
            const alpha = opacities.get(`${col},${row}`);
            if (alpha) {
              ctx.globalAlpha = alpha;
              ctx.fillStyle = fill;
              ctx.fillRect(sx, sy, squareSize, squareSize);
              ctx.globalAlpha = 1;
            }
            ctx.strokeStyle = stroke;
            ctx.strokeRect(sx, sy, squareSize, squareSize);
          }
        }
      }
    };

    const updateCellOpacities = () => {
      const targets = new Map<string, number>();
      if (hovered) targets.set(`${hovered.x},${hovered.y}`, 1);
      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trail.length; i++) {
          const t = trail[i]!;
          const key = `${t.x},${t.y}`;
          if (!targets.has(key)) {
            targets.set(key, (trail.length - i) / (trail.length + 1));
          }
        }
      }
      for (const [key] of targets) {
        if (!opacities.has(key)) opacities.set(key, 0);
      }
      for (const [key, opacity] of opacities) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;
        if (next < 0.005) opacities.delete(key);
        else opacities.set(key, next);
      }
    };

    const stepOffset = () => {
      // reduced-motion：速度按 0 处理，网格静止（DOM 不变，悬停仍可用）。
      const effectiveSpeed = reducedRef.current ? 0 : Math.max(speed, 0.1);
      const wrapX = isHex ? hexHoriz * 2 : squareSize;
      const wrapY = isHex ? hexVert : isTri ? squareSize * 2 : squareSize;
      switch (dir) {
        case "right":
          gridOffset.x = (gridOffset.x - effectiveSpeed + wrapX) % wrapX;
          break;
        case "left":
          gridOffset.x = (gridOffset.x + effectiveSpeed + wrapX) % wrapX;
          break;
        case "up":
          gridOffset.y = (gridOffset.y + effectiveSpeed + wrapY) % wrapY;
          break;
        case "down":
          gridOffset.y = (gridOffset.y - effectiveSpeed + wrapY) % wrapY;
          break;
        case "diagonal":
          gridOffset.x = (gridOffset.x - effectiveSpeed + wrapX) % wrapX;
          gridOffset.y = (gridOffset.y - effectiveSpeed + wrapY) % wrapY;
          break;
        default:
          break;
      }
    };

    let raf = 0;
    const tick = () => {
      stepOffset();
      updateCellOpacities();
      drawGrid();
      raf = requestAnimationFrame(tick);
    };

    const pushTrail = () => {
      if (hovered && hoverTrailAmount > 0) {
        trail.unshift({ ...hovered });
        if (trail.length > hoverTrailAmount) trail.length = hoverTrailAmount;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      let col: number;
      let row: number;

      if (isHex) {
        const colShift = Math.floor(gridOffset.x / hexHoriz);
        const offsetX = ((gridOffset.x % hexHoriz) + hexHoriz) % hexHoriz;
        const offsetY = ((gridOffset.y % hexVert) + hexVert) % hexVert;
        col = Math.round((mouseX - offsetX) / hexHoriz);
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVert / 2 : 0;
        row = Math.round((mouseY - offsetY - rowOffset) / hexVert);
      } else if (isTri) {
        const halfW = squareSize / 2;
        const offsetX = ((gridOffset.x % halfW) + halfW) % halfW;
        const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
        col = Math.round((mouseX - offsetX) / halfW);
        row = Math.floor((mouseY - offsetY) / squareSize);
      } else if (shp === "circle") {
        const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
        col = Math.round((mouseX - offsetX) / squareSize);
        row = Math.round((mouseY - offsetY) / squareSize);
      } else {
        const offsetX = ((gridOffset.x % squareSize) + squareSize) % squareSize;
        const offsetY = ((gridOffset.y % squareSize) + squareSize) % squareSize;
        col = Math.floor((mouseX - offsetX) / squareSize);
        row = Math.floor((mouseY - offsetY) / squareSize);
      }

      if (!hovered || hovered.x !== col || hovered.y !== row) {
        pushTrail();
        hovered = { x: col, y: row };
      }
    };

    const handleMouseLeave = () => {
      pushTrail();
      hovered = null;
    };

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    direction,
    speed,
    borderColor,
    hoverFillColor,
    squareSize,
    shape,
    hoverTrailAmount,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("block h-full w-full border-none", className)}
      style={style}
    />
  );
}
