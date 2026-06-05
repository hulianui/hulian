"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { BounceCardsProps } from "./bounce-cards.types";

// 吸取自 React Bits BounceCards：一叠卡片扇形铺开，入场逐张从 scale 0 弹性弹入；
// hover 某张时它回正放大、两侧卡片向外让位推挤。
// 瑚琏化：用 motion（m + LazyMotionProvider，减包）取代 gsap 时间线/elastic 缓动；
// 边框/阴影走 token（border-border / bg-surface / shadow-lg），去掉硬编码白边黑影；
// reduced-motion → 直接落位扇形态、停 hover 动画（DOM 两态一致，避 reveal 不可见坑）；必 "use client"。

const DEFAULT_TRANSFORMS = [
  "rotate(10deg) translate(-170px)",
  "rotate(5deg) translate(-85px)",
  "rotate(-3deg)",
  "rotate(-10deg) translate(85px)",
  "rotate(2deg) translate(170px)",
];

/** 把 transform 里的 rotate(...) 归零（hover 命中时回正） */
function getNoRotationTransform(transformStr: string): string {
  if (/rotate\([\s\S]*?\)/.test(transformStr)) {
    return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
  }
  if (transformStr === "none") return "rotate(0deg)";
  return `${transformStr} rotate(0deg)`;
}

/** 给基础 transform 叠加横向推挤位移（两侧卡片让位） */
function getPushedTransform(baseTransform: string, offsetX: number): string {
  const translateRegex = /translate\(([-0-9.]+)px\)/;
  const match = baseTransform.match(translateRegex);
  if (match) {
    const newX = Number.parseFloat(match[1]) + offsetX;
    return baseTransform.replace(translateRegex, `translate(${newX}px)`);
  }
  return baseTransform === "none"
    ? `translate(${offsetX}px)`
    : `${baseTransform} translate(${offsetX}px)`;
}

export function BounceCards({
  images = [],
  children,
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  transformStyles = DEFAULT_TRANSFORMS,
  enableHover = true,
  pushDistance = 160,
  className,
  style,
}: BounceCardsProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const items: ReadonlyArray<unknown> = children ?? images;

  /** 计算每张卡片当前应处的 transform（含 hover 推挤） */
  const transformFor = (i: number): string => {
    const base = transformStyles[i] ?? "none";
    if (!enableHover || reduce || hovered === null) return base;
    if (i === hovered) return getNoRotationTransform(base);
    const offsetX = i < hovered ? -pushDistance : pushDistance;
    return getPushedTransform(base, offsetX);
  };

  return (
    <LazyMotionProvider>
      <div
        className={cn(
          "relative flex items-center justify-center",
          className,
        )}
        style={{ width: containerWidth, height: containerHeight, ...style }}
      >
        {items.map((item, idx) => (
          // 外层：扇形铺开 + hover 推挤的 transform 字符串（rotate/translate）。
          // 内层：入场 scale 0→1 弹入。两层拆开避免 motion 中 `scale` 与 `transform` 字符串互相覆盖。
          <m.div
            key={idx}
            data-bounce-card={idx}
            className="absolute aspect-square w-1/2"
            style={{ willChange: "transform" }}
            initial={reduce ? false : { transform: transformStyles[idx] ?? "none" }}
            animate={{ transform: transformFor(idx) }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 18 }
            }
            onMouseEnter={enableHover ? () => setHovered(idx) : undefined}
            onMouseLeave={enableHover ? () => setHovered(null) : undefined}
          >
            <m.div
              className={cn(
                "h-full w-full overflow-hidden",
                "rounded-3xl border-4 border-surface bg-surface shadow-lg",
                enableHover && "cursor-pointer",
              )}
              style={{ willChange: "transform" }}
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 260,
                      damping: 12,
                      delay: animationDelay + idx * animationStagger,
                    }
              }
            >
              {children ? (
                (item as ReactNode)
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="h-full w-full object-cover"
                  src={item as string}
                  alt={`bounce-card-${idx}`}
                />
              )}
            </m.div>
          </m.div>
        ))}
      </div>
    </LazyMotionProvider>
  );
}
