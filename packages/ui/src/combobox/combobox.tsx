"use client";
import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cva } from "class-variance-authority";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
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

/**
 * 「使用 “xxx”」那条创建项的印记。
 *
 * 它是被**塞进 `items`** 的一条真选项，而不是浮层里额外画的一行 —— 后者试过，走不通：
 * Base UI 在给了 `items` 时会把 `listRef.current.length` 截到过滤结果的条数
 * （`AriaCombobox.js:668`），于是多出来的那行键盘永远走不到，还会把最后一条真选项挤出导航范围。
 * 一条只能用鼠标点的选项比原来的缺口更糟，所以改成从 `items` 这一层进去：过滤、键盘导航、
 * 下标、`Empty` 的判空全都自动一致。
 *
 * 用 symbol 作印记，好让它不出现在 `Object.keys` / `JSON.stringify` 里 —— 消费方从
 * `onValueChange` 拿到的仍然只是个普通的 `{value,label}`。
 */
const CREATE_ENTRY = Symbol("hulian.combobox.create");

/** 浮层那侧需要知道的两件事：哪一条是创建项（好换皮肤），以及选中它时该通知谁。 */
interface ComboboxCreatable {
  onCreate?: (value: string) => void;
}
const CreatableContext = createContext<ComboboxCreatable | null>(null);

