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
//    默认改用系统无衬线栈。原版靠可变字体 wdth 轴改变字符**布局宽度**（回流），flex
//    justify-between 自然均布；系统字体没有 wdth 轴，必须模拟——但 transform:scaleX
//    不参与布局，盒宽不动只放大画面会叠字。因此模拟路径采用"盒宽跟随"方案：
//    a. 挂载时探测字体是否真支持 wdth 轴（量 wdth 100 vs 200 的布局宽差）。支持 →
//       走原版纯 font-variation-settings 自然回流，不加 transform。
//    b. 不支持 → 一次性量出每字符在 wght 100/900 下的自然宽度，逐帧把
//       span.style.width 设为 自然宽(随字重插值) × scaleX，transform-origin 钉左侧，
//       让"画出来的字形"恰好填满自己的布局盒——盒子不重叠，字形就不重叠。
//    c. 逐帧归一化：整行目标总宽超容器时全行等比回缩，保证任何鼠标位置下整行不超容器。
//    d. 量完中性宽度后若静止态整行超宽，按比例压低字号（reduced-motion 静止态也不超行）。
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

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

// 模拟压感（非可变字体）时 scaleX 的安全区间：原始 wdth 5–205 直接 /100 会把远处字符
// 压成 0.05 的细丝（不可读），近处 2.05 又极易撑爆整行；收敛到可读且有张力的范围。
const SX_MIN = 0.5;
const SX_MAX = 1.85;
const NEUTRAL_FVS = "'wght' 100, 'wdth' 100, 'ital' 0";

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

  // 模拟路径的测量缓存：每字符在 wght 100 / 900 下的自然布局宽（px）。
  const natural100Ref = useRef<number[]>([]);
  const natural900Ref = useRef<number[]>([]);
  // 字体是否真支持 wdth 轴（支持 → 纯 fvs 自然回流；不支持 → 盒宽跟随模拟）。
  const supportsWdthRef = useRef(false);
  // 测量未就绪前动画帧不施加形变（避免用空数据把字叠在一起）。
  const measuredRef = useRef(false);

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

  // 字号 / 自然宽度 / wdth 轴支持度测量（与 reduced-motion 无关，需先就位）。
  useEffect(() => {
    measuredRef.current = false;

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
        const c = containerRef.current;
        if (!t || !c) return;
        const spans = spansRef.current.slice(0, chars.length);

        // ① 探测字体是否真支持 wdth 轴：量同一字符 wdth 100 vs 200 的布局宽差。
        const probe = spans.find(
          (s) => s != null && (s.textContent ?? "").trim() !== "",
        );
        let supportsWdth = false;
        if (probe) {
          probe.style.width = "";
          probe.style.transform = "";
          probe.style.fontVariationSettings = "'wdth' 100";
          const at100 = probe.getBoundingClientRect().width;
          probe.style.fontVariationSettings = "'wdth' 200";
          const at200 = probe.getBoundingClientRect().width;
          probe.style.fontVariationSettings = "";
          supportsWdth = Math.abs(at200 - at100) > 0.5;
        }
        supportsWdthRef.current = supportsWdth;

        // ② 清掉行内形变后，量每字符在 wght 100 / 900 下的自然布局宽。
        for (const span of spans) {
          if (!span) continue;
          span.style.width = "";
          span.style.transform = "";
          span.style.fontWeight = "100";
          span.style.fontVariationSettings = NEUTRAL_FVS;
        }
        const w100 = spans.map((s) =>
          s ? s.getBoundingClientRect().width : 0,
        );
        for (const span of spans) {
          if (!span) continue;
          span.style.fontWeight = "900";
          span.style.fontVariationSettings = "'wght' 900, 'wdth' 100, 'ital' 0";
        }
        const w900 = spans.map((s) =>
          s ? s.getBoundingClientRect().width : 0,
        );
        for (const span of spans) {
          if (!span) continue;
          span.style.fontWeight = "";
          span.style.fontVariationSettings = "";
        }

        // ③ 静止态（wght 100）整行超容器 → 等比压低字号，保证 reduced-motion /
        //    动画未就绪时整行也不超行（minFontSize 仍是下限）。
        const total100 = w100.reduce((a, b) => a + b, 0);
        const cwNow = c.getBoundingClientRect().width;
        let ratio = 1;
        if (total100 > 0 && total100 > cwNow) {
          const fitted = Math.max(minFontSize, (next * cwNow) / total100);
          ratio = fitted / next;
          if (fitted !== next) setFontSize(fitted);
        }
        natural100Ref.current = w100.map((v) => v * ratio);
        natural900Ref.current = w900.map((v) => v * ratio);
        measuredRef.current = true;

        const rect = t.getBoundingClientRect();
        if (scale && rect.height > 0) {
          const yRatio = ch / (rect.height * ratio);
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
  }, [text, chars.length, minFontSize, scale, fontFamily, fontUrl]);

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
      // 自然宽度测量就绪前不施加形变（中性态本身不重叠）。
      if (title && measuredRef.current) {
        const titleRect = title.getBoundingClientRect();
        const maxDist = titleRect.width / 2;
        const avail = titleRect.width;
        const count = chars.length;
        const simulate = !supportsWdthRef.current;

        // 第一遍：按距离算各字符的轴目标值；模拟路径同时算目标盒宽（自然宽随字重
        // 在 100/900 两次实测间线性插值 × scaleX）。
        const wdths = new Array<number>(count).fill(100);
        const wghts = new Array<number>(count).fill(400);
        const itals = new Array<number>(count).fill(0);
        const alphas = new Array<number>(count).fill(1);
        const naturalWs = new Array<number>(count).fill(0);
        const desired = new Array<number>(count).fill(0);
        let total = 0;

        for (let i = 0; i < count; i++) {
          const span = spansRef.current[i];
          if (!span) continue;
          const rect = span.getBoundingClientRect();
          // transform 不挪布局盒左缘（origin 钉左），布局宽即画出来的字形宽。
          const cx = rect.x + span.offsetWidth / 2;
          const cy = rect.y + rect.height / 2;
          const d = dist(mouseRef.current.x, mouseRef.current.y, cx, cy);

          wdths[i] = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          wghts[i] = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          itals[i] = italic ? getAttr(d, maxDist, 0, 1) : 0;
          alphas[i] = alpha ? getAttr(d, maxDist, 0, 1) : 1;

          if (simulate) {
            // 实际渲染字重：weight 关时不写 font-weight（继承 h1 的 100）。
            const renderWght = weight ? wghts[i]! : 100;
            const n100 = natural100Ref.current[i] ?? 0;
            const n900 = natural900Ref.current[i] ?? n100;
            const naturalW = n100 + ((n900 - n100) * (renderWght - 100)) / 800;
            const sx = width ? clamp(wdths[i]! / 100, SX_MIN, SX_MAX) : 1;
            naturalWs[i] = naturalW;
            desired[i] = naturalW * sx;
            total += desired[i]!;
          }
        }

        // 第二遍：整行目标总宽超容器 → 全行等比回缩，保证任何鼠标位置都不超行；
        // 盒宽 = 画出来的字形宽（origin 左 + width 跟随），相邻字符天然不重叠。
        const fit = simulate && total > avail && total > 0 ? avail / total : 1;

        for (let i = 0; i < count; i++) {
          const span = spansRef.current[i];
          if (!span) continue;

          // 真正的可变字体：直接驱动三轴（模拟路径下对系统字体是无害 no-op）。
          const fvs = `'wght' ${wghts[i]}, 'wdth' ${wdths[i]}, 'ital' ${itals[i]!.toFixed(2)}`;
          if (span.style.fontVariationSettings !== fvs) {
            span.style.fontVariationSettings = fvs;
          }

          if (simulate) {
            const w = desired[i]! * fit;
            const naturalW = naturalWs[i]!;
            const sxEff = naturalW > 0 ? w / naturalW : 1;
            const skew = italic ? itals[i]! * 8 : 0;
            span.style.fontWeight = weight ? String(wghts[i]) : "";
            // 盒宽与缩放后的字形宽一致——transform 不参与布局，必须手动喂回去。
            span.style.width = `${w.toFixed(2)}px`;
            span.style.transform = `scaleX(${sxEff.toFixed(3)}) skewX(${skew.toFixed(1)}deg)`;
          }

          if (alpha) {
            const nextA = alphas[i]!.toFixed(2);
            if (span.style.opacity !== nextA) span.style.opacity = nextA;
          }
        }
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [reduce, width, weight, italic, alpha, chars.length]);

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
            // origin-left：scaleX 后字形从盒左缘向右铺，恰好填满手动喂的盒宽；
            // flex-none：盒宽由我们逐帧管理，禁止 flex 收缩把盒子和画面再次错位。
            className="inline-block flex-none origin-left will-change-transform [&::after]:[-webkit-text-stroke-color:var(--hulian-text-pressure-stroke)]"
            style={{ color: stroke ? undefined : textColor }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </h1>
    </div>
  );
}
