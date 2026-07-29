"use client";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Plus } from "../_icons";
import { cn } from "../lib/cn";
import { pressableClass } from "../motion";
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
  // dragging 单独用 state（moved 是 ref 不触发渲染）：只为在拖拽期间关掉按压缩放。
  // 一次手势只翻转两次，而 setDrag 本来每次 move 都在重渲染，无额外开销。
  const [dragging, setDragging] = useState(false);
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
    if (Math.abs(mx) > 3 || Math.abs(my) > 3) {
      s.moved = true;
      setDragging(true);
    }
    setDrag({ x: s.dx + mx, y: s.dy + my });
  };
  // pointercancel 必须和 pointerup 走同一套重置：真机上手势被系统打断（来电、手势冲突、
  // 指针被别的元素捕获）时只会派发 cancel，不接就会卡在拖拽态 —— 按钮永久停在放大态且认为自己还在被拖。
  const onPointerUp = () => {
    st.current.active = false;
    setDragging(false);
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
              // 指名 translate+opacity（v4 下 translate 是独立属性）而非 transition-all：
              // all 会把 layout 属性一并纳入过渡，触发 layout+paint；这里只需要 GPU 合成的两项。
              "flex items-center gap-3 transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
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
                pressableClass,
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
        onPointerCancel={onPointerUp}
        className={cn(
          // 主钮已有 transition-transform（v4 下 property 列表含 scale），故只补 active 缩放即可，
          // 不套 pressableClass —— 那会接管 transition-property，与拖拽时的 transform 写入打架。
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl outline-none transition-transform duration-150 ease-out hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100",
          // 拖拽期间不缩放：缩小表达的是「被按进平面」，而拖拽的心智是「拿起来离开平面移动」，
          // 两者语义相反；且按压反馈本是百毫秒级的瞬时状态，拖拽可持续数秒，会变成按钮莫名一直小一圈，
          // 还与同在 :active 下的 cursor-grabbing（已在说「抓着」）互相打架。
          dragging ? "scale-100" : "active:scale-[0.97]",
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
