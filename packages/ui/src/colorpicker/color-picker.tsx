"use client";
import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { cn } from "../lib/cn";
import type { ColorPickerProps } from "./color-picker.types";

// 颜色选择器（含色板拖拽 + hex 文本输入故 "use client"）。
// 基于 react-colorful 色板内核 + 瑚琏 token 皮肤外壳。受控/非受控对称。
export function ColorPicker({
  value,
  defaultValue = "#3b82f6",
  onValueChange,
  disabled = false,
  showInput = true,
  className,
}: ColorPickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  // 受控读 value，非受控读内部 state
  const color = isControlled ? value! : internal;

  const handleChange = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-surface p-3",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {/* 色板：包一层 div 固定 200x200（react-colorful 默认尺寸由内部 class 控制） */}
      <div className="size-[200px]">
        <HexColorPicker color={color} onChange={handleChange} />
      </div>

      {/* 当前色 swatch + hex 输入 */}
      {showInput && (
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-7 shrink-0 rounded-[min(var(--radius),0.375rem)] border border-border"
            style={{ backgroundColor: color }}
          />
          <HexColorInput
            color={color}
            onChange={handleChange}
            prefixed
            aria-label="十六进制颜色值"
            className="w-full rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
