"use client";
import { useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { TabBarProps } from "./tab-bar.types";
import { useComponentLocale } from "../config/locale-context";

// 移动端底部导航栏（"use client"·零依赖）：items 驱动，受控/非受控；激活项 text-primary + aria-current=page，
// 角标(badge)/红点(dot) 浮于图标右上；safeArea 吃 env(safe-area-inset-bottom)（自定义属性 + var 引用，桌面退化为 0）。
export function TabBar({
  items,
  value,
  defaultValue,
  onChange,
  safeArea = true,
  fixed = true,
  "aria-label": ariaLabel,
  className,
}: TabBarProps) {
  const labels = useComponentLocale().tabBar ?? { navigation: "底部导航" };
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.key);
  const active = value ?? internal;

  const select = (key: string) => {
    if (value === undefined) setInternal(key);
    onChange?.(key);
  };

  const safeStyle: CSSProperties | undefined = safeArea
    ? ({
        "--hl-safe-bottom": "env(safe-area-inset-bottom, 0px)",
        paddingBottom: "var(--hl-safe-bottom)",
      } as CSSProperties & Record<string, string>)
    : undefined;

  return (
    <nav
      aria-label={ariaLabel ?? labels.navigation}
      style={safeStyle}
      className={cn(
        "z-40 flex w-full items-stretch border-t border-border bg-surface",
        fixed && "fixed inset-x-0 bottom-0",
        className,
      )}
    >
      {items.map((it) => {
        const on = it.key === active;
        return (
          <button
            key={it.key}
            type="button"
            aria-current={on ? "page" : undefined}
            disabled={it.disabled}
            onClick={() => !it.disabled && select(it.key)}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-xs outline-none transition-colors focus-visible:bg-surface-hover disabled:pointer-events-none disabled:opacity-40",
              on ? "text-primary" : "text-muted hover:text-foreground",
            )}
          >
            {(it.icon || it.activeIcon) && (
              <span className="relative flex text-xl leading-none">
                {on ? it.activeIcon ?? it.icon : it.icon}
                {it.badge != null ? (
                  <span className="absolute -right-2.5 -top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium leading-4 text-danger-foreground">
                    {it.badge}
                  </span>
                ) : it.dot ? (
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-danger" />
                ) : null}
              </span>
            )}
            <span className="max-w-full truncate leading-tight">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
