"use client";
import { Combobox as BaseCombobox } from "@base-ui-components/react/combobox";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  ComboboxContentProps,
  ComboboxInputProps,
  ComboboxItemProps,
  ComboboxProps,
} from "./combobox.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（同 Select/Dialog）。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
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

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 输入外壳：抄 Input 外壳气质；焦点环落外壳 focus-within（内层 input 自身受焦点，异于 Select.Trigger 的 button focus-visible）。
export const comboboxInputShellVariants = cva(
  [
    "inline-flex w-full items-center gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
    "has-[[data-invalid]]:border-danger has-[[data-invalid]]:focus-within:ring-danger",
    "has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none",
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

export function Combobox({ children, ...props }: ComboboxProps) {
  return <BaseCombobox.Root {...props}>{children}</BaseCombobox.Root>;
}

export function ComboboxInput({ size, placeholder, invalid, clearable, className }: ComboboxInputProps) {
  return (
    <span className={cn(comboboxInputShellVariants({ size }), className)}>
      <BaseCombobox.Input
        placeholder={placeholder}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
      />
      {clearable && (
        <BaseCombobox.Clear
          className="flex shrink-0 cursor-pointer items-center text-muted transition-colors hover:text-foreground"
          aria-label="清除"
        >
          <ClearIcon />
        </BaseCombobox.Clear>
      )}
      <BaseCombobox.Icon className="flex shrink-0 items-center text-muted">
        <ChevronDownIcon />
      </BaseCombobox.Icon>
    </span>
  );
}

export function ComboboxContent({
  children,
  emptyMessage = "无匹配项",
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: ComboboxContentProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseCombobox.Popup
          className={cn(
            "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          <BaseCombobox.Empty className="px-2 py-6 text-center text-sm text-muted">
            {emptyMessage}
          </BaseCombobox.Empty>
          <BaseCombobox.List>{children}</BaseCombobox.List>
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export function ComboboxItem({ value, disabled, children, className }: ComboboxItemProps) {
  return (
    <BaseCombobox.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
        "data-[highlighted]:bg-muted/15 data-[highlighted]:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
    >
      {children}
      <BaseCombobox.ItemIndicator className="absolute right-2 flex items-center text-foreground">
        <CheckIcon />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}
