"use client";
import { useMemo, useState } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Tree } from "../tree/tree";
import { buildIndex } from "../tree/tree-core";
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
  const selectedArr = multiple ? (current as string[]) : current ? [current as string] : [];
  const hasValue = selectedArr.length > 0;

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
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
        <span className="flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180">
          <ChevronDownIcon />
        </span>
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <BasePopover.Popup
            className={cn(
              "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-2 text-foreground shadow-xl outline-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
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
