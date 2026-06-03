"use client";
import { createContext, useContext, useRef, type CSSProperties } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { LazyMotionProvider, m } from "../motion";
import { cn } from "../lib/cn";
import type { DockProps, DockIconProps } from "./dock.types";

// 吸取自 magicui.design Dock：macOS 式放大坞，图标按与鼠标的水平距离放大（motion，必 "use client"）。
// 瑚琏化：底座用 surface/border token；mouseX 经 context 下发给各 DockIcon（替 magicui 的 cloneElement）；
// reduced-motion → 不放大（恒定尺寸）。
interface DockCtx {
  mouseX: MotionValue<number>;
  magnification: number;
  distance: number;
  iconSize: number;
  reduce: boolean;
}
const DockContext = createContext<DockCtx | null>(null);

export function Dock({
  children,
  magnification = 64,
  distance = 140,
  iconSize = 40,
  className,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const reduce = useReducedMotion() ?? false;

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance, iconSize, reduce }}>
      <LazyMotionProvider>
        <m.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className={cn(
            "mx-auto flex h-16 items-end gap-3 rounded-2xl border border-border bg-surface/80 px-3 pb-2 backdrop-blur-md",
            className,
          )}
        >
          {children}
        </m.div>
      </LazyMotionProvider>
    </DockContext.Provider>
  );
}

export function DockIcon({ children, className }: DockIconProps) {
  const ctx = useContext(DockContext);
  const ref = useRef<HTMLDivElement>(null);
  const fallback = useMotionValue(Infinity);
  const { mouseX, magnification, distance, iconSize, reduce } = ctx ?? {
    mouseX: fallback,
    magnification: 64,
    distance: 140,
    iconSize: 40,
    reduce: true,
  };

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const sizeTarget = useTransform(distanceFromMouse, [-distance, 0, distance], [iconSize, magnification, iconSize]);
  const size = useSpring(sizeTarget, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <LazyMotionProvider>
      <m.div
        ref={ref}
        style={reduce ? ({ width: iconSize, height: iconSize } as CSSProperties) : { width: size, height: size }}
        className={cn(
          "flex aspect-square items-center justify-center rounded-full bg-surface-hover text-foreground",
          className,
        )}
      >
        {children}
      </m.div>
    </LazyMotionProvider>
  );
}
