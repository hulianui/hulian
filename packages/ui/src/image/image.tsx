"use client";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
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

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt = "",
    width,
    height,
    radius = "md",
    isZoomed = false,
    fallbackSrc,
    className,
    imgClassName,
    onLoad: userOnLoad,
    onError: userOnError,
    ...props
  },
  forwardedRef,
) {
  const [loaded, setLoaded] = useState(false);
  // null = 仍用原图；string = 已切到回退图；"dead" = 无可显示图，仅留占位底。
  const [override, setOverride] = useState<string | null>(null);
  const dead = override === "dead";
  const currentSrc = override && override !== "dead" ? override : src;
  const imgRef = useRef<HTMLImageElement | null>(null);

  // 内部 ref（补查 complete 用）与外部 ref 合流：消费方要量 naturalWidth/滚进视野都得拿到 <img>。
  const setRefs = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  // 只靠 onLoad 翻转淡入态是不够的：图片命中缓存（或 SSR 出的 HTML 在 hydration
  // 之前就解完码）时，load 事件早在 React 挂上处理器之前就烧完了，onLoad 永远不触发，
  // 图片于是永久停在 opacity-0 —— 现象是「网络面板 200、naturalWidth 正常，
  // 页面上却是一块空白」，极易被误判成图挂了。挂载后补查一次 complete。
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [currentSrc]);

  // 消费方的 onLoad/onError 与内部的**合并**，不是被展开顺序决定谁赢：
  // 早先 {...props} 展在 onLoad 之后，外部一传 onLoad 就把 setLoaded 顶掉 →
  // loaded 永远 false → 图永久 opacity-0（现象与上面注释里那个缓存坑一模一样，
  // 只是触发路径反过来）。onError 被顶掉后果更重：整个回退图逻辑失效。
  const handleLoad: NonNullable<ImageProps["onLoad"]> = (e) => {
    setLoaded(true);
    userOnLoad?.(e);
  };

  const handleError: NonNullable<ImageProps["onError"]> = (e) => {
    setLoaded(false);
    // 原图失败且有回退 → 切回退；回退也失败（或无回退）→ 置占位底。
    setOverride((prev) => (prev === null && fallbackSrc ? fallbackSrc : "dead"));
    userOnError?.(e);
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
          ref={setRefs}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
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
});
