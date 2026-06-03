"use client";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "../lib/cn";
import type { ColorFormat, ColorPickerProps } from "./color-picker.types";
import { formatColor, parseColor, rgbToHex } from "./color-utils";

// 颜色选择器（含色板拖拽 + 文本输入故 "use client"）。
// 内核 react-colorful（hex 单一真源）+ 零依赖 hex→rgb/hsl 派生 + 瑚琏 token 皮肤。受控/非受控对称。
const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl"];

const FORMAT_LABEL: Record<ColorFormat, string> = {
  hex: "十六进制颜色值",
  rgb: "RGB 颜色值",
  hsl: "HSL 颜色值",
};

export function ColorPicker({
  value,
  defaultValue = "#3b82f6",
  onValueChange,
  format,
  defaultFormat = "hex",
  onFormatChange,
  disabled = false,
  showInput = true,
  showFormatSwitcher = true,
  className,
}: ColorPickerProps) {
  // 颜色：受控读 value（解析为 hex 规范），非受控读内部 state
  const isControlled = value !== undefined;
  const normalize = (v: string) => {
    const rgb = parseColor(v);
    return rgb ? rgbToHex(rgb) : "#000000";
  };
  const [internal, setInternal] = useState(() => normalize(defaultValue));
  const hex = isControlled ? normalize(value!) : internal;

  // 格式：受控读 format，非受控读内部 state
  const isFormatControlled = format !== undefined;
  const [internalFormat, setInternalFormat] = useState<ColorFormat>(defaultFormat);
  const fmt = isFormatControlled ? format! : internalFormat;

  // 文本输入草稿：仅在颜色或格式变化（含受控 value 重渲）时同步回规范串，
  // 半成品（解析失败）保持原样不被覆盖 —— 因为解析失败时 hex 不变，effect 不重跑。
  const [draft, setDraft] = useState(() => formatColor(hex, fmt));
  useEffect(() => {
    setDraft(formatColor(hex, fmt));
  }, [hex, fmt]);

  const commitColor = (nextHex: string) => {
    if (!isControlled) setInternal(nextHex);
    onValueChange?.(formatColor(nextHex, fmt));
  };

  const handleInput = (raw: string) => {
    setDraft(raw);
    const rgb = parseColor(raw);
    if (rgb) commitColor(rgbToHex(rgb));
  };

  const switchFormat = (next: ColorFormat) => {
    if (next === fmt) return;
    if (!isFormatControlled) setInternalFormat(next);
    onFormatChange?.(next);
    // 输出格式变了 → 用新格式重新吐当前颜色
    onValueChange?.(formatColor(hex, next));
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
        <HexColorPicker color={hex} onChange={commitColor} />
      </div>

      {/* 格式切换器：HEX / RGB / HSL 分段控件 */}
      {showFormatSwitcher && (
        <div role="group" aria-label="颜色格式" className="inline-flex rounded-[min(var(--radius),0.375rem)] border border-border p-0.5">
          {FORMATS.map((f) => {
            const active = f === fmt;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => switchFormat(f)}
                className={cn(
                  "flex-1 rounded-[min(var(--radius),0.25rem)] px-2.5 py-1 text-xs font-medium uppercase transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}

      {/* 当前色 swatch + 格式文本输入 */}
      {showInput && (
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-7 shrink-0 rounded-[min(var(--radius),0.375rem)] border border-border"
            style={{ backgroundColor: hex }}
          />
          <input
            type="text"
            value={draft}
            onChange={(e) => handleInput(e.target.value)}
            spellCheck={false}
            aria-label={FORMAT_LABEL[fmt]}
            className="w-full rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 font-mono text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}
