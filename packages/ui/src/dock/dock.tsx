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
  activeKey?: string;
  onSelect?: (key: string) => void;
}
const DockContext = createContext<DockCtx | null>(null);

export function Dock({
  children,
  magnification = 64,
  distance = 140,
  iconSize = 40,
  activeKey,
  onSelect,
  className,
  "aria-label": ariaLabel,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const reduce = useReducedMotion() ?? false;
  // 能选中就是导航：给出 nav 地标，屏幕阅读器才会把它当一组导航项而不是一堆装饰图标来读。
  const Root = onSelect ? m.nav : m.div;

  return (
    <DockContext.Provider
      value={{ mouseX, magnification, distance, iconSize, reduce, activeKey, onSelect }}
    >
      <LazyMotionProvider>
        <Root
          aria-label={ariaLabel}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className={cn(
            "mx-auto flex h-16 items-end gap-3 rounded-2xl border border-border bg-surface/80 px-3 pb-2 backdrop-blur-md",
            className,
          )}
        >
          {children}
        </Root>
      </LazyMotionProvider>
    </DockContext.Provider>
  );
}

export function DockIcon({ children, itemKey, active, label, className }: DockIconProps) {
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
  // 显式 active 优先；否则拿本项 key 与 Dock 的 activeKey 比对。
  const isActive = active ?? (itemKey != null && ctx?.activeKey === itemKey);
  // 只有「有 key 且上层接了 onSelect」才升级成真正的按钮：其余情况保持无语义容器，
  // 免得给消费方自己放在 children 里的 <a> 再套一层 button（嵌套交互元素）。
  const selectable = itemKey != null && ctx?.onSelect != null;

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const sizeTarget = useTransform(distanceFromMouse, [-distance, 0, distance], [iconSize, magnification, iconSize]);
  const size = useSpring(sizeTarget, { mass: 0.1, stiffness: 150, damping: 12 });

  const Icon = selectable ? m.button : m.div;

  return (
    <LazyMotionProvider>
      <Icon
        ref={ref as never}
        {...(selectable
          ? { type: "button" as const, "aria-label": label, onClick: () => ctx?.onSelect?.(itemKey!) }
          : {})}
        // aria-current 是选中态的**语义**部分：缺它，屏幕阅读器用户完全拿不到当前位置。
        aria-current={isActive ? "page" : undefined}
        style={reduce ? ({ width: iconSize, height: iconSize } as CSSProperties) : { width: size, height: size }}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full bg-surface-hover text-foreground",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          selectable && "cursor-pointer",
          isActive && "text-primary",
          className,
        )}
      >
        {children}
        {/* 指示点照 macOS 的做法落在图标**下方**（正好落进 Dock 的 pb-2 里）：
            它是形状线索而不只是颜色线索，也最不打扰放大动效。 */}
        {isActive && (
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary"
          />
        )}
      </Icon>
    </LazyMotionProvider>
  );
}
