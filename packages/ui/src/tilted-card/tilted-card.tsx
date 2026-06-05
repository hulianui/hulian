"use client";
import { useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, PointerEvent } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { TiltedCardProps } from "./tilted-card.types";

// 吸取自 React Bits TiltedCard：指针在卡面上移动时按偏移量做 3D 倾斜（perspective + rotateX/Y），
// 悬停放大，并有一枚跟随指针、按竖向速度甩动的浮动提示气泡。
// 瑚琏化：token 化（提示气泡 bg-surface/text-foreground/border-border 替原硬编码白底；overlay 走 token），
// 去依赖（m + LazyMotionProvider 减包，弃原全量 motion）；用 PointerEvent 取代 mouse 系列、原生支持触控；
// reduced-motion → 弹簧降为 0 阻尼瞬时跟随且禁用倾斜（DOM 两态一致，仅去运动）；卡面支持 children/overlay 任意内容而非仅图片。

const SPRING = { damping: 30, stiffness: 100, mass: 2 } as const;
const CAPTION_SPRING = { stiffness: 350, damping: 30, mass: 1 } as const;

export function TiltedCard({
  imageSrc,
  altText = "Tilted card",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  cardHeight = "300px",
  cardWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  children,
  className,
  style,
  ...props
}: TiltedCardProps & Omit<HTMLAttributes<HTMLElement>, keyof TiltedCardProps>) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(1, SPRING);
  const opacity = useSpring(0);
  const rotateCaption = useSpring(0, CAPTION_SPRING);

  const [lastY, setLastY] = useState(0);

  function handleMove(e: PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    if (!reduce) {
      rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
      rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
      const velocityY = offsetY - lastY;
      rotateCaption.set(-velocityY * 0.6);
    }
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    setLastY(offsetY);
  }

  function handleEnter() {
    scale.set(reduce ? 1 : scaleOnHover);
    opacity.set(1);
  }

  function handleLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateCaption.set(0);
  }

  return (
    <LazyMotionProvider>
      <figure
        {...props}
        ref={ref}
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        className={cn(
          "relative flex flex-col items-center justify-center [perspective:800px]",
          className,
        )}
        style={
          { height: containerHeight, width: containerWidth, ...style } as CSSProperties
        }
      >
        <m.div
          className="relative [transform-style:preserve-3d]"
          style={{ width: cardWidth, height: cardHeight, rotateX, rotateY, scale }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={altText}
              className="absolute inset-0 h-full w-full rounded-2xl object-cover [transform:translateZ(0)] [will-change:transform]"
              style={{ width: cardWidth, height: cardHeight }}
            />
          ) : null}

          {children ? (
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-surface">
              {children}
            </div>
          ) : null}

          {displayOverlayContent && overlayContent ? (
            <m.div
              className="absolute inset-0 z-[2] text-foreground [transform:translateZ(30px)] [will-change:transform]"
            >
              {overlayContent}
            </m.div>
          ) : null}
        </m.div>

        {showTooltip ? (
          <m.figcaption
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-[3]",
              "rounded-md border border-border bg-surface px-2.5 py-1",
              "text-[10px] leading-none text-foreground shadow-sm",
            )}
            style={{ x, y, opacity, rotate: rotateCaption }}
          >
            {captionText}
          </m.figcaption>
        ) : null}
      </figure>
    </LazyMotionProvider>
  );
}
