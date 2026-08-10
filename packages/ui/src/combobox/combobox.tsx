"use client";
import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cva } from "class-variance-authority";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  ComboboxChipProps,
  ComboboxChipsProps,
  ComboboxContentProps,
  ComboboxInputProps,
  ComboboxItemData,
  ComboboxItemProps,
  ComboboxProps,
  ComboboxTriggerProps,
} from "./combobox.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 驱动 Base UI 原生过渡（同 Select/Dialog）。
// 用 transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 在过渡生命周期会往内联
// style 注入 transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
// 简写对简写同属性覆盖，无混用 → 警告消除。属性写进简写里，故 className 不再需要 transition-[…] 类。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// 锚点 context：可见字段(内联外壳 span / 图4 Trigger 按钮)把自身 ref 注册进来，
// 供 ComboboxContent 的 Positioner anchor=，确保浮层锚到「整个可见字段」而非裸 <input>。
// 不做这步时 Base UI 默认锚到 Combobox.Input(裸 input)，它被外壳的 padding+图标内缩，
// 导致浮层比字段窄、左缩进、且 sideOffset 从 input 底边起算会压住外壳底边(遮挡)。
// 导出给同库内复用搜索皮肤的组件（如 Select 的 searchable 态）注册自己的可见字段为锚点；
// 不进 packages/ui/src/index.ts，属库内部约定，对外 API 无变化。
export const ComboboxAnchorContext = createContext<RefObject<HTMLElement | null> | null>(null);
const AnchorContext = ComboboxAnchorContext;
const VirtualizedContext = createContext(false);
const VirtualizedItemIndexContext = createContext<number | undefined>(undefined);
const VIRTUALIZE_THRESHOLD = 100;

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.5 8.5l3 3 6-7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

// Trigger 外壳：复用 Select.Trigger 气质（button 自身 focus-visible）；图4 范式的可见字段。
export const comboboxTriggerVariants = cva(
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

export function Combobox<Multiple extends boolean = false>({
  children,
  ...props
}: ComboboxProps<Multiple>) {
  const anchorRef = useRef<HTMLElement>(null);
  const candidateItems = props.items;
  const flatItemCount =
    Array.isArray(candidateItems) &&
    candidateItems.every(
      (item) => item != null && typeof item === "object" && "value" in item,
    )
      ? candidateItems.length
      : 0;
  const virtualized = props.virtualized ?? flatItemCount >= VIRTUALIZE_THRESHOLD;
  return (
    <AnchorContext.Provider value={anchorRef}>
      <VirtualizedContext.Provider value={virtualized}>
        {/* Root 是泛型函数组件，spread 泛型 props 推断不稳 → 在边界 as any，对外类型仍由 ComboboxProps 保证。 */}
        <BaseCombobox.Root
          {...(props as Record<string, unknown>)}
          virtualized={virtualized}
        >
          {children}
        </BaseCombobox.Root>
      </VirtualizedContext.Provider>
    </AnchorContext.Provider>
  );
}

function VirtualizedComboboxList({
  children,
  onListScroll,
}: {
  children: (item: ComboboxItemData, index: number) => ReactNode;
  onListScroll: ComboboxContentProps["onListScroll"];
}) {
  const items = BaseCombobox.useFilteredItems<ComboboxItemData>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,
    overscan: 6,
    initialRect: { width: 320, height: 384 },
    getItemKey: (index) => items[index]?.value ?? index,
  });

  return (
    <BaseCombobox.List
      ref={scrollRef}
      data-hulian-virtual-count={items.length}
      className="min-h-0 overflow-y-auto"
      onScroll={onListScroll}
    >
      <div
        role="presentation"
        style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              role="presentation"
              style={{
                left: 0,
                position: "absolute",
                top: 0,
                transform: `translateY(${virtualItem.start}px)`,
                width: "100%",
              }}
            >
              <VirtualizedItemIndexContext.Provider value={virtualItem.index}>
                {children(item, virtualItem.index)}
              </VirtualizedItemIndexContext.Provider>
            </div>
          );
        })}
      </div>
    </BaseCombobox.List>
  );
}

// 内联自动补全：输入框本身即可见字段，直接打字过滤。外壳 span 注册为浮层锚点。
export function ComboboxInput({
  size,
  placeholder,
  invalid,
  clearable,
  className,
}: ComboboxInputProps) {
  const anchorRef = useContext(AnchorContext);
  const copy = useComponentLocale().combobox ?? { clear: "清除", remove: "移除" };
  return (
    <span
      ref={anchorRef as RefObject<HTMLSpanElement> | null}
      className={cn(comboboxInputShellVariants({ size }), className)}
    >
      <BaseCombobox.Input
        placeholder={placeholder}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
      {clearable && (
        <BaseCombobox.Clear
          className="flex shrink-0 cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label={copy.clear}
        >
          <ClearIcon />
        </BaseCombobox.Clear>
      )}
      <BaseCombobox.Icon className="flex shrink-0 items-center text-muted-foreground">
        <ChevronDownIcon />
      </BaseCombobox.Icon>
    </span>
  );
}

