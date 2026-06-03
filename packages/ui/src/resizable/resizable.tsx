"use client";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type RefObject,
} from "react";
import { cn } from "../lib/cn";
import type {
  ResizableDirection,
  ResizableHandleProps,
  ResizablePanelGroupProps,
  ResizablePanelProps,
} from "./resizable.types";

type PanelConstraint = { min: number; max: number };

/** n 个面板均分（百分比）。 */
export function splitEqually(n: number): number[] {
  if (n <= 0) return [];
  return Array.from({ length: n }, () => 100 / n);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * 纯函数：在第 handleIndex / handleIndex+1 两相邻面板间转移 deltaPct 个点。
 * 正 delta → 前面板变大、后面板变小；双向受各自 min/max 钳制，总和守恒。
 * 不修改入参。
 */
export function applyResize(
  sizes: number[],
  handleIndex: number,
  deltaPct: number,
  constraints: PanelConstraint[],
): number[] {
  const i = handleIndex;
  const j = handleIndex + 1;
  if (i < 0 || j >= sizes.length) return sizes.slice();
  // 前面板能吃的实际量（受 i 的 min/max 限制）
  const newI = clamp(sizes[i] + deltaPct, constraints[i].min, constraints[i].max);
  let d = newI - sizes[i];
  // 再被后邻面板的 min/max 卡一次
  const newJ = clamp(sizes[j] - d, constraints[j].min, constraints[j].max);
  d = sizes[j] - newJ;
  const next = sizes.slice();
  next[i] = sizes[i] + d;
  next[j] = sizes[j] - d;
  return next;
}

interface ResizableCtx {
  direction: ResizableDirection;
  sizes: number[];
  constraints: PanelConstraint[];
  setSizes: (next: number[]) => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

const Ctx = createContext<ResizableCtx | null>(null);
function useGroup(part: string): ResizableCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error(`<${part}> 必须用在 <ResizablePanelGroup> 内`);
  return ctx;
}

type PanelInternal = ResizablePanelProps & { __index?: number };
type HandleInternal = ResizableHandleProps & { __handleIndex?: number };

export function ResizablePanelGroup({
  direction = "horizontal",
  sizes,
  defaultSizes,
  onSizesChange,
  className,
  children,
  ...props
}: ResizablePanelGroupProps) {
  const childArr = Children.toArray(children);
  const constraints: PanelConstraint[] = childArr
    .filter((c): c is ReactElement<ResizablePanelProps> => isValidElement(c) && c.type === ResizablePanel)
    .map((c) => ({ min: c.props.min ?? 10, max: c.props.max ?? 100 }));
  const panelCount = constraints.length;

  const isControlled = sizes !== undefined;
  const [internal, setInternal] = useState<number[]>(() => defaultSizes ?? splitEqually(panelCount));
  const current = sizes ?? internal;

  const setSizes = useCallback(
    (next: number[]) => {
      if (!isControlled) setInternal(next);
      onSizesChange?.(next);
    },
    [isControlled, onSizesChange],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 注入面板/手柄索引：确定性、SSR 安全、无注册竞态（约定 Panel/Handle 为组的直接子元素）。
  let panelIdx = -1;
  const rendered = childArr.map((child) => {
    if (!isValidElement(child)) return child;
    if (child.type === ResizablePanel) {
      panelIdx += 1;
      return cloneElement(child as ReactElement<PanelInternal>, { __index: panelIdx });
    }
    if (child.type === ResizableHandle) {
      return cloneElement(child as ReactElement<HandleInternal>, { __handleIndex: panelIdx });
    }
    return child;
  });

  return (
    <Ctx.Provider value={{ direction, sizes: current, constraints, setSizes, containerRef }}>
      <div
        ref={containerRef}
        data-resizable-group=""
        data-direction={direction}
        className={cn("flex h-full w-full items-stretch", direction === "horizontal" ? "flex-row" : "flex-col", className)}
        {...props}
      >
        {rendered}
      </div>
    </Ctx.Provider>
  );
}

export function ResizablePanel({ className, style, __index, min: _min, max: _max, ...props }: PanelInternal) {
  const { sizes } = useGroup("ResizablePanel");
  const i = __index ?? 0;
  const size = sizes[i] ?? 100 / Math.max(1, sizes.length);
  return (
    <div
      data-panel=""
      className={cn("min-h-0 min-w-0 overflow-auto", className)}
      style={{ flexGrow: size, flexShrink: 1, flexBasis: "0%", ...style }}
      {...props}
    />
  );
}

export function ResizableHandle({ className, keyboardStep = 5, __handleIndex, ...props }: HandleInternal) {
  const { direction, sizes, constraints, setSizes, containerRef } = useGroup("ResizableHandle");
  const handleIndex = __handleIndex ?? 0;
  const horizontal = direction === "horizontal";
  const dragRef = useRef<{ startPos: number; base: number[]; avail: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const panelEls = Array.from(container.querySelectorAll<HTMLElement>("[data-panel]"));
    const avail = panelEls.reduce((s, p) => s + (horizontal ? p.offsetWidth : p.offsetHeight), 0);
    dragRef.current = { startPos: horizontal ? e.clientX : e.clientY, base: sizes.slice(), avail };
    setDragging(true);
    // 捕获指针保证拖出手柄范围仍跟踪；best-effort（无活跃指针时不阻断拖拽）。
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const pos = horizontal ? e.clientX : e.clientY;
    const deltaPct = d.avail > 0 ? ((pos - d.startPos) / d.avail) * 100 : 0;
    setSizes(applyResize(d.base, handleIndex, deltaPct, constraints));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    dragRef.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const inc = horizontal ? "ArrowRight" : "ArrowDown";
    const dec = horizontal ? "ArrowLeft" : "ArrowUp";
    let delta: number | null = null;
    if (e.key === inc) delta = keyboardStep;
    else if (e.key === dec) delta = -keyboardStep;
    else if (e.key === "Home") delta = constraints[handleIndex].min - sizes[handleIndex];
    else if (e.key === "End") delta = constraints[handleIndex].max - sizes[handleIndex];
    if (delta === null) return;
    e.preventDefault();
    setSizes(applyResize(sizes, handleIndex, delta, constraints));
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-valuenow={Math.round(sizes[handleIndex] ?? 0)}
      aria-valuemin={constraints[handleIndex]?.min ?? 0}
      aria-valuemax={constraints[handleIndex]?.max ?? 100}
      data-resizable-handle=""
      data-direction={direction}
      {...(dragging ? { "data-dragging": "" } : {})}
      className={cn(
        "group relative shrink-0 bg-border outline-none transition-colors",
        "hover:bg-primary focus-visible:bg-primary data-[dragging]:bg-primary",
        "focus-visible:ring-2 focus-visible:ring-ring",
        horizontal ? "w-1.5 cursor-col-resize self-stretch touch-pan-y" : "h-1.5 cursor-row-resize w-full touch-pan-x",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      {...props}
    >
      {/* 居中抓握条：提升可发现性，明暗皆吃 token。 */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30 transition-colors group-hover:bg-bg group-data-[dragging]:bg-bg",
          horizontal ? "h-6 w-0.5" : "h-0.5 w-6",
        )}
      />
    </div>
  );
}
