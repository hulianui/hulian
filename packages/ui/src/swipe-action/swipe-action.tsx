"use client";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "../lib/cn";
import type { SwipeActionButton, SwipeActionProps, SwipeActionTone } from "./swipe-action.types";

// 列表项滑动操作（"use client"·零依赖·Pointer Events）：内容层 translateX 跟手，左/右动作面板藏在内容下方，
// 滑过其宽度的 threshold 即吸附全开，否则回弹归零。先判主轴（横向才接管，纵向放行滚动），拖后抑制收尾 click 误关。
const TONE: Record<SwipeActionTone, string> = {
  default: "bg-surface-hover text-foreground",
  primary: "bg-primary text-primary-foreground",
  danger: "bg-danger text-danger-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

export function SwipeAction({
  children,
  left,
  right,
  threshold = 0.5,
  onOpenChange,
  className,
}: SwipeActionProps) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, y: 0, offset: 0, decided: null as null | boolean });
  const justDragged = useRef(false);

  const widths = () => ({
    left: leftRef.current?.offsetWidth ?? 0,
    right: rightRef.current?.offsetWidth ?? 0,
  });

  const emit = (o: number) => onOpenChange?.(o === 0 ? null : o > 0 ? "left" : "right");

  const close = () => {
    setOffset(0);
    emit(0);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, offset, decided: null };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (start.current.decided === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      start.current.decided = Math.abs(dx) > Math.abs(dy);
      // best-effort：jsdom / 未捕获指针时 setPointerCapture 可能抛 InvalidPointerId，不可中断后续位移。
      if (start.current.decided) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* 忽略：指针捕获失败不影响跟手 */
        }
      }
    }
    if (!start.current.decided) return; // 纵向手势 → 放行原生滚动
    const { left: lw, right: rw } = widths();
    setOffset(Math.max(-rw, Math.min(lw, start.current.offset + dx)));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    justDragged.current = !!start.current.decided;
    if (!start.current.decided) return;
    const { left: lw, right: rw } = widths();
    let next = 0;
    if (offset > 0 && lw > 0 && offset > lw * threshold) next = lw;
    else if (offset < 0 && rw > 0 && -offset > rw * threshold) next = -rw;
    setOffset(next);
    emit(next);
  };

  const renderActions = (
    btns: SwipeActionButton[] | undefined,
    ref: { current: HTMLDivElement | null },
    side: "left" | "right",
  ) =>
    btns && btns.length > 0 ? (
      <div
        ref={(node) => {
          ref.current = node;
        }}
        className={cn("absolute inset-y-0 flex", side === "left" ? "left-0" : "right-0")}
      >
        {btns.map((b) => (
          <button
            key={b.key}
            type="button"
            onClick={() => {
              b.onClick?.();
              close();
            }}
            className={cn(
              "flex items-center whitespace-nowrap px-4 text-sm font-medium outline-none focus-visible:brightness-95",
              TONE[b.tone ?? "default"],
            )}
          >
            {b.label}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {renderActions(left, leftRef, "left")}
      {renderActions(right, rightRef, "right")}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (justDragged.current) {
            justDragged.current = false;
            return;
          }
          if (offset !== 0) close();
        }}
        style={{ transform: `translateX(${offset}px)` }}
        className={cn(
          "relative touch-pan-y bg-surface",
          !dragging && "transition-transform duration-200 motion-reduce:transition-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}