// 图4 范式触发按钮：显示已选 label / placeholder + chevron；点击展开「弹层内搜索」式浮层。
// 按钮自身注册为浮层锚点 → 浮层与按钮等宽对齐。搭配 ComboboxContent 的 searchPlaceholder 使用。
export function ComboboxTrigger({ size, placeholder, invalid, className }: ComboboxTriggerProps) {
  const anchorRef = useContext(AnchorContext);
  return (
    <BaseCombobox.Trigger
      ref={anchorRef as RefObject<HTMLButtonElement> | null}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(comboboxTriggerVariants({ size }), className)}
    >
      <BaseCombobox.Value>
        {(value: ComboboxItemData | null) => (
          <span className={cn("truncate", value == null && "text-muted-foreground")}>
            {value?.label ?? placeholder}
          </span>
        )}
      </BaseCombobox.Value>
      <BaseCombobox.Icon className="flex shrink-0 items-center text-muted-foreground transition-transform data-[popup-open]:rotate-180">
        <ChevronDownIcon />
      </BaseCombobox.Icon>
    </BaseCombobox.Trigger>
  );
}

export function ComboboxContent({
  children,
  emptyMessage = "无匹配项",
  searchPlaceholder,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  onListScroll,
  footer,
  className,
}: ComboboxContentProps) {
  const anchorRef = useContext(AnchorContext);
  const virtualized = useContext(VirtualizedContext);
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner
        anchor={anchorRef ?? undefined}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50"
      >
        <BaseCombobox.Popup
          className={cn(
            "flex max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] flex-col rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none",
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {/* 弹层内搜索框(图4 范式)：图标 + Base UI Input；Base UI 自动在打开时聚焦并接管过滤。 */}
          {searchPlaceholder != null && (
            <span className="mb-1 flex h-9 shrink-0 items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] border border-border bg-surface px-2.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-bg">
              <span className="flex shrink-0 items-center text-muted-foreground">
                <SearchIcon />
              </span>
              <BaseCombobox.Input
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </span>
          )}
          {/* Base UI 的 Empty 始终渲染 <div role=status>(aria-live 播报用)，有匹配项时 children=null。
              empty:py-0 让它在为空时塌缩高度，避免弹层顶部留白；保留在 DOM 不破坏 a11y。 */}
          <BaseCombobox.Empty className="shrink-0 px-2 py-6 text-center text-sm text-muted-foreground empty:py-0">
            {emptyMessage}
          </BaseCombobox.Empty>
          {virtualized ? (
            <VirtualizedComboboxList onListScroll={onListScroll}>
              {children}
            </VirtualizedComboboxList>
          ) : (
            <BaseCombobox.List className="overflow-y-auto" onScroll={onListScroll}>
              {children}
            </BaseCombobox.List>
          )}
          {/* 页脚在 List 之外：不随列表滚动，故「加载中/共 N 条」始终可见（RemoteSelect 远程分页用）。 */}
          {footer != null && (
            <div className="mt-1 shrink-0 border-t border-hairline pt-1">{footer}</div>
          )}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export function ComboboxItem({ value, disabled, children, className }: ComboboxItemProps) {
  const virtualizedIndex = useContext(VirtualizedItemIndexContext);
  return (
    <BaseCombobox.Item
      value={value}
      index={virtualizedIndex}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
        "data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
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

// 多选可见字段：chips 容器（自身即外壳皮肤 + 浮层锚点），内放 ComboboxChip 列 + 输入框 + chevron。
// 高度随 chips 换行自适应（h-auto + min-h 保持与单选 md 等高）。
export function ComboboxChips({
  size,
  invalid,
  placeholder,
  className,
  children,
}: ComboboxChipsProps) {
  const anchorRef = useContext(AnchorContext);
  return (
    <BaseCombobox.Chips
      ref={anchorRef as RefObject<HTMLDivElement> | null}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(
        comboboxInputShellVariants({ size }),
        "h-auto min-h-10 flex-wrap gap-1.5 py-1.5",
        className,
      )}
    >
      {children}
      <BaseCombobox.Input
        placeholder={placeholder}
        className="min-w-16 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <BaseCombobox.Icon className="flex shrink-0 items-center text-muted-foreground">
        <ChevronDownIcon />
      </BaseCombobox.Icon>
    </BaseCombobox.Chips>
  );
}

// 单个已选 chip：pill + 删除 ×。删除由 Base UI 按 chip 在容器内的渲染序绑定 selectedValue[index]，
// 故消费者须按 value 顺序渲染 chip（CountrySelect 即如此）。
export function ComboboxChip({ children, className }: ComboboxChipProps) {
  const copy = useComponentLocale().combobox ?? { clear: "清除", remove: "移除" };
  return (
    <BaseCombobox.Chip
      className={cn(
        "inline-flex items-center gap-1 rounded-[calc(var(--radius)-0.25rem)] bg-subtle py-0.5 pl-2 pr-1 text-sm text-foreground",
        className,
      )}
    >
      {children}
      <BaseCombobox.ChipRemove
        aria-label={copy.remove}
        className="flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <ClearIcon />
      </BaseCombobox.ChipRemove>
    </BaseCombobox.Chip>
  );
}
