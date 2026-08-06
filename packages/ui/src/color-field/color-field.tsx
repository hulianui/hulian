"use client";
import { memo, useState } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { inputShellVariants } from "../input/input";
import type { ColorFieldProps } from "./color-field.types";

const SHORT = /^#?[0-9a-f]{3}$/i;
const FULL = /^#?[0-9a-f]{6}$/i;

/** 是否是可解析的十六进制颜色（`#rgb` / `#rrggbb`，`#` 可省）。 */
export function isHexColor(input: string): boolean {
  const s = input.trim();
  return SHORT.test(s) || FULL.test(s);
}

/**
 * 规范化成小写 `#rrggbb`；不可解析返回 null。
 *
 * 纯函数单独导出：颜色输入的「哪些写法算合法」是消费方也要用的判断
 * （比如导入一份主题配置时先校验），不该只活在组件内部。
 */
export function normalizeHex(input: string): string | null {
  const s = input.trim().replace(/^#/, "").toLowerCase();
  if (SHORT.test(s)) {
    // #abc → #aabbcc：短写是缩写而不是别的颜色，逐位展开
    return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  }
  if (FULL.test(s)) return `#${s}`;
  return null;
}

const SWATCH_SIZE = { sm: "size-4", md: "size-5", lg: "size-6" } as const;

/**
 * 颜色输入框 · 紧凑单行：色块（调起系统取色器）+ 十六进制文本输入。
 *
 * 与 ColorPicker 的分工：ColorPicker 是完整取色面板（饱和度方块 + 格式切换），
 * 占一整块地方；ColorField 是**表单里的一行**，适合「已知色值、偶尔微调」的场景
 * （主题配置表、设计 token 编辑器），不抢版面。
 *
 * 内部维护「草稿态」：受控组件如果直接把 value 回灌进 input，用户敲到 `#3` 时
 * 就会被规范化逻辑打回去，根本没法手输。所以键入期间以本地草稿为准，
 * 只在解析成功时向外抛值，失焦时丢掉草稿归一到规范值。
 */
function ColorFieldImpl({
  value,
  defaultValue = "#3b82f6",
  onValueChange,
  showSwatch = true,
  size = "md",
  invalid,
  disabled,
  className,
  onBlur,
  ...props
}: ColorFieldProps) {
  const locale = useComponentLocale().colorField ?? { openPicker: "打开取色器" };
  const [inner, setInner] = useState(() => normalizeHex(defaultValue) ?? "#3b82f6");
  const committed = value !== undefined ? normalizeHex(value) ?? inner : inner;

  // null = 没有正在编辑的草稿，显示规范值
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? committed;

  const commit = (hex: string) => {
    if (value === undefined) setInner(hex);
    onValueChange?.(hex);
  };

  const onType = (raw: string) => {
    setDraft(raw);
    const hex = normalizeHex(raw);
    if (hex) commit(hex);
  };

  // 草稿非空且解析不出颜色 → 标红。空草稿不算错（用户清空了准备重输）。
  const draftInvalid = draft != null && draft.trim() !== "" && !isHexColor(draft);

  return (
    <span
      className={cn(inputShellVariants({ size }), "font-mono", className)}
      data-disabled={disabled ? "" : undefined}
    >
      {showSwatch && (
        <span
          className={cn(
            "relative shrink-0 overflow-hidden rounded-[calc(var(--radius)/2)] border border-hairline",
            SWATCH_SIZE[size],
            disabled ? "opacity-50" : "cursor-pointer",
          )}
          style={{ background: committed }}
        >
          {/* 原生取色器：铺满色块但完全透明 —— 借它拿到系统调色盘，
              外观仍由上面的 span 用 token 控制（原生 input[type=color] 的外观改不动）。 */}
          <input
            type="color"
            aria-label={locale.openPicker}
            tabIndex={-1}
            disabled={disabled}
            value={committed}
            onChange={(e) => {
              setDraft(null);
              commit(e.target.value.toLowerCase());
            }}
            className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </span>
      )}
      <input
        {...props}
        type="text"
        inputMode="text"
        spellCheck={false}
        autoComplete="off"
        disabled={disabled}
        value={shown}
        placeholder="#38e8ff"
        onChange={(e) => onType(e.target.value)}
        onBlur={(e) => {
          setDraft(null); // 丢草稿 → 回到规范值，半截输入不会留在框里
          onBlur?.(e);
        }}
        {...((invalid || draftInvalid) && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
      />
    </span>
  );
}
ColorFieldImpl.displayName = "ColorField";

// 典型场景是主题配置表 / token 编辑器——一屏几十行，父级（受控 hex 的持有者）一动就整表重算。
// 受控用法下 value 是字符串、onValueChange 常是 setState，引用全稳定，
// React 却无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const ColorField = memo(ColorFieldImpl);
ColorField.displayName = "ColorField";
