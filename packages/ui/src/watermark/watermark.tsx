"use client";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import type { WatermarkProps } from "./watermark.types";

const FALLBACK_COLOR = "rgba(128,128,128,1)";

/**
 * Watermark 水印（零依赖自研）——企业防截图泄密标配。
 *
 * 离屏 canvas 绘制单个水印单元 → toDataURL → 作为 repeating background 平铺，
 * 覆盖整个内容区（pointer-events:none 不挡交互）。MutationObserver 双观察：
 * ① 防 DOM 篡改/删除水印层（删了/改样式即自动还原）；
 * ② 主题切换时按 token 重绘（color 未显式指定时）。
 * devicePixelRatio 高清绘制，retina 不糊。
 */
export function Watermark({
  content,
  image,
  width = 120,
  height,
  rotate = -22,
  gap = 100,
  fontSize = 16,
  fontFamily = "sans-serif",
  fontWeight = "normal",
  color,
  opacity = 0.15,
  zIndex = 9,
  className,
  style,
  children,
  ...props
}: WatermarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement | null>(null);

  const [gapX, gapY] = Array.isArray(gap) ? gap : [gap, gap];
  // 数组 content 每次渲染都是新引用，序列化为字符串作为 effect 依赖，避免无谓重绘。
  const contentKey = Array.isArray(content) ? content.join("\u0001") : content;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;
    let cancelled = false;

    const observer = new MutationObserver((mutations) => {
      if (cancelled) return;
      const mark = markRef.current;
      // 我方水印层被删除、或其属性/样式被改 → 视为篡改，还原。
      const tampered = mutations.some(
        (m) => m.target === mark || Array.from(m.removedNodes).includes(mark as Node),
      );
      if (tampered) render();
    });
    const stopObserve = () => observer.disconnect();
    const startObserve = () =>
      observer.observe(container, { attributes: true, childList: true, subtree: true });

    // 颜色随主题变化时（未指定 color，或 color 是 var()/token 引用）→ 主题切换需重绘。
    // 仅当 color 是写死的具体色（如 #f00 / rgb(...)）才无需随主题重绘。
    const colorIsThemed = !color || color.includes("var(");
    const themeObserver = colorIsThemed
      ? new MutationObserver(() => {
          if (!cancelled) render();
        })
      : null;
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    const apply = (dataURL: string, tileW: number, tileH: number) => {
      if (cancelled || !containerRef.current) return;
      let mark = markRef.current;
      if (!mark) {
        mark = document.createElement("div");
        markRef.current = mark;
      }
      const styleText = [
        "position:absolute",
        "inset:0",
        "pointer-events:none",
        "background-repeat:repeat",
        `z-index:${zIndex}`,
        `opacity:${opacity}`,
        `background-size:${tileW}px ${tileH}px`,
        `background-image:url("${dataURL}")`,
      ].join(";");
      // 自身写 DOM 前先停观察，避免触发自己 → 还原后再续观察
      stopObserve();
      mark.setAttribute("style", styleText);
      if (mark.parentElement !== containerRef.current) {
        containerRef.current.appendChild(mark);
      }
      startObserve();
    };

    const paintTile = (
      cw: number,
      ch: number,
      draw: (ctx: CanvasRenderingContext2D) => void,
    ) => {
      const ratio = window.devicePixelRatio || 1;
      const rad = (rotate * Math.PI) / 180;
      // 旋转后的包围盒尺寸 → tile 容得下旋转内容，平铺不裁切
      const rw = Math.abs(cw * Math.cos(rad)) + Math.abs(ch * Math.sin(rad));
      const rh = Math.abs(cw * Math.sin(rad)) + Math.abs(ch * Math.cos(rad));
      const tileW = Math.ceil(rw + gapX);
      const tileH = Math.ceil(rh + gapY);

      const canvas = document.createElement("canvas");
      // 设宽高会重置 context 状态，故必须先定尺寸再 scale/translate/设样式
      canvas.width = tileW * ratio;
      canvas.height = tileH * ratio;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.translate(tileW / 2, tileH / 2);
      ctx.rotate(rad);
      draw(ctx);
      apply(canvas.toDataURL(), tileW, tileH);
    };

    function render() {
      if (cancelled || !containerRef.current) return;
      // canvas 的 fillStyle 不认识 CSS var()/语义 token（赋值非法会被忽略 → 退回默认黑色）。
      // 故先用一个隐藏探针元素承载该颜色，经 getComputedStyle 解析成具体 rgb() 再喂给 canvas。
      const probe = document.createElement("span");
      probe.style.color = color || "var(--color-muted)";
      probe.style.display = "none";
      containerRef.current.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      containerRef.current.removeChild(probe);
      const fillColor = resolved || FALLBACK_COLOR;

      if (image) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.referrerPolicy = "no-referrer";
        img.onload = () => {
          if (cancelled) return;
          const iw = width;
          const ih =
            height ?? ((img.naturalHeight / img.naturalWidth) * width || width);
          paintTile(iw, ih, (ctx) => ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih));
        };
        img.src = image;
        return;
      }

      const lines = Array.isArray(content) ? content : content ? [content] : [];
      if (!lines.length) return;
      const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const lineHeight = fontSize * 1.3;
      // 先用临时 canvas 量文字宽度
      const measureCtx = document.createElement("canvas").getContext("2d");
      if (!measureCtx) return;
      measureCtx.font = font;
      let cw = 0;
      for (const line of lines) cw = Math.max(cw, measureCtx.measureText(line).width);
      const ch = lines.length * lineHeight;

      paintTile(cw, ch, (ctx) => {
        ctx.font = font;
        ctx.fillStyle = fillColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const startY = -((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, i) => ctx.fillText(line, 0, startY + i * lineHeight));
      });
    }

    render();

    return () => {
      cancelled = true;
      observer.disconnect();
      themeObserver?.disconnect();
      markRef.current?.parentElement?.removeChild(markRef.current);
      markRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey, image, width, height, rotate, gapX, gapY, fontSize, fontFamily, fontWeight, color, opacity, zIndex]);

  return (
    <div ref={containerRef} className={cn("relative", className)} style={style} {...props}>
      {children}
    </div>
  );
}