function isCreateEntry(item: unknown): item is ComboboxItemData {
  return item != null && typeof item === "object" && CREATE_ENTRY in item;
}

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

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  creatable = false,
  onCreate,
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

  // 创建项要显示「刚打了什么」，而输入串只在 Base UI 的 store 里，对外只有 onInputValueChange 这一个出口。
  // 于是在这里跟着记一份；受控（消费方自己传 inputValue）时以消费方那份为准，不与之争。
  const [ownQuery, setOwnQuery] = useState(() =>
    props.defaultInputValue == null ? "" : String(props.defaultInputValue),
  );
  const query = props.inputValue == null ? ownQuery : String(props.inputValue);

  if (creatable && !Array.isArray(candidateItems)) {
    warnOnce(
      "combobox-creatable-without-items",
      "[hulian] Combobox: creatable 需要 items —— 创建项是塞进 items 里的一条真选项（这样过滤、键盘导航、下标才一致）。选项写死在 children 里时这一档不生效。",
    );
  }

  // 两端空白去掉再用：Base UI 自己过滤时用的也是 trim 过的串（`AriaCombobox.js:194`），
  // 这里跟着一致，免得「打了个尾随空格，创建项就被自己的过滤器筛掉」。
  const createEntry = useMemo(() => {
    if (!creatable || !Array.isArray(candidateItems)) return null;
    const trimmed = query.trim();
    if (trimmed === "") return null;
    const lowered = trimmed.toLowerCase();
    // 比 value 也比 label：消费方看到的是 label（“北京市公安局”），value 常常是编号；
    // 只比一边，另一边完全相同时仍会冒出一条「使用 “…”」，选下去就是给已有条目造了个重复。
    const exists = flattenItems(candidateItems).some(
      (item) =>
        (typeof item.value === "string" && item.value.trim().toLowerCase() === lowered) ||
        (typeof item.label === "string" && item.label.trim().toLowerCase() === lowered),
    );
    if (exists) return null;
    return { value: trimmed, label: trimmed, [CREATE_ENTRY]: true } as ComboboxItemData;
  }, [creatable, candidateItems, query]);

  // 摆在最前：创建项是「候选里没有才出现」的那条，读起来该在最上面，而不是翻到底才看见。
  const items = useMemo(
    () =>
      createEntry && Array.isArray(candidateItems)
        ? [createEntry, ...candidateItems]
        : candidateItems,
    [createEntry, candidateItems],
  );

  const creatableValue = useMemo<ComboboxCreatable | null>(
    () => (creatable ? { onCreate } : null),
    [creatable, onCreate],
  );

  // creatable 档必须显式给一个 defaultInputValue，否则第一个字符会被吞掉：
  // Base UI 有一条「`items` 变了就把输入框拉回选中项的 label」的同步（`AriaCombobox.js:776`），
  // 它只在「输入串没被接管」时生效，而创建项一出现 `items` 的 identity 就变了 —— 第一次按键那一帧
  // 「查询已变」的标志位还是旧值，于是刚打的那个字被抹掉。给了 defaultInputValue 即算接管，那条同步
  // 整条跳过。默认值取 Base UI 原本会推出来的那个（单选时是选中项的 label），免得挂载时输入框空着。
  const initialInputValue = useRef<string | undefined>(undefined);
  if (initialInputValue.current === undefined) {
    const selected = (props.value ?? props.defaultValue) as ComboboxItemData | undefined;
    initialInputValue.current =
      props.defaultInputValue != null
        ? String(props.defaultInputValue)
        : !props.multiple && selected != null && typeof selected.label === "string"
          ? selected.label
          : "";
  }

  // 不开 creatable 就一个字段都不改：Root 收到的仍然是原样的 props（含消费方自己的 onInputValueChange）。
  const rootProps = creatable
    ? {
        ...props,
        items,
        defaultInputValue: initialInputValue.current,
        onInputValueChange: (next: string, details: unknown) => {
          setOwnQuery(next);
          (props.onInputValueChange as ((v: string, d: unknown) => void) | undefined)?.(
            next,
            details,
          );
        },
      }
    : props;

  return (
    <AnchorContext.Provider value={anchorRef}>
      <VirtualizedContext.Provider value={virtualized}>
        <CreatableContext.Provider value={creatableValue}>
          {/* Root 是泛型函数组件，spread 泛型 props 推断不稳 → 在边界 as any，对外类型仍由 ComboboxProps 保证。 */}
          <BaseCombobox.Root
            {...(rootProps as Record<string, unknown>)}
            virtualized={virtualized}
          >
            {children}
          </BaseCombobox.Root>
        </CreatableContext.Provider>
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
// 剩余原生属性给内层 <input> 而不是外壳：role="combobox"、可聚焦性、表单归属都在内层，
// aria-label / id / name / onBlur 落到外壳 <span> 上等于没传（#160）。与 Input/ColorField 同一处方。
// rest 展开在最前：组件自己的 data-invalid / 皮肤类名不可被外部顶掉（见 docs/consuming.md 第 7 节）。
export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  function ComboboxInput(
    { size, invalid, clearable, prefix, showChevron = true, className, ...props },
    ref,
  ) {
    const anchorRef = useContext(AnchorContext);
    const copy = useComponentLocale().combobox ?? { clear: "清除", remove: "移除" };
    return (
      <span
        ref={anchorRef as RefObject<HTMLSpanElement> | null}
        className={cn(comboboxInputShellVariants({ size }), className)}
      >
        {prefix != null && <span className="flex shrink-0 items-center text-muted-foreground">{prefix}</span>}
        <BaseCombobox.Input
          ref={ref}
          {...props}
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
        {showChevron && (
          <BaseCombobox.Icon className="flex shrink-0 items-center text-muted-foreground">
            <ChevronDownIcon />
          </BaseCombobox.Icon>
        )}
      </span>
    );
  },
);

