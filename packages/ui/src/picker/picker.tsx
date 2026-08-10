"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { PickerColumn, PickerProps } from "./picker.types";

// 滚轮选择器（"use client"·零依赖·CSS scroll-snap）：每列一个吸附滚动容器，上下留白让首/末项可居中；
// 滚动中即时高亮居中项，停稳(120ms 防抖)后取最近项 emit。受控 value 变化时滚到对应位（吸附到精确行）。
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function Column({
  column,
  value,
  itemHeight,
  visibleCount,
  onSelect,
}: {
  column: PickerColumn;
  value: string | undefined;
  itemHeight: number;
  visibleCount: number;
  onSelect: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const options = column.options;
  const selectedIndex = clamp(
    options.findIndex((o) => o.value === value),
    0,
    Math.max(0, options.length - 1),
  );
  const [centerIndex, setCenterIndex] = useState(selectedIndex);
  const pad = ((visibleCount - 1) / 2) * itemHeight;

  // 受控同步：value 变 → 滚到精确行（差异 >1px 才动，避免与用户滚动打架/抖动）。
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = selectedIndex * itemHeight;
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTop = target;
      setCenterIndex(selectedIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, itemHeight]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setCenterIndex(clamp(Math.round(el.scrollTop / itemHeight), 0, options.length - 1));
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const idx = clamp(Math.round(el.scrollTop / itemHeight), 0, options.length - 1);
      const opt = options[idx];
      if (opt && opt.value !== value) onSelect(opt.value);
    }, 120);
  };

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: visibleCount * itemHeight, scrollbarWidth: "none" }}
    >
      <div style={{ height: pad }} aria-hidden />
      {options.map((o, i) => (
        <div
          key={o.value}
          className={cn(
            "flex snap-center items-center justify-center text-center transition-colors",
            i === centerIndex ? "font-medium text-foreground" : "text-muted-foreground",
          )}
          style={{ height: itemHeight }}
        >
          {o.label}
        </div>
      ))}
      <div style={{ height: pad }} aria-hidden />
    </div>
  );
}

export function Picker({
  columns,
  value,
  defaultValue,
  onChange,
  visibleCount = 5,
  itemHeight = 40,
  className,
}: PickerProps) {
  const [internal, setInternal] = useState<string[]>(
    () => defaultValue ?? columns.map((c) => c.options[0]?.value ?? ""),
  );
  const values = value ?? internal;

  const setCol = (i: number, v: string) => {
    const next = values.slice();
    next[i] = v;
    if (value === undefined) setInternal(next);
    onChange?.(next, i);
  };

  return (
    <div
      className={cn(
        "relative flex select-none overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
        className,
      )}
    >
      {/* 中央高亮带 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y border-border bg-surface-hover/40"
        style={{ height: itemHeight }}
        aria-hidden
      />
      {columns.map((col, i) => (
        <div key={i} style={{ flex: col.flex ?? 1 }}>
          <Column
            column={col}
            value={values[i]}
            itemHeight={itemHeight}
            visibleCount={visibleCount}
            onSelect={(v) => setCol(i, v)}
          />
        </div>
      ))}
    </div>
  );
}
