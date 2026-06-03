"use client";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ImageProps } from "./image.types";

const radiusClass = {
  none: "rounded-none",
  sm: "rounded-[min(var(--radius),0.375rem)]",
  md: "rounded-[var(--radius)]",
  lg: "rounded-[calc(var(--radius)+0.25rem)]",
  full: "rounded-full",
} as const;

// 图片皮肤：加载完成淡入 + 失败回退/占位 + isZoomed hover 放大（含状态故 "use client"）。
export const imageVariants = cva("block size-full object-cover transition-[transform,opacity] duration-300");

export function Image({
  src,
  alt = "",
  width,
  height,
  radius = "md",
  isZoomed = false,
  fallbackSrc,
  className,
  imgClassName,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  // null = 仍用原图；string = 已切到回退图；"dead" = 无可显示图，仅留占位底。
  const [override, setOverride] = useState<string | null>(null);
  const dead = override === "dead";
  const currentSrc = override && override !== "dead" ? override : src;

  const onError = () => {
    setLoaded(false);
    // 原图失败且有回退 → 切回退；回退也失败（或无回退）→ 置占位底。
    setOverride((prev) => (prev === null && fallbackSrc ? fallbackSrc : "dead"));
  };

  return (
    <span
      className={cn(
        "group relative inline-block overflow-hidden bg-surface-hover align-middle",
        radiusClass[radius],
        className,
      )}
      style={{ width, height }}
    >
      {!dead && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={onError}
          className={cn(
            imageVariants(),
            loaded ? "opacity-100" : "opacity-0",
            isZoomed && "group-hover:scale-110",
            imgClassName,
          )}
          {...props}
        />
      )}
    </span>
  );
}
