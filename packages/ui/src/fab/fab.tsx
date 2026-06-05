"use client";
import { useState } from "react";
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
  onClick,
  "aria-label": ariaLabel,
  className,
}: FabProps) {
  const [open, setOpen] = useState(false);
  const hasActions = !!actions && actions.length > 0;
  const sz = SIZE[size];

  const handleMain = () => {
    if (hasActions) setOpen((o) => !o);
    else onClick?.();
  };

  return (
    <div className={cn("fixed z-50 flex flex-col gap-3", POSITION[position], className)}>
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
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl outline-none transition-transform hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
          // 有文字 → extended 胶囊（自适应宽度）；否则圆形主钮。
          label ? (size === "sm" ? "h-12 gap-2 px-4" : "h-14 gap-2 px-5") : sz.main,
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
