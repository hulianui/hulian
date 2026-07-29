"use client";
import { useMemo, useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Tree } from "../tree/tree";
import { buildIndex, normalizeCheckedToLeaves } from "../tree/tree-core";
import type { TreeSelectProps } from "./tree-select.types";

const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const triggerVariants = cva(
  [
    "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[popup-open]:border-ring",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: { sm: "min-h-8 px-2.5 text-sm", md: "min-h-10 px-3 text-sm", lg: "min-h-12 px-3.5 text-base" },
    },
    defaultVariants: { size: "md" },
  },
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 与 Select 的清除图标同形（14px 叉），保证同一筛选栏里两个组件的清除入口视觉一致。
const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function TreeSelect({
  nodes,
  value,
  defaultValue,
  onChange,
  multiple = false,
  placeholder = "请选择",
  disabled,
  invalid,
  size = "md",
  clearable = false,
  searchable = false,
  showLine = false,
  className,
}: TreeSelectProps) {
  const index = useMemo(() => buildIndex(nodes), [nodes]);
  const [open, setOpen] = useState(false);

  const [internal, setInternal] = useState<string | string[]>(defaultValue ?? (multiple ? [] : ""));
  const current = value ?? internal;
  const setValue = (next: string | string[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const labelOf = (key: string) => index.nodeMap.get(key)?.label ?? key;
  // 多选 chip 与 Tree 勾选态同源：把外部可能塞入的父级 key 归一为叶集（与 Tree 内部
  // normalizeCheckedToLeaves 一致），保证 chip 显示与树勾选不脱节；纯叶集归一为自身（幂等）。
  const selectedArr = multiple
    ? Array.from(normalizeCheckedToLeaves(current as string[], index))
    : current
      ? [current as string]
      : [];
  const hasValue = selectedArr.length > 0;
  // 清除按钮只在「开了 clearable + 当前有值 + 未禁用」时进 DOM；可见性再由 hover/focus 控制（同 Select）。
  const showClear = Boolean(clearable && hasValue && !disabled);
  // 未选态与非受控初值保持同一形状：单选是空串，多选是空数组——别回传 null/undefined，
  // 否则 `value ?? internal` 会退回内部旧值，受控清除会「弹回」。
  const handleClear = () => setValue(multiple ? [] : "");

  const trigger = (
    <BasePopover.Trigger
      disabled={disabled}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(triggerVariants({ size }), "py-1.5", className)}
    >
      <span
        className={cn(
          "flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left",
          !hasValue && "text-muted",
        )}
      >
        {!hasValue ? (
          placeholder
        ) : multiple ? (
          selectedArr.map((k) => (
            <span
              key={k}
              className="inline-flex items-center rounded bg-surface-hover px-1.5 py-0.5 text-xs text-foreground"
            >
              {labelOf(k)}
            </span>
          ))
        ) : (
          <span className="truncate">{labelOf(selectedArr[0])}</span>
        )}
      </span>
      <span
        className={cn(
          "flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180",
          // 清除按钮浮出时把箭头让位（二者共用右侧同一格，同 Select）。
          showClear && "group-hover:opacity-0 group-focus-within:opacity-0",
        )}
      >
        <ChevronDownIcon />
      </span>
    </BasePopover.Trigger>
  );

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
      {/* 未开 clearable 时不加包裹层，DOM 与旧版逐字节一致，既有布局/选择器不受影响。 */}
      {!clearable ? (
        trigger
      ) : (
        // 清除按钮做成 Trigger 的兄弟而非子节点——button 内嵌 button 是非法 HTML，
        // 且嵌套后点击会冒泡到 Trigger 把浮层打开。绝对定位盖在箭头位置上。
        <span className="group relative block w-full">
          {trigger}
          {showClear && (
            <button
              type="button"
              aria-label="清除"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className={cn(
                "absolute top-1/2 hidden -translate-y-1/2 cursor-pointer items-center text-muted transition-colors",
                "hover:text-foreground focus-visible:outline-none focus-visible:text-foreground",
                "group-hover:flex group-focus-within:flex",
                size === "lg" ? "right-3.5" : size === "sm" ? "right-2.5" : "right-3",
              )}
            >
              <ClearIcon />
            </button>
          )}
        </span>
      )}
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <BasePopover.Popup
            className={cn(
              "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-2 text-foreground shadow-xl outline-none",
              "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            {multiple ? (
              <Tree
                nodes={nodes}
                checkable
                searchable={searchable}
                showLine={showLine}
                checkedKeys={current as string[]}
                onCheck={(info) =>
                  setValue(
                    info.checkedKeys.filter((k) => (index.childrenKeys.get(k) ?? []).length === 0),
                  )
                }
              />
            ) : (
              <Tree
                nodes={nodes}
                searchable={searchable}
                showLine={showLine}
                selectedKeys={current ? [current as string] : []}
                onSelect={(keys) => {
                  setValue(keys[0]);
                  setOpen(false);
                }}
              />
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
