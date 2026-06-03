"use client";
import { Select as BaseSelect } from "@base-ui-components/react/select";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { SelectContentProps, SelectItemProps, SelectProps, SelectTriggerProps } from "./select.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 驱动 Base UI 原生过渡（同 Dialog/Tooltip/Popover）。
// 用 transition 简写(而非长写)：Base UI 在过渡生命周期会往内联 style 注入 transition 简写，与长写
// 混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。简写同属性覆盖无混用 → 警告消除。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Trigger 外壳：复用 Input 外壳气质；焦点环落 Trigger 自身（button 可聚焦 → self focus-visible）。
export const selectTriggerVariants = cva(
  [
    "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[popup-open]:border-ring",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-3.5 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// placeholder 经注入一个 value:null 的 items 项实现（rc.0 Select.Value 无 placeholder prop）。
// 无值时 Base UI 自动显示该 null 项 label（占位）；有值时显示选中项 label。Value 因此不写 children。
export function Select({ items, placeholder, children, ...props }: SelectProps) {
  const finalItems =
    placeholder != null && items != null ? [{ value: null, label: placeholder }, ...items] : items;
  return (
    <BaseSelect.Root items={finalItems} {...props}>
      {children}
    </BaseSelect.Root>
  );
}

export function SelectTrigger({ size, invalid, className }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      {/* 不写 children：有值显示选中 label，无值显示注入的 null 项 label（=placeholder）；data-placeholder 态置 muted。 */}
      <BaseSelect.Value className="truncate data-[placeholder]:text-muted" />
      <BaseSelect.Icon className="flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180">
        <ChevronDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: SelectContentProps) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignItemWithTrigger={false}
        className="z-50"
      >
        <BaseSelect.Popup
          className={cn(
            "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          <BaseSelect.List>{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ value, disabled, children, className }: SelectItemProps) {
  return (
    <BaseSelect.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
        "data-[highlighted]:bg-muted/15 data-[highlighted]:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      <BaseSelect.ItemText className="truncate">{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="absolute right-2 flex items-center text-foreground">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
