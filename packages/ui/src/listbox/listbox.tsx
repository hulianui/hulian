"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import { Check } from "../_icons";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { ListboxProps, ListboxItemData } from "./listbox.types";

// 自建可选列表（WAI-ARIA listbox pattern·零依赖）：roving tabindex + 方向键/Home/End/Enter/Space + 单字符 typeahead。
// 含状态/键盘交互故 "use client"。Base UI rc.0 无 listbox primitive → 自实现语义。
export function Listbox({
  items,
  selectionMode = "single",
  selectedKeys,
  defaultSelectedKeys = [],
  onSelectionChange,
  disabledKeys = [],
  onAction,
  className,
  style,
  "aria-label": ariaLabel,
}: ListboxProps) {
  const locale = useComponentLocale().listbox ?? { label: "选项列表" };
  const resolvedAriaLabel = ariaLabel === undefined ? locale.label : ariaLabel;
  const isControlled = selectedKeys !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultSelectedKeys);
  const selected = isControlled ? selectedKeys! : internal;
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const isDisabled = (it: ListboxItemData) => it.disabled || disabledKeys.includes(it.key);
  const firstEnabled = items.findIndex((it) => !isDisabled(it));
  const [active, setActive] = useState(() => {
    const sel = items.findIndex((it) => selected.includes(it.key) && !isDisabled(it));
    return sel >= 0 ? sel : firstEnabled;
  });

  const setSelection = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onSelectionChange?.(next);
  };

  const activate = (i: number) => {
    const it = items[i];
    if (!it || isDisabled(it)) return;
    onAction?.(it.key);
    if (selectionMode === "single") {
      setSelection([it.key]);
    } else if (selectionMode === "multiple") {
      setSelection(
        selected.includes(it.key) ? selected.filter((k) => k !== it.key) : [...selected, it.key],
      );
    }
  };

  const moveTo = (i: number) => {
    setActive(i);
    refs.current[i]?.focus();
  };

  const step = (from: number, dir: 1 | -1) => {
    for (let n = 1; n <= items.length; n++) {
      const i = from + dir * n;
      if (i < 0 || i >= items.length) break;
      if (!isDisabled(items[i])) return i;
    }
    return from;
  };

  const edge = (dir: 1 | -1) => {
    const range = dir === 1 ? items.map((_, i) => i) : items.map((_, i) => i).reverse();
    for (const i of range) if (!isDisabled(items[i])) return i;
    return active;
  };

  const typeahead = (char: string, from: number) => {
    const c = char.toLowerCase();
    const text = (it: ListboxItemData) =>
      (typeof it.label === "string" ? it.label : it.key).toLowerCase();
    for (let n = 1; n <= items.length; n++) {
      const i = (from + n) % items.length;
      if (!isDisabled(items[i]) && text(items[i]).startsWith(c)) return i;
    }
    return -1;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveTo(step(active, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveTo(step(active, -1));
        break;
      case "Home":
        e.preventDefault();
        moveTo(edge(1));
        break;
      case "End":
        e.preventDefault();
        moveTo(edge(-1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        activate(active);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const i = typeahead(e.key, active);
          if (i >= 0) moveTo(i);
        }
    }
  };

  return (
    <div
      role="listbox"
      aria-label={resolvedAriaLabel}
      aria-multiselectable={selectionMode === "multiple" || undefined}
      onKeyDown={onKeyDown}
      className={cn(
        "flex max-h-72 w-56 flex-col gap-0.5 overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1",
        className,
      )}
      style={style}
    >
      {items.map((it, i) => {
        const disabled = isDisabled(it);
        const sel = selectionMode !== "none" && selected.includes(it.key);
        return (
          <div
            key={it.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="option"
            aria-selected={selectionMode === "none" ? undefined : sel}
            aria-disabled={disabled || undefined}
            tabIndex={i === active && !disabled ? 0 : -1}
            onClick={() => {
              if (disabled) return;
              setActive(i);
              activate(i);
            }}
            onMouseEnter={() => !disabled && setActive(i)}
            className={cn(
              "flex cursor-pointer select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-sm outline-none transition-colors",
              disabled
                ? "cursor-not-allowed text-muted opacity-50"
                : sel
                ? "bg-primary/12 text-primary"
                : "text-foreground",
              !disabled && i === active && !sel && "bg-surface-hover",
              !disabled && i === active && "ring-2 ring-ring",
            )}
          >
            {it.startContent && <span className="shrink-0">{it.startContent}</span>}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{it.label}</span>
              {it.description != null && (
                <span className="truncate text-xs text-muted">{it.description}</span>
              )}
            </span>
            {it.endContent && <span className="shrink-0 text-muted">{it.endContent}</span>}
            {sel && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}
