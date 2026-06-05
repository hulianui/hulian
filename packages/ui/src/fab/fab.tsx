"use client";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Plus } from "../_icons";
import { cn } from "../lib/cn";
import type { FabPosition, FabProps } from "./fab.types";

// 悬浮操作钮（FAB·"use client"·零依赖）：默认 fixed 贴视口右下；提供 actions 则点主钮展开
// speed-dial 子动作（错峰淡入 + 主钮图标旋 45°），否则主钮直接触发 onClick。reduced-motion 去过渡。
const POSITION: Record<FabPosition, string> = {
  "bottom-right": "bottom-6 right-6 items-end",
  "bottom-left": "bottom-6 left-6 items-start",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2 items-center",
};

const SIZE = {
  sm: { main: "size-12", icon: "size-5", action: "size-10" },
  md: { main: "size-14", icon: "size-6", action: "size-11" },
} as const;

export function Fab({
  icon,
  label,
  actions,
  position = "bottom-right",
  size = "md",
  draggable = false,
  onClick,
  "aria-label": ariaLabel,
  className,
}: FabProps) {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  // 拖拽态：ox/oy=按下点，dx/dy=按下时已有偏移，moved=越过阈值（用于区分拖拽与点击）。
  const st = useRef({ ox: 0, oy: 0, dx: 0, dy: 0, moved: false, active: false });
  const hasActions = !!actions && actions.length > 0;
  const sz = SIZE[size];

  const handleMain = () => {
    // 拖拽刚结束的这次 click 不触发动作（指针抬起后浏览器仍会补发 click）。
    if (st.current.moved) {
      st.current.moved = false;
      return;
    }
    if (hasActions) setOpen((o) => !o);
    else onClick?.();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    st.current = { ox: e.clientX, oy: e.clientY, dx: drag.x, dy: drag.y, moved: false, active: true };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = st.current;
    if (!s.active) return;
    const mx = e.clientX - s.ox;
    const my = e.clientY - s.oy;
    if (Math.abs(mx) > 3 || Math.abs(my) > 3) s.moved = true;
    setDrag({ x: s.dx + mx, y: s.dy + my });
  };
  const onPointerUp = () => {
    st.current.active = false;
  };

  // 拖拽偏移走 inline transform（覆盖 bottom-center 的 -translate-x-1/2，故 base 里补回 -50%）。
  const dragStyle = draggable
    ? {
        transform: `${position === "bottom-center" ? "translateX(-50%) " : ""}translate3d(${drag.x}px, ${drag.y}px, 0)`,
        touchAction: "none" as const,
      }
    : undefined;

  return (
    <div className={cn("fixed z-50 flex flex-col gap-3", POSITION[position], className)} style={dragStyle}>
      {hasActions &&
        actions!.map((a, i) => (
          <div
            key={a.key}
            className={cn(
              "flex items-center gap-3 transition-all duration-200 motion-reduce:transition-none",
              position === "bottom-left" ? "flex-row-reverse" : "flex-row",
              open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
            )}
            style={{ transitionDelay: open ? `${(actions!.length - 1 - i) * 30}ms` : "0ms" }}
          >
            {a.label && (
              <span className="rounded-[var(--radius)] bg-surface px-2 py-1 text-xs text-foreground shadow-md">
                {a.label}
              </span>
            )}
            <button
              type="button"
              aria-label={a.label ?? a.key}
              onClick={() => {
                a.onClick?.();
                setOpen(false);
              }}
              className={cn(
                sz.action,
                "flex items-center justify-center rounded-full border border-hairline bg-surface text-foreground shadow-lg outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              {a.icon}
            </button>
          </div>
        ))}
      <button
        type="button"
        aria-label={ariaLabel ?? label ?? "操作"}
        aria-expanded={hasActions ? open : undefined}
        onClick={handleMain}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl outline-none transition-transform hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
          // 有文字 → extended 胶囊（自适应宽度）；否则圆形主钮。
          label ? (size === "sm" ? "h-12 gap-2 px-4" : "h-14 gap-2 px-5") : sz.main,
          draggable && "cursor-grab touch-none active:cursor-grabbing",
        )}
      >
        <span className={cn("flex transition-transform duration-200 motion-reduce:transition-none", open && "rotate-45")}>
          {icon ?? <Plus className={sz.icon} aria-hidden />}
        </span>
        {label && <span className="text-sm font-medium">{label}</span>}
      </button>
    </div>
  );
}
