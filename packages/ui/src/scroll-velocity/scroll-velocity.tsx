"use client";
import { useLayoutEffect, useRef, useState } from "react";
import {
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  useReducedMotion,
} from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { ScrollVelocityProps } from "./scroll-velocity.types";

// 吸取自 React Bits ScrollVelocity：多行文字跑马灯随页面滚动速度加速/变向，静止时匀速漂移；
// 偶/奇行方向交替形成视差。瑚琏化：用 m + LazyMotionProvider(domAnimation) 替全量 motion 减包；
// 字色走 text-foreground token（替原 sans-serif 黑字）；reduced-motion 时冻结自走帧但保留全部 DOM（两态结构一致）。

/** 监听元素实际宽度，用于无缝循环回绕计算 */
function useElementWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    function update() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return width;
}

/** 把 v 回绕到 [min, max) 区间，实现无缝循环 */
function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

interface VelocityRowProps {
  children: React.ReactNode;
  baseVelocity: number;
  damping: number;
  stiffness: number;
  numCopies: number;
  velocityMapping: { input: [number, number]; output: [number, number] };
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  reduce: boolean;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

function VelocityRow({
  children,
  baseVelocity,
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  scrollContainerRef,
  className,
  reduce,
  parallaxStyle,
  scrollerStyle,
}: VelocityRowProps) {
  const baseX = useMotionValue(0);
  const scrollOptions = scrollContainerRef
    ? { container: scrollContainerRef as React.RefObject<HTMLElement> }
    : {};
  const { scrollY } = useScroll(scrollOptions);
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping.input,
    velocityMapping.output,
    { clamp: false },
  );

  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef);

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return "0px";
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef(1);
  useAnimationFrame((_t, delta) => {
    // reduced-motion：冻结自走帧（仍保留全部 DOM 结构，两态一致）
    if (reduce) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    const factor = velocityFactor.get();
    if (factor < 0) {
      directionFactor.current = -1;
    } else if (factor > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const spans = [];
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <span
        className={cn("flex-shrink-0", className)}
        key={i}
        ref={i === 0 ? copyRef : null}
      >
        {children}&nbsp;
      </span>,
    );
  }

  return (
    <div className="relative overflow-hidden" style={parallaxStyle}>
      <m.div
        className="flex whitespace-nowrap"
        style={{ x, ...scrollerStyle }}
      >
        {spans}
      </m.div>
    </div>
  );
}

export function ScrollVelocity({
  texts = [],
  velocity = 100,
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  scrollContainerRef,
  className,
  containerClassName,
  parallaxStyle,
  scrollerStyle,
}: ScrollVelocityProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <LazyMotionProvider>
      <section
        className={cn(
          "text-4xl font-bold tracking-tight text-foreground md:text-7xl",
          containerClassName,
        )}
      >
        {texts.map((text, index) => (
          <VelocityRow
            key={index}
            baseVelocity={index % 2 !== 0 ? -velocity : velocity}
            damping={damping}
            stiffness={stiffness}
            numCopies={numCopies}
            velocityMapping={velocityMapping}
            scrollContainerRef={scrollContainerRef}
            className={className}
            reduce={reduce}
            parallaxStyle={parallaxStyle}
            scrollerStyle={scrollerStyle}
          >
            {text}
          </VelocityRow>
        ))}
      </section>
    </LazyMotionProvider>
  );
}
