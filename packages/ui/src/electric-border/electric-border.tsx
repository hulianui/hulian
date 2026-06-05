"use client";
import { useId } from "react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { ElectricBorderProps } from "./electric-border.types";

// 吸取自 React Bits ElectricBorder：用噪声把圆角矩形描边逐帧撕扯成抖动的"电弧"轮廓，
// 外加多层模糊光晕模拟放电辉光，让容器边框像通了电一样跳动。
//
// 瑚琏化要点：
// 1. 去 canvas2d + requestAnimationFrame + 自写八度噪声：改用纯 SVG `feTurbulence` +
//    `feDisplacementMap` 把描边位移成电弧，湍流用 SMIL `<animate>` 循环 baseFrequency，
//    零 JS 逐帧、零 rAF、零依赖。
// 2. 颜色全吃 token：默认 var(--color-primary)（自动明暗适配），替原写死的 #5227FF。
// 3. reduced-motion：`<animate>` 包在 `media="(prefers-reduced-motion: no-preference)"` 内，
//    降级后保留静态电弧轮廓与光晕（DOM 不变，仅停止抖动）。
// 4. SVG filter id 用 useId 唯一化，避免多实例 filter 互相串扰。
// 5. 仅 useId 一个 hook，无 effect/ref；本可 RSC，但 useId 需 client，故标 "use client"。

export function ElectricBorder({
  color = "var(--color-primary)",
  speed = 1,
  chaos = 1,
  thickness = 2,
  borderRadius = 16,
  className,
  children,
  style,
}: ElectricBorderProps) {
  const rawId = useId();
  // useId 产出形如 ":r0:"，含冒号不能直接做 SVG 引用，清洗成合法 id
  const filterId = `hl-eb-${rawId.replace(/:/g, "")}`;

  // speed=1 → 2s 一轮抖动；speed 越大越快（时长反比），下限 0.2s 防过快
  const dur = Math.max(0.2, 2 / Math.max(speed, 0.01));
  // chaos 映射到位移强度：基准 30，随 chaos 线性放大
  const scale = Math.max(0, 30 * chaos);

  return (
    <div
      className={cn("relative isolate", className)}
      style={{ borderRadius, ...style }}
    >
      {/* 电弧描边层：SVG 全覆盖，filter 把矩形描边位移成抖动电弧 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        style={{ borderRadius }}
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="3"
              seed="2"
              result="noise"
            >
              {/* 仅在用户允许动效时循环湍流频率，制造电流跳动；reduced-motion 下静止 */}
              <animate
                attributeName="baseFrequency"
                dur={`${dur}s`}
                values="0.02;0.06;0.02"
                repeatCount="indefinite"
                media="(prefers-reduced-motion: no-preference)"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        {/* 被 filter 撕扯的描边矩形；vector-effect 保持线宽不随缩放变形 */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* 光晕层：两层不同模糊度的描边叠加，模拟放电辉光（token 着色，纯 CSS） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={
          {
            borderRadius,
            border: `${thickness}px solid ${color}`,
            filter: "blur(1px)",
            opacity: 0.6,
          } as CSSProperties
        }
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={
          {
            borderRadius,
            border: `${thickness}px solid ${color}`,
            filter: "blur(6px)",
            opacity: 0.5,
          } as CSSProperties
        }
      />

      {/* 内容层：覆盖在电弧/光晕之上 */}
      {children != null && (
        <div className="relative z-10" style={{ borderRadius }}>
          {children}
        </div>
      )}
    </div>
  );
}
