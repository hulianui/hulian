"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { FuzzyTextProps } from "./fuzzy-text.types";

// 吸取自 React Bits FuzzyText：把文字先画进离屏 canvas，再逐行（或逐列）随机水平/垂直错位重绘，
// 形成「信号噪点 / 扫描雪花」般的模糊字效；悬停时抖动加剧。
// 瑚琏化：去除 gsap/glitch 等冗余开关，保留核心扫描算法；颜色默认吃 var(--color-foreground)（随明暗主题）；
// "use client" + RAF；reduced-motion 时关掉抖动只画一帧静态字形（DOM 不变，仍渲染同一 canvas）；
// jsdom 下 getContext 返回 null 直接静默返回，测试安全。
//
// 颜色解析：canvas2d fillStyle 不解析 var()/currentColor 字符串（非法赋值被静默忽略、
// 退回默认黑）。因此 color prop 先落到 canvas 元素自身的 CSS color（render 处
// style={{ color, ...style }}，用户 style.color 可覆盖），绘制前经 getComputedStyle
// 在元素上下文里解析出真颜色值（rgb()/oklch() 等浏览器 computed 形态）再喂 fillStyle——
// token 随明暗主题（含局部 [data-theme] 作用域）自动取对值，文字与所处背景对比可读。
export function FuzzyText({
  children,
  fontSize = "clamp(2rem, 10vw, 10rem)",
  fontWeight = 900,
  fontFamily = "inherit",
  color = "var(--color-foreground)",
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  fuzzRange = 30,
  direction = "horizontal",
  className,
  style,
  ...props
}: FuzzyTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId = 0;
    let isCancelled = false;
    let detachListeners: (() => void) | null = null;

    const init = async () => {
      const ctx = canvas.getContext("2d");
      // jsdom / 不支持 2d context 的环境直接退出，不抛错
      if (!ctx) return;

      const computedStyle = window.getComputedStyle(canvas);
      const computedFontFamily =
        fontFamily === "inherit"
          ? computedStyle.fontFamily || "sans-serif"
          : fontFamily;

      // canvas2d fillStyle 不认 var()/currentColor —— color prop 已落在 canvas 的
      // CSS color 上（见 render 处），这里读 computed 值拿解析后的真颜色。
      // 浏览器 computed color 永远是合法颜色字符串，fillStyle 可直接消费。
      const resolvedColor = computedStyle.color || "#808080";

      const fontSizeStr = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
      const fontString = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;

      try {
        await document.fonts?.load(fontString);
      } catch {
        await document.fonts?.ready;
      }
      if (isCancelled) return;

      // 解析数值字号：数字直接用，字符串（含 clamp）借临时 span 取 computed px
      let numericFontSize: number;
      if (typeof fontSize === "number") {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement("span");
        temp.style.fontSize = fontSize;
        document.body.appendChild(temp);
        numericFontSize = parseFloat(window.getComputedStyle(temp).fontSize) || 32;
        document.body.removeChild(temp);
      }

      const text = Array.isArray(children)
        ? children.join("")
        : String(children ?? "");

      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.font = fontString;
      offCtx.textBaseline = "alphabetic";

      const metrics = offCtx.measureText(text);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);
      if (textBoundingWidth <= 0 || tightHeight <= 0) return;

      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;
      const xOffset = extraWidthBuffer / 2;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      offCtx.font = fontString;
      offCtx.textBaseline = "alphabetic";
      offCtx.fillStyle = resolvedColor;
      offCtx.fillText(text, xOffset - actualLeft, actualAscent);

      const horizontalMargin = fuzzRange + 20;
      const verticalMargin = fuzzRange + 10;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight + verticalMargin * 2;
      ctx.translate(horizontalMargin, verticalMargin);

      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveTop = verticalMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;

      const clearAll = () =>
        ctx.clearRect(
          -fuzzRange - 20,
          -fuzzRange - 10,
          offscreenWidth + 2 * (fuzzRange + 20),
          tightHeight + 2 * (fuzzRange + 10),
        );

      // reduced-motion：画一帧无位移的静态字形，提供同一 canvas DOM，不进入 RAF 循环
      const drawStatic = () => {
        clearAll();
        ctx.drawImage(offscreen, 0, 0);
      };

      const run = () => {
        if (isCancelled) return;
        const intensity = isHovering ? hoverIntensity : baseIntensity;
        clearAll();

        if (direction === "vertical") {
          for (let i = 0; i < offscreenWidth; i++) {
            const dy = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, i, 0, 1, tightHeight, i, dy, 1, tightHeight);
          }
        } else if (direction === "both") {
          for (let j = 0; j < tightHeight; j++) {
            const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
          }
          for (let i = 0; i < offscreenWidth; i++) {
            const dy = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange * 0.5);
            ctx.drawImage(offscreen, i, 0, 1, tightHeight, i, dy, 1, tightHeight);
          }
        } else {
          // horizontal（默认）：逐行左右错位
          for (let j = 0; j < tightHeight; j++) {
            const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
            ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
          }
        }
        animationFrameId = window.requestAnimationFrame(run);
      };

      if (reduce) {
        drawStatic();
      } else {
        animationFrameId = window.requestAnimationFrame(run);
      }

      const isInsideTextArea = (x: number, y: number) =>
        x >= interactiveLeft &&
        x <= interactiveRight &&
        y >= interactiveTop &&
        y <= interactiveBottom;

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        isHovering = isInsideTextArea(e.clientX - rect.left, e.clientY - rect.top);
      };
      const handleMouseLeave = () => {
        isHovering = false;
      };

      if (enableHover && !reduce) {
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);
      }

      detachListeners = () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    void init();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      detachListeners?.();
      detachListeners = null;
    };
  }, [
    children,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    enableHover,
    baseIntensity,
    hoverIntensity,
    fuzzRange,
    direction,
    reduce,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("max-w-full", className)}
      // color prop 落到元素 CSS color，供 effect 内 getComputedStyle 解析
      // var()/currentColor 为真颜色值；用户 style.color 优先级更高可覆盖。
      style={{ color, ...style }}
      {...props}
    />
  );
}
