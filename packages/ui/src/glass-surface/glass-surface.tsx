"use client";

// 吸取自 React Bits GlassSurface：用 SVG <feImage>+<feDisplacementMap> 生成一张
// 红/蓝渐变叠加的位移图，把 backdrop（背景）按通道折射、并对 R/G/B 施加不同位移量
// 制造液态玻璃的色散（chromatic aberration）边缘 —— 经 backdrop-filter:url(#filter) 落到容器。
//
// 瑚琏化要点：
//   1. 去掉 React Bits 写死的 light-dark()/rgba(31,38,135) 阴影与 #007aff 焦点环，
//      磨砂底色与发丝边/外阴影改吃瑚琏 token（bg-surface 经 --hulian-glass-frost 调透明、
//      border-border、shadow-lg、focus-visible:ring-ring），明暗自动适配。
//   2. 不支持 SVG backdrop-filter 的浏览器（Safari/Firefox）回落到纯 backdrop-blur 磨砂玻璃。
//   3. RSC 安全："use client" + 所有 DOM 测量/属性写入在 useEffect/useLayoutEffect 内。
//   4. reduced-motion：折射本身是静态滤镜（无动画），仅把容器 opacity 过渡用
//      motion-reduce:transition-none 关掉，跨两态 DOM 完全一致。
//   5. jsdom 安全：getBoundingClientRect / setAttribute 在测试环境不抛错；
//      ResizeObserver 不存在时静默跳过。

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "../lib/cn";
import type { GlassSurfaceProps } from "./glass-surface.types";

// useLayoutEffect 在 SSR 阶段会告警；同构降级为 useEffect。
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// 检测浏览器是否支持 SVG backdrop-filter（Chrome 系支持，WebKit/Firefox 不支持）。
function supportsSvgBackdropFilter(filterId: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  const isWebkit = /Safari/.test(ua) && !/Chrome/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isWebkit || isFirefox) return false;

  // CSS.supports 在 jsdom 中对 url(#…) backdrop-filter 返回 false（无真实滤镜引擎），
  // 真实 Chromium 系才返回 true —— 比直接写 style 更可靠（jsdom 的 CSS 解析器会原样存任意值）。
  if (
    typeof CSS === "undefined" ||
    typeof CSS.supports !== "function" ||
    !CSS.supports("backdrop-filter", `url(#${filterId})`)
  ) {
    return false;
  }

  const div = document.createElement("div");
  div.style.backdropFilter = `url(#${filterId})`;
  return div.style.backdropFilter !== "";
}

export function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  className,
  style,
}: GlassSurfaceProps) {
  const rawId = useId().replace(/:/g, "-");
  const filterId = `hulian-glass-filter-${rawId}`;
  const redGradId = `hulian-glass-red-${rawId}`;
  const blueGradId = `hulian-glass-blue-${rawId}`;

  const [svgSupported, setSvgSupported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  // 生成位移图：黑底 + 红横向渐变 + 蓝纵向渐变(混合) + 中央亮矩形(模糊)，data: URI。
  const buildDisplacementMap = (): string => {
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect?.width || 400;
    const h = rect?.height || 200;
    const edge = Math.min(w, h) * (borderWidth * 0.5);

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w}" height="${h}" fill="black"></rect>
        <rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const syncFilter = () => {
    feImageRef.current?.setAttribute("href", buildDisplacementMap());
    (
      [
        [redChannelRef, redOffset],
        [greenChannelRef, greenOffset],
        [blueChannelRef, blueOffset],
      ] as const
    ).forEach(([ref, offset]) => {
      const node = ref.current;
      if (!node) return;
      node.setAttribute("scale", String(distortionScale + offset));
      node.setAttribute("xChannelSelector", xChannel);
      node.setAttribute("yChannelSelector", yChannel);
    });
    gaussianBlurRef.current?.setAttribute("stdDeviation", String(displace));
  };

  // 参数或尺寸变化时重建位移图 + 同步 displacement 属性。
  useIsoLayoutEffect(() => {
    syncFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  ]);

  // 容器尺寸变化（百分比宽高 / 响应式）时重建位移图。
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      // 下一帧再读尺寸，避免观察回调内同步重排告警。
      setTimeout(syncFilter, 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 一次性能力探测。
  useEffect(() => {
    setSvgSupported(supportsSvgBackdropFilter(filterId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle: CSSProperties = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    // 磨砂底色透明度（驱动 bg-surface 的 alpha）+ 饱和度 + 滤镜引用。
    ["--hulian-glass-frost" as string]: String(backgroundOpacity),
    ["--hulian-glass-saturation" as string]: String(saturation),
    ["--hulian-glass-filter" as string]: `url(#${filterId})`,
  };

  return (
    <div
      ref={containerRef}
      data-glass-mode={svgSupported ? "svg" : "fallback"}
      className={cn(
        // 公共骨架
        "relative flex items-center justify-center overflow-hidden",
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        "border border-border shadow-lg",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // SVG 折射模式：磨砂底吃 bg-surface（经 --hulian-glass-frost 调 alpha），
        // backdrop-filter 引用 SVG 滤镜 + saturate。
        svgSupported
          ? [
              "[background:color-mix(in_oklch,var(--color-surface),transparent_calc((1-var(--hulian-glass-frost,0))*100%))]",
              "[backdrop-filter:var(--hulian-glass-filter,url(#glass))_saturate(var(--hulian-glass-saturation,1))]",
            ]
          : // 回落：纯 backdrop-blur 磨砂玻璃（不依赖 SVG 滤镜）。
            [
              "bg-surface/25",
              "[backdrop-filter:blur(12px)_saturate(1.8)_brightness(1.05)]",
            ],
        className,
      )}
      style={containerStyle}
    >
      {/* SVG 滤镜定义层：不可见、不拦截指针、置于内容下方。 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      {/* 内容层：覆于折射层之上。 */}
      <div className="relative z-[1] flex h-full w-full items-center justify-center rounded-[inherit] p-2">
        {children}
      </div>
    </div>
  );
}
