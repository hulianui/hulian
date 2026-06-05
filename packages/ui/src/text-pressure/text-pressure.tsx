"use client";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { TextPressureProps } from "./text-pressure.types";

// 吸取自 React Bits TextPressure（源自 CodePen JuanFuentes）：标题逐字符跟随鼠标，按
// 与光标的距离实时插值可变字体的 wght/wdth/ital 轴 + opacity，离得越近"压力"越大、
// 字越宽越重越斜，营造"被光标压扁/撑开"的弹性排版效果。
// 瑚琏化：
// 1. 去远程依赖——原始硬编码 Cloudinary 的 Compressa VF woff2（违反"禁远程资源"门禁）。
//    默认改用系统无衬线栈，且额外用 transform:scaleX + fontWeight + opacity 模拟压感，
//    任意字体开箱即用；仍向真正的可变字体喂 font-variation-settings（双轨，可变字体更细腻）。
// 2. 颜色吃 token——文字 var(--color-foreground)、描边 var(--color-primary)，替原始 #FFF/#FF0000，明暗自适配。
// 3. 去 gsap/无第三方——纯 requestAnimationFrame 逐帧缓动 + 距离插值（与原始一致的算法）。
// 4. RSC 安全边界——逐字符 DOM 形变需 ref/effect/RAF，故 "use client"。
// 5. reduced-motion——useReducedMotion() 命中时不挂 RAF、不监听指针，字形保持静止中性态，
//    但 DOM（每个 span）两态一致，避免 reveal 后内容不可见的坑。

const dist = (ax: number, ay: number, bx: number, by: number) => {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.sqrt(dx * dx + dy * dy);
};

// 距离 → 轴值：越近（distance 越小）值越接近 maxVal，越远越接近 minVal。
const getAttr = (
  distance: number,
  maxDist: number,
  minVal: number,
  maxVal: number,
) => {
  const val = maxVal - Math.abs((maxVal * distance) / (maxDist || 1));
  return Math.max(minVal, val + minVal);
};

export function TextPressure({
  text = "Compressa",
  fontFamily = "ui-sans-serif, system-ui, sans-serif",
  fontUrl,
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "var(--color-foreground)",
  strokeColor = "var(--color-primary)",
  minFontSize = 24,
  className,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<Array<HTMLSpanElement | null>>([]);

  // 缓动后的"虚拟光标"位置 vs 真实指针位置。
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const reduce = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);

  // 仅当显式传入本地字体地址时注入 @font-face（默认不注入远程资源）。
  const fontFaceCss =
    fontUrl != null && fontUrl !== ""
      ? `@font-face{font-family:'${fontFamily}';src:url('${fontUrl}');font-style:normal;}`
      : null;

  // 字号 / 纵向拉伸测量（与 reduced-motion 无关，需先就位）。
  useEffect(() => {
    const setSize = () => {
      const container = containerRef.current;
      const title = titleRef.current;
      if (!container || !title) return;
      const { width: cw, height: ch } = container.getBoundingClientRect();
      if (cw === 0) return;
      let next = cw / Math.max(chars.length / 2, 1);
      next = Math.max(next, minFontSize);
      setFontSize(next);
      setScaleY(1);
      setLineHeight(1);
      requestAnimationFrame(() => {
        const t = titleRef.current;
        if (!t) return;
        const rect = t.getBoundingClientRect();
        if (scale && rect.height > 0) {
          const yRatio = ch / rect.height;
          setScaleY(yRatio);
          setLineHeight(yRatio);
        }
      });
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(setSize, 100);
    };
    debounced();
    window.addEventListener("resize", debounced);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", debounced);
    };
  }, [chars.length, minFontSize, scale]);

  // 指针监听 + 逐帧形变。reduced-motion 命中则整体跳过（字形停在中性态）。
  useEffect(() => {
    if (reduce) return;

    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    // 初始把虚拟光标钉在容器中心，避免首帧整排字突然被"吸"向左上角。
    const container = containerRef.current;
    if (container) {
      const { left, top, width: w, height: h } = container.getBoundingClientRect();
      mouseRef.current.x = left + w / 2;
      mouseRef.current.y = top + h / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    let rafId = 0;
    const animate = () => {
      // 一阶缓动：虚拟光标每帧追真实指针 1/15，制造柔和滞后。
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      const title = titleRef.current;
      if (title) {
        const titleRect = title.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;
          const rect = span.getBoundingClientRect();
          const cx = rect.x + rect.width / 2;
          const cy = rect.y + rect.height / 2;
          const d = dist(mouseRef.current.x, mouseRef.current.y, cx, cy);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const ital = italic ? getAttr(d, maxDist, 0, 1) : 0;
          const alphaVal = alpha ? getAttr(d, maxDist, 0, 1) : 1;

          // 真正的可变字体：直接驱动三轴。
          const fvs = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital.toFixed(2)}`;
          if (span.style.fontVariationSettings !== fvs) {
            span.style.fontVariationSettings = fvs;
          }

          // 兜底：非可变字体也能"压感"——fontWeight + scaleX(wdth/100) + skewX(ital)。
          // 字体本就支持 wdth 时，scaleX≈1 不会二次形变；不支持时 scaleX 接管横向挤压。
          const sx = width ? wdth / 100 : 1;
          const skew = italic ? ital * 8 : 0;
          span.style.fontWeight = weight ? String(wght) : "";
          span.style.transform = `scaleX(${sx.toFixed(3)}) skewX(${skew.toFixed(1)}deg)`;

          if (alpha) {
            const next = alphaVal.toFixed(2);
            if (span.style.opacity !== next) span.style.opacity = next;
          }
        });
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [reduce, width, weight, italic, alpha]);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      {fontFaceCss != null && (
        <style
          // 仅在显式传入本地字体时注入；默认走系统字体栈，无远程请求。
          dangerouslySetInnerHTML={{ __html: fontFaceCss }}
        />
      )}
      <h1
        ref={titleRef}
        className={cn(
          "m-0 w-full select-none text-center uppercase [white-space:nowrap]",
          flex && "flex justify-between",
          // 描边：字心透明 + ::after 复制字符做轮廓（颜色走 token）。
          stroke &&
            "[&_span]:relative [&_span::after]:absolute [&_span::after]:left-0 [&_span::after]:top-0 [&_span::after]:-z-10 [&_span::after]:[content:attr(data-char)] [&_span::after]:text-transparent [&_span::after]:[-webkit-text-stroke-width:3px]",
        )}
        style={
          {
            fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight,
            transform: `scale(1, ${scaleY})`,
            transformOrigin: "center top",
            fontWeight: 100,
            color: textColor,
            // 描边色透传给每个 span 的 ::after（webkit-text-stroke 不吃 currentColor，用变量桥接）。
            "--hulian-text-pressure-stroke": strokeColor,
          } as CSSProperties
        }
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            className="inline-block will-change-transform [&::after]:[-webkit-text-stroke-color:var(--hulian-text-pressure-stroke)]"
            style={{ color: stroke ? undefined : textColor }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </h1>
    </div>
  );
}
