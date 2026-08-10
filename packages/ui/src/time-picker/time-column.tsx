"use client";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import { pad2 } from "./time-picker-core";

// 单列候选（时/分/秒）。TimePicker 与 DateTimePicker 共用 —— 两个浮层里的时间列必须
// 长得一模一样、禁用逻辑也一致，各写一份必然漂移。

export interface TimeColumnProps {
  label: string;
  values: number[];
  active: number | null;
  isDisabled: (v: number) => boolean;
  onPick: (v: number) => void;
  /** 浮层是否打开：打开时把选中项滚进视口，否则 23 点的值要用户自己滚到底去找。 */
  open: boolean;
}

export function TimeColumn({ label, values, active, isDisabled, onPick, open }: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = activeRef.current;
    const box = listRef.current;
    // offsetTop 是相对 offsetParent 的。滚动容器必须自己是 offsetParent（下面的 `relative`），
    // 否则会向上找到带列头的外层 div，offsetTop 里混进列头高度 —— 表现是每次都多滚一格，
    // 选中项被顶到可视区外（真机才看得见，jsdom 无布局，offsetTop 恒 0）。
    if (el && box) box.scrollTop = el.offsetTop;
  }, [open, active]);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="border-b border-border px-2 py-1 text-center text-xs text-muted-foreground">{label}</div>
      <div ref={listRef} role="listbox" aria-label={label} className="relative h-48 w-14 overflow-y-auto scroll-smooth py-1">
        {values.map((v) => {
          const dis = isDisabled(v);
          const isActive = active === v;
          return (
            <button
              key={v}
              type="button"
              role="option"
              aria-selected={isActive}
              aria-label={`${label} ${pad2(v)}`}
              disabled={dis}
              ref={isActive ? activeRef : undefined}
              onClick={() => onPick(v)}
              className={cn(
                "flex h-8 w-full items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                isActive ? "bg-primary font-medium text-primary-foreground" : "text-foreground hover:bg-surface-hover",
                dis && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
              )}
            >
              {pad2(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
