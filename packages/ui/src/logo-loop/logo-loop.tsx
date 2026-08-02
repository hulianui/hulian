"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useComponentLocale, zhCN } from "../config/locale";
import { cn } from "../lib/cn";
import type { LogoItem, LogoLoopProps } from "./logo-loop.types";

// 吸取自 React Bits LogoLoop：序列复制 + requestAnimationFrame 无缝无限滚动跑马灯，
// 速度走一阶低通（指数缓动 SMOOTH_TAU）平滑趋近目标，悬停可变速/暂停、可放大单项，支持横纵四向。
// 瑚琏化：纯 RAF 自绘（零运行时依赖，去掉原 CSS 文件）；渐隐遮罩吃 bg-surface token（自动明暗，
// 替原 #fff/#0b0b0b 双写）；focus/link/scale 全走瑚琏 token；reduced-motion → useReducedMotion()
// 钉死目标速度为 0（DOM 两态一致，静止陈列）；ResizeObserver + 图片 load 重测、SSR 安全守卫。

const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;

function toCssLength(value: number | string | undefined): string | undefined {
  return typeof value === "number" ? `${value}px` : value ?? undefined;
}

export function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  pauseOnHover,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel,
  className,
  style,
}: LogoLoopProps) {
  const locale = useComponentLocale().logoLoop ?? zhCN.components!.logoLoop!;
  const resolvedAriaLabel = ariaLabel === undefined ? locale.label : ariaLabel;
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const reduce = useReducedMotion();

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === "up" || direction === "down";

  // 悬停目标速度：hoverSpeed 优先；否则 pauseOnHover===false 不变速，其余情况停为 0。
  const effectiveHoverSpeed = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed;
    if (pauseOnHover === false) return undefined;
    return 0;
  }, [hoverSpeed, pauseOnHover]);

  // 目标速度（带符号），方向 × 速度符号决定正负。reduced-motion 钉死为 0。
  const targetVelocity = useMemo(() => {
    if (reduce) return 0;
    const magnitude = Math.abs(speed);
    const directionMultiplier = isVertical
      ? direction === "up"
        ? 1
        : -1
      : direction === "left"
      ? 1
      : -1;
    const speedMultiplier = speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [speed, direction, isVertical, reduce]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const sequenceRect = seqRef.current?.getBoundingClientRect?.();
    const sequenceWidth = sequenceRect?.width ?? 0;
    const sequenceHeight = sequenceRect?.height ?? 0;
    if (isVertical) {
      const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && parentHeight > 0) {
        const targetHeight = Math.ceil(parentHeight);
        if (containerRef.current.style.height !== `${targetHeight}px`)
          containerRef.current.style.height = `${targetHeight}px`;
      }
      if (sequenceHeight > 0) {
        setSeqHeight(Math.ceil(sequenceHeight));
        const viewport = containerRef.current?.clientHeight || parentHeight || sequenceHeight;
        const copiesNeeded = Math.ceil(viewport / sequenceHeight) + COPY_HEADROOM;
        setCopyCount(Math.max(MIN_COPIES, copiesNeeded));
      }
    } else if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + COPY_HEADROOM;
      setCopyCount(Math.max(MIN_COPIES, copiesNeeded));
    }
  }, [isVertical]);

  // 容器 / 序列尺寸变化时重测（无 ResizeObserver 退化到 window resize）。
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.ResizeObserver) {
      const handle = () => updateDimensions();
      window.addEventListener("resize", handle);
      updateDimensions();
      return () => window.removeEventListener("resize", handle);
    }
    const refs = [containerRef.current, seqRef.current];
    const observers = refs.map((el) => {
      if (!el) return null;
      const observer = new ResizeObserver(updateDimensions);
      observer.observe(el);
      return observer;
    });
    updateDimensions();
    return () => observers.forEach((o) => o?.disconnect());
  }, [updateDimensions, logos, gap, logoHeight, isVertical]);

  // 图片全部加载完后重测（图片撑开尺寸异步到位）。
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll("img") ?? [];
    if (images.length === 0) {
      updateDimensions();
      return;
    }
    let remaining = images.length;
    const onOne = () => {
      remaining -= 1;
      if (remaining === 0) updateDimensions();
    };
    images.forEach((img) => {
      if (img.complete) onOne();
      else {
        img.addEventListener("load", onOne, { once: true });
        img.addEventListener("error", onOne, { once: true });
      }
    });
    return () => {
      images.forEach((img) => {
        img.removeEventListener("load", onOne);
        img.removeEventListener("error", onOne);
      });
    };
  }, [updateDimensions, logos, gap, logoHeight, isVertical]);

  // RAF 动画循环：速度一阶低通趋近目标，按帧累加位移并取模做无缝回卷。
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const seqSize = isVertical ? seqHeight : seqWidth;

    let rafId: number | null = null;
    let lastTimestamp: number | null = null;
    let offset = 0;
    let velocity = 0;

    const applyTransform = () => {
      if (seqSize <= 0) return;
      offset = ((offset % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offset}px, 0)`
        : `translate3d(${-offset}px, 0, 0)`;
    };
    applyTransform();

    const animate = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const deltaTime = Math.max(0, timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const target =
        isHovered && effectiveHoverSpeed !== undefined ? effectiveHoverSpeed : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / SMOOTH_TAU);
      velocity += (target - velocity) * easingFactor;

      if (seqSize > 0) {
        offset += velocity * deltaTime;
        applyTransform();
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical]);

  const handleMouseEnter = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(true);
  }, [effectiveHoverSpeed]);
  const handleMouseLeave = useCallback(() => {
    if (effectiveHoverSpeed !== undefined) setIsHovered(false);
  }, [effectiveHoverSpeed]);

  const renderLogoItem = useCallback(
    (item: LogoItem, key: string, index: number) => {
      if (renderItem) {
        return (
          <li
            className="flex-[0_0_auto] leading-none [&:not(:last-child)]:me-[var(--hl-loop-gap)] data-[vertical=true]:me-0 data-[vertical=true]:mb-[var(--hl-loop-gap)]"
            data-vertical={isVertical}
            key={key}
            role="listitem"
          >
            {renderItem(item, index)}
          </li>
        );
      }
      const isNodeItem = "node" in item && item.node != null;
      const content =
        isNodeItem && "node" in item ? (
          <span
            className={cn(
              "inline-flex items-center text-foreground",
              scaleOnHover &&
                "transition-transform duration-300 ease-out group-hover/item:scale-120",
            )}
            aria-hidden={!!item.href && !item.ariaLabel}
          >
            {item.node}
          </span>
        ) : "src" in item ? (
          <img
            src={item.src}
            srcSet={item.srcSet}
            sizes={item.sizes}
            width={item.width}
            height={item.height}
            alt={item.alt ?? ""}
            title={item.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "block w-auto select-none object-contain [pointer-events:none]",
              "h-[var(--hl-loop-logo-h)]",
              scaleOnHover &&
                "transition-transform duration-300 ease-out group-hover/item:scale-120",
            )}
          />
        ) : null;
      const itemAriaLabel = "node" in item ? item.ariaLabel ?? item.title : item.alt ?? item.title;
      const inner = item.href ? (
        <a
          className="inline-flex items-center rounded-sm no-underline opacity-100 outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          href={item.href}
          aria-label={itemAriaLabel || locale.link}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );
      return (
        <li
          className={cn(
            "group/item flex-[0_0_auto] items-center leading-none",
            "[&:not(:last-child)]:me-[var(--hl-loop-gap)]",
            isVertical && "me-0 mb-[var(--hl-loop-gap)] [&:not(:last-child)]:me-0",
            scaleOnHover && "overflow-visible",
          )}
          key={key}
          role="listitem"
        >
          {inner}
        </li>
      );
    },
    [renderItem, isVertical, scaleOnHover],
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className={cn("flex items-center", isVertical && "flex-col")}
          key={`copy-${copyIndex}`}
          role="list"
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIndex) =>
            renderLogoItem(item, `${copyIndex}-${itemIndex}`, itemIndex),
          )}
        </ul>
      )),
    [copyCount, logos, renderLogoItem, isVertical],
  );

  const containerStyle = useMemo(
    () =>
      ({
        width: isVertical
          ? toCssLength(width) === "100%"
            ? undefined
            : toCssLength(width)
          : toCssLength(width) ?? "100%",
        "--hl-loop-gap": `${gap}px`,
        "--hl-loop-logo-h": `${logoHeight}px`,
        "--hl-loop-fade": fadeOutColor ?? "var(--color-surface)",
        ...style,
      } as CSSProperties),
    [width, gap, logoHeight, fadeOutColor, style, isVertical],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        isVertical && "inline-block h-full",
        scaleOnHover && "py-[calc(var(--hl-loop-logo-h)*0.1)]",
        // 渐隐遮罩：吃 --hl-loop-fade（默认 surface token，明暗自适配）
        fadeOut && [
          "before:pointer-events-none before:absolute before:z-10 before:content-['']",
          "after:pointer-events-none after:absolute after:z-10 after:content-['']",
          isVertical
            ? [
                "before:inset-x-0 before:top-0 before:h-[clamp(24px,8%,120px)]",
                "before:bg-[linear-gradient(to_bottom,var(--hl-loop-fade)_0%,transparent_100%)]",
                "after:inset-x-0 after:bottom-0 after:h-[clamp(24px,8%,120px)]",
                "after:bg-[linear-gradient(to_top,var(--hl-loop-fade)_0%,transparent_100%)]",
              ]
            : [
                "before:inset-y-0 before:left-0 before:w-[clamp(24px,8%,120px)]",
                "before:bg-[linear-gradient(to_right,var(--hl-loop-fade)_0%,transparent_100%)]",
                "after:inset-y-0 after:right-0 after:w-[clamp(24px,8%,120px)]",
                "after:bg-[linear-gradient(to_left,var(--hl-loop-fade)_0%,transparent_100%)]",
              ],
        ],
        className,
      )}
      style={containerStyle}
      role="region"
      aria-label={resolvedAriaLabel}
    >
      <div
        ref={trackRef}
        className={cn(
          "relative z-0 flex w-max select-none will-change-transform",
          isVertical && "h-max w-full flex-col",
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {logoLists}
      </div>
    </div>
  );
}