// 图4 范式触发按钮：显示已选 label / placeholder + chevron；点击展开「弹层内搜索」式浮层。
// 按钮自身注册为浮层锚点 → 浮层与按钮等宽对齐。搭配 ComboboxContent 的 searchPlaceholder 使用。
// 剩余原生属性直接落到按钮自身（它就是根节点，无外壳）；rest 在最前，皮肤与 data-invalid 赢。
export function ComboboxTrigger({
  size,
  placeholder,
  invalid,
  className,
  ...props
}: ComboboxTriggerProps) {
  const anchorRef = useContext(AnchorContext);
  return (
    <BaseCombobox.Trigger
      ref={anchorRef as RefObject<HTMLButtonElement> | null}
      {...props}
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

// 选项行的皮肤：创建项与 ComboboxItem 共用，好让「新建这一条」读起来和别的选项是同一类东西。
const comboboxItemClass = [
  "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
  "data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
];

/** 判重用：把分组结构（`{ value, items }`）摊平成一层选项，非选项形状的条目直接丢掉。 */
function flattenItems(items: readonly unknown[]): ComboboxItemData[] {
  const flat: ComboboxItemData[] = [];
  for (const entry of items) {
    if (entry == null || typeof entry !== "object") continue;
    const nested = (entry as { items?: unknown }).items;
    if (Array.isArray(nested)) flat.push(...flattenItems(nested));
    else if ("value" in entry) flat.push(entry as ComboboxItemData);
  }
  return flat;
}

/**
 * 「使用 “xxx”」那一行。它接的是 `items` 里那条带印记的选项，所以键盘上下键、highlight、
 * Enter 选中、下标全走 Base UI 原本那套 —— 这里只换一身皮肤（加号 + 灰字），不改机制。
 * 点选时除了照常提交值，再发一次 `onCreate`，那是给「去落库 / 追加进 items」用的。
 */
function ComboboxCreateItem({ item }: { item: ComboboxItemData }) {
  const virtualizedIndex = useContext(VirtualizedItemIndexContext);
  const ctx = useContext(CreatableContext);
  const copy = useComponentLocale().combobox;
  const createLabel = copy?.create ?? ((value: string) => `使用 “${value}”`);
  return (
    <BaseCombobox.Item
      data-hulian-create=""
      value={item}
      index={virtualizedIndex}
      onClick={() => ctx?.onCreate?.(item.value)}
      className={cn(comboboxItemClass, "text-muted-foreground")}
    >
      <span className="flex shrink-0 items-center">
        <PlusIcon />
      </span>
      <span className="truncate text-foreground">{createLabel(item.value)}</span>
    </BaseCombobox.Item>
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
  header,
  footer,
  className,
}: ComboboxContentProps) {
  const anchorRef = useContext(AnchorContext);
  const virtualized = useContext(VirtualizedContext);
  const creatable = useContext(CreatableContext) != null;
  // 创建项混在 items 里一起过来，所以拦在渲染函数这一层换皮肤 —— 消费方的 render fn 不必知道
  // 它的存在（知道了就等于把「怎么画创建项」又推回业务侧，那正是这条缺口要消灭的）。
  const renderItem: ComboboxContentProps["children"] = creatable
    ? (item, index) =>
        isCreateEntry(item) ? (
          <ComboboxCreateItem key="hulian-create" item={item} />
        ) : (
          children(item, index)
        )
    : children;
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
          {/* 表头在 List 之外、Empty 之上：它是「常驻说明」，零结果时也该看得见（那正是最需要它的时候）。 */}
          {header != null && (
            <div className="mb-1 shrink-0 border-b border-hairline pb-1">{header}</div>
          )}
          {/* Base UI 的 Empty 始终渲染 <div role=status>(aria-live 播报用)，有匹配项时 children=null。
              empty:py-0 让它在为空时塌缩高度，避免弹层顶部留白；保留在 DOM 不破坏 a11y。
              creatable 档下「零结果」自然不会发生（创建项本身就是一条候选），故这里无需特判。 */}
          <BaseCombobox.Empty className="shrink-0 px-2 py-6 text-center text-sm text-muted-foreground empty:py-0">
            {emptyMessage}
          </BaseCombobox.Empty>
          {virtualized ? (
            <VirtualizedComboboxList onListScroll={onListScroll}>
              {renderItem}
            </VirtualizedComboboxList>
          ) : (
            <BaseCombobox.List className="overflow-y-auto" onScroll={onListScroll}>
              {renderItem}
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
      className={cn(comboboxItemClass, className)}
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
// 剩余原生属性落到内层 <input>（与 ComboboxInput 同口径）：chips 容器是 role="toolbar" 的皮肤壳，
// aria-label / id / name / onBlur 挂上去命名不到 role="combobox" 那个节点。容器钩子走 className。
export function ComboboxChips({
  size,
  invalid,
  placeholder,
  className,
  children,
  ...props
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
        {...props}
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
