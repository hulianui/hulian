"use client";
import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { cva } from "class-variance-authority";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import {
  Combobox,
  ComboboxAnchorContext,
  ComboboxContent,
  ComboboxItem,
} from "../combobox/combobox";
import type { ComboboxItemData } from "../combobox/combobox.types";
import { Spinner } from "../spinner/spinner";
import { overlayTransitions } from "../motion";
import type {
  SelectContentProps,
  SelectGroupLabelProps,
  SelectGroupProps,
  SelectItemProps,
  SelectProps,
  SelectTriggerProps,
} from "./select.types";
import { orderSelectedFirst } from "./select-order";

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
        // 与 Input / Textarea 的 xs 等高：同一行里三种控件必须对齐，缺一档就整行错位（#187）。
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-3.5 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// 多选 Trigger 需要 items/placeholder 才能把 string[] 解析成 label 列表——Base UI 的 store
// 不对外暴露，用瑚琏侧 context 把 Select 上的元信息带给 SelectTrigger / SelectContent / SelectItem。
interface SelectMeta {
  items?: SelectProps["items"];
  placeholder?: ReactNode;
  multiple?: boolean;
  selectedFirst?: boolean;
  currentValue?: string | string[] | null;
  clearable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  loadingNode?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  searchItemByValue?: ReadonlyMap<string, ComboboxItemData>;
  /** 当前是否有选中值（单选非空、多选数组非空）——决定清除按钮是否渲染。 */
  hasValue?: boolean;
  onClear?: () => void;
  onRemoveValue?: (value: string, eventDetails?: unknown) => void;
}
const SelectMetaContext = createContext<SelectMeta>({});

const EMPTY_ITEMS: ReadonlyArray<ComboboxItemData> = [];
const EMPTY_SELECTED_VALUES: readonly string[] = [];
const chipLayerClass =
  "absolute inset-y-0 left-0 right-8 flex items-center gap-1 overflow-hidden px-3";
const chipVisualClass =
  "inline-flex min-w-0 shrink-0 items-center gap-1 rounded bg-surface-raised px-1.5 py-0.5 text-xs";
const chipLabelClass = "max-w-28 truncate";

function isChipRemoveControl(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-hulian-select-chip-remove]") != null;
}

// Combobox 是泛型函数组件，spread 动态构造的 props 推断不稳 → 在边界放宽签名
// （同 combobox.tsx 内对 BaseCombobox.Root 的处理），对外类型仍由 SelectProps 保证。
const SearchRoot = Combobox as unknown as (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactElement;

const DEFAULT_SELECT_COPY = {
  search: "搜索",
  empty: "无匹配项",
  loading: "加载中",
  separator: "、",
  clear: "清除",
  remove: (label: string) => `移除 ${label}`,
};

// placeholder 经注入一个 value:null 的 items 项实现（rc.0 Select.Value 无 placeholder prop）。
// 无值时 Base UI 自动显示该 null 项 label（占位）；有值时显示选中项 label。Value 因此不写 children。
// 多选值是数组，命不中 null 项 → 不注入，占位改由 SelectTrigger 的函数式 Value 渲染。
export function Select({
  items,
  placeholder,
  multiple,
  selectedFirst,
  clearable,
  searchable,
  searchPlaceholder,
  emptyMessage,
  virtualized,
  loading,
  loadingText,
  disabled,
  readOnly,
  value: valueProp,
  defaultValue,
  onValueChange,
  onOpenChange,
  children,
  ...props
}: SelectProps) {
  const copy = useComponentLocale().select ?? DEFAULT_SELECT_COPY;
  const resolvedSearchPlaceholder = searchPlaceholder ?? copy.search;
  const resolvedEmptyMessage = emptyMessage ?? copy.empty;
  const resolvedLoadingText = loadingText ?? copy.loading;
  // 值镜像：clearable 需要程序化置空，multiple 需要 chips 单项删除；Base UI 的 store 不对外暴露。
  // 受控时以 valueProp 为准；非受控时镜像跟着 onValueChange 走。两种皮肤都把 current
  // 交给 Base UI Root，保证切换皮肤、触发器和程序化删除使用同一份值。
  const uncontrolled = valueProp === undefined;
  const [mirror, setMirror] = useState<string | string[] | null>(
    () => defaultValue ?? (multiple ? [] : null),
  );
  const current = uncontrolled ? mirror : valueProp;
  const selectedValues = useMemo<readonly string[]>(
    () => (multiple && Array.isArray(current) ? current : EMPTY_SELECTED_VALUES),
    [current, multiple],
  );

  const handleValueChange = useCallback(
    (next: unknown, eventDetails?: unknown) => {
      // loading 是展示态，不许改值（#283）：加载期间浮层不渲染选项，Base UI Select 的 Positioner 会把
      // 「已卸载」的选中项当作被移除，主动回调剔除后的值（多选回 []、单选回 null）——受控消费方一接就把
      // 已选清空了。此时用户根本点不到任何选项，来的值变更只可能是这类内部剔除 → 吞掉，并 cancel()
      // 让 Base UI 自己的内部状态也别落值（非受控档同样保住）。
      if (loading) {
        (eventDetails as { cancel?: () => void } | undefined)?.cancel?.();
        return;
      }
      onValueChange?.(next, eventDetails);
      // Base UI invokes the consumer before committing its own uncontrolled state. Mirror that
      // contract: a consumer's eventDetails.cancel() must leave both representations unchanged.
      if ((eventDetails as { isCanceled?: boolean } | undefined)?.isCanceled) return;
      if (uncontrolled) {
        setMirror(next as string | string[] | null);
      }
    },
    [uncontrolled, loading, onValueChange],
  );

  const hasValue = multiple ? selectedValues.length > 0 : current != null && current !== "";

  const handleClear = useCallback(() => {
    handleValueChange(multiple ? [] : null);
  }, [handleValueChange, multiple]);
  const handleRemoveValue = useCallback(
    (value: string, eventDetails?: unknown) => {
      if (!multiple || disabled || readOnly || !Array.isArray(current)) return;
      handleValueChange(
        current.filter((item) => item !== value),
        eventDetails,
      );
    },
    [current, disabled, handleValueChange, multiple, readOnly],
  );
  const handleOpenChange = useCallback(
    (...[nextOpen, eventDetails]: Parameters<NonNullable<SelectProps["onOpenChange"]>>) => {
      const target = eventDetails.event.target;
      const relatedTarget =
        "relatedTarget" in eventDetails.event
          ? (eventDetails.event as FocusEvent).relatedTarget
          : null;
      // Remove controls intentionally live next to (not inside) the real trigger to avoid nested
      // buttons. A pointer press is outside the popup, and the subsequent focus-out targets the
      // same marked control; cancel both without changing all other outside-click semantics.
      if (
        !nextOpen &&
        ((eventDetails.reason === "outside-press" && isChipRemoveControl(target)) ||
          (eventDetails.reason === "focus-out" && isChipRemoveControl(relatedTarget)))
      ) {
        eventDetails.cancel();
      }
      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange],
  );

  // 加载态占位：两种皮肤共用（标准皮肤放进 List，搜索皮肤复用 Combobox 的空态槽位）。
  const loadingNode = (
    <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
      <Spinner size="sm" tone="current" />
      {resolvedLoadingText}
    </div>
  );

  // 搜索皮肤的候选：剔除 value 为 null 的占位项（Combobox 无 null 占位机制，占位走 Trigger 自身）。
  const searchItems = useMemo<ReadonlyArray<ComboboxItemData>>(() => {
    if (!searchable || loading || items == null) return EMPTY_ITEMS;
    const mapped = items
      .filter((it): it is { value: string; label: ReactNode } => it.value != null)
      .map((it) => ({ value: it.value, label: it.label }));
    return selectedFirst && multiple ? orderSelectedFirst(mapped, selectedValues) : mapped;
  }, [searchable, loading, items, selectedFirst, multiple, selectedValues]);
  const searchItemByValue = useMemo(
    () => new Map(searchItems.map((item) => [item.value, item])),
    [searchItems],
  );

  const meta = useMemo<SelectMeta>(
    () => ({
      items,
      placeholder,
      multiple,
      selectedFirst,
      currentValue: current,
      clearable,
      searchable,
      searchPlaceholder: resolvedSearchPlaceholder,
      emptyMessage: loading ? loadingNode : resolvedEmptyMessage,
      loadingNode: loading ? loadingNode : undefined,
      disabled,
      readOnly,
      searchItemByValue,
      hasValue,
      onClear: handleClear,
      onRemoveValue: handleRemoveValue,
    }),
    // loadingNode 每渲染新建，但只在 loading 时进入 meta，且它只作展示节点 → 用 loading/loadingText 做依赖即可。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      items,
      placeholder,
      multiple,
      selectedFirst,
      current,
      clearable,
      searchable,
      resolvedSearchPlaceholder,
      resolvedEmptyMessage,
      loading,
      resolvedLoadingText,
      disabled,
      readOnly,
      searchItemByValue,
      hasValue,
      handleClear,
      handleRemoveValue,
    ],
  );

  const standardContentChildren = useMemo(() => findSelectContentChildren(children), [children]);
  const standardItemValueOrder = useMemo(() => {
    if (!multiple || !selectedFirst || standardContentChildren == null)
      return selectedValues;
    const values: string[] = [];
    orderStandardChildren(standardContentChildren, selectedValues, values);
    return values;
  }, [multiple, selectedFirst, standardContentChildren, selectedValues]);

  if (searchable) {
    // 搜索/过滤全部交给 Base UI Combobox：瑚琏只做 string ⇄ {value,label} 的值形状搬运。
    const toItemData = (v: string): ComboboxItemData =>
      searchItemByValue.get(v) ?? { value: v, label: v };
    const searchValue = multiple
      ? (Array.isArray(current) ? current : []).map(toItemData)
      : typeof current === "string" && current !== ""
      ? toItemData(current)
      : null;
    const rootProps: Record<string, unknown> = {
      ...props,
      items: searchItems,
      multiple,
      disabled,
      readOnly,
      // 不传时交给 Combobox 按候选数自动决定（≥100 开）；显式传 false 可关掉（自定义行高时用）。
      ...(virtualized !== undefined && { virtualized }),
      value: searchValue,
      onOpenChange: handleOpenChange,
      onValueChange: (next: unknown, eventDetails?: unknown) =>
        handleValueChange(
          multiple
            ? ((next ?? []) as ComboboxItemData[]).map((it) => it.value)
            : (next as ComboboxItemData | null)?.value ?? null,
          eventDetails,
        ),
      // 值对象每渲染重建 → 默认 Object.is 比较会失配，按 value 字段比。
      isItemEqualToValue: (a: ComboboxItemData | null, b: ComboboxItemData | null) =>
        a?.value === b?.value,
      // label 允许是 ReactNode；过滤/键盘检索只认字符串，非字符串 label 退回 value 参与匹配。
      itemToStringLabel: (item: ComboboxItemData | null) =>
        typeof item?.label === "string" ? item.label : item?.value ?? "",
    };
    return (
      <SelectMetaContext.Provider value={meta}>
        <SearchRoot {...rootProps}>{children}</SearchRoot>
      </SelectMetaContext.Provider>
    );
  }

  const finalItems =
    multiple && selectedFirst && items != null
      ? orderSelectedFirst(items, standardItemValueOrder)
      : !multiple && placeholder != null && items != null
      ? [{ value: null, label: placeholder }, ...items]
      : items;
  const rootProps: Record<string, unknown> = {
    ...props,
    items: finalItems,
    multiple,
    disabled,
    readOnly,
    onOpenChange: handleOpenChange,
    onValueChange: handleValueChange,
    value: current,
  };
  return (
    <SelectMetaContext.Provider value={meta}>
      <BaseSelect.Root {...rootProps}>{children}</BaseSelect.Root>
    </SelectMetaContext.Provider>
  );
}

// 多选 Trigger 文案：前 maxDisplay 个 label 顿号平铺，超出折叠 +N；空数组回落 placeholder
// （data-placeholder 由 Base UI 按 hasSelectedValue 置空数组时照常落，muted 皮肤复用）。
function renderMultipleValue(
  value: unknown,
  items: SelectProps["items"],
  placeholder: ReactNode,
  maxDisplay: number,
  separator: string,
) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  if (values.length === 0) return placeholder ?? null;
  const shown = values.slice(0, maxDisplay).map((v) => {
    // 搜索皮肤下 Combobox 的值是 {value,label} 对象，标准皮肤下是原始 string。
    const raw =
      v != null && typeof v === "object" && "value" in v ? (v as ComboboxItemData).value : v;
    return items?.find((it) => it.value === raw)?.label ?? String(raw);
  });
  const extra = values.length - shown.length;
  return (
    <>
      {shown.map((label, i) => (
        <Fragment key={i}>
          {i > 0 && separator}
          {label}
        </Fragment>
      ))}
      {extra > 0 && <span className="text-muted-foreground"> +{extra}</span>}
    </>
  );
}

interface SelectChipModel {
  value: string;
  label: ReactNode;
  accessibleLabel: string;
}

function getChipModels(
  value: SelectMeta["currentValue"],
  items: SelectProps["items"],
): SelectChipModel[] {
  const values = Array.isArray(value) ? value : EMPTY_SELECTED_VALUES;
  return values.map((raw) => {
    const label = items?.find((item) => item.value === raw)?.label ?? raw;
    return {
      value: raw,
      label,
      accessibleLabel: typeof label === "string" ? label : raw,
    };
  });
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value) =>
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref) (ref as { current: T | null }).current = value;
    });
}

export function SelectTrigger({
  size,
  invalid,
  maxDisplay = 2,
  display = "text",
  removable,
  className,
  ref: forwardedRef,
  ...triggerProps
}: SelectTriggerProps) {
  const copy = useComponentLocale().select ?? DEFAULT_SELECT_COPY;
  const {
    items,
    placeholder,
    multiple,
    searchable,
    clearable,
    loadingNode,
    disabled,
    readOnly,
    currentValue,
    hasValue,
    onClear,
    onRemoveValue,
  } = useContext(SelectMetaContext);
  const anchorRef = useContext(ComboboxAnchorContext);
  const chipAccessibleValueId = useId();
  const observedTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [hasExternalLabel, setHasExternalLabel] = useState(false);
  const observeTrigger = useCallback((element: HTMLButtonElement | null) => {
    observedTriggerRef.current = element;
  }, []);
  const triggerRef = useMemo(
    () => mergeRefs(forwardedRef, observeTrigger),
    [forwardedRef, observeTrigger],
  );
  const searchableRef = useMemo(
    () => mergeRefs(anchorRef as Ref<HTMLButtonElement> | undefined, forwardedRef, observeTrigger),
    [anchorRef, forwardedRef, observeTrigger],
  );
  // 清除按钮只在「开了 clearable + 当前有值 + 非加载态」时进 DOM；可见性再由 hover/focus 控制。
  const showClear = clearable && hasValue && !loadingNode;
  const removeLabel = copy.remove ?? ((label: string) => `${copy.clear}: ${label}`);
  const chipModels = useMemo(() => getChipModels(currentValue, items), [currentValue, items]);
  const visibleChips = chipModels.slice(0, Math.max(0, maxDisplay));
  const extra = chipModels.length - visibleChips.length;
  const hasChipPlaceholder = chipModels.length === 0 && placeholder != null;
  const accessibleValue = chipModels.map((chip) => chip.accessibleLabel).join(copy.separator);
  // Keep the actual ReactNode in the real Value instead of trying to derive text from element
  // props: function components only produce their text at render. When empty, this one Value node
  // is both the visible placeholder and the stable fallback naming target; never mount a visual copy.
  const chipAccessibleContent = chipModels.length > 0 ? accessibleValue : placeholder;
  const hasConsumerAccessibleName =
    triggerProps["aria-label"] != null || triggerProps["aria-labelledby"] != null;
  const shouldLinkChipPlaceholder =
    multiple &&
    display === "chips" &&
    chipModels.length === 0 &&
    placeholder != null &&
    !hasConsumerAccessibleName &&
    !hasExternalLabel;
  useEffect(() => {
    const triggerElement = observedTriggerRef.current;
    if (triggerElement == null) return;

    const labelledBy = triggerElement.getAttribute("aria-labelledby");
    const hasLinkedExternalLabel = labelledBy
      ?.split(/\s+/)
      .some((id) => id.length > 0 && id !== chipAccessibleValueId);
    const hasNativeLabel =
      (triggerElement.labels?.length ?? 0) > 0 || triggerElement.closest("label") != null;
    const nextHasExternalLabel = hasLinkedExternalLabel || hasNativeLabel;
    setHasExternalLabel((current) =>
      current === nextHasExternalLabel ? current : nextHasExternalLabel,
    );
  });
  const chipAriaLabel =
    multiple && display === "chips" && chipModels.length > 0 && !hasConsumerAccessibleName
      ? accessibleValue
      : undefined;
  const chipTriggerA11y = shouldLinkChipPlaceholder
    ? { "aria-labelledby": chipAccessibleValueId }
    : chipAriaLabel !== undefined
    ? { "aria-label": chipAriaLabel }
    : undefined;
  const chipValue = (
    <span
      {...(hasChipPlaceholder && {
        id: chipAccessibleValueId,
        "data-slot": "select-chip-placeholder",
      })}
      className={hasChipPlaceholder ? "min-w-0 truncate text-muted-foreground" : "sr-only"}
    >
      {chipAccessibleContent}
    </span>
  );

  const tail = loadingNode ? (
    <span className="flex shrink-0 items-center text-muted-foreground">
      <Spinner size="sm" tone="current" />
    </span>
  ) : null;
  const tailClassName = cn(
    "flex shrink-0 items-center text-muted-foreground transition-transform data-[popup-open]:rotate-180",
    // 清除按钮浮出时把箭头让位（二者共用右侧同一格，同 el-select 的 hover 互换）。
    showClear && "group-hover:opacity-0 group-focus-within:opacity-0",
  );

  const trigger = searchable ? (
    <BaseCombobox.Trigger
      {...triggerProps}
      ref={searchableRef}
      {...chipTriggerA11y}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      <BaseCombobox.Value>
        {(value: unknown) =>
          multiple ? (
            display === "chips" ? (
              chipValue
            ) : (
              <span className="truncate">
                {renderMultipleValue(value, items, placeholder, maxDisplay, copy.separator)}
              </span>
            )
          ) : (
            <span className={cn("truncate", value == null && "text-muted-foreground")}>
              {(value as ComboboxItemData | null)?.label ?? placeholder}
            </span>
          )
        }
      </BaseCombobox.Value>
      {tail ?? (
        <BaseCombobox.Icon className={tailClassName}>
          <ChevronDownIcon />
        </BaseCombobox.Icon>
      )}
    </BaseCombobox.Trigger>
  ) : (
    <BaseSelect.Trigger
      {...triggerProps}
      ref={triggerRef}
      {...chipTriggerA11y}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      {/* 单选不写 children：有值显示选中 label，无值显示注入的 null 项 label（=placeholder）；
          多选走函数式 children 平铺已选 label + 超出 +N。data-placeholder 态置 muted。 */}
      <BaseSelect.Value className="truncate data-[placeholder]:text-muted-foreground">
        {multiple
          ? display === "chips"
            ? () => chipValue
            : (value: unknown) =>
                renderMultipleValue(value, items, placeholder, maxDisplay, copy.separator)
          : undefined}
      </BaseSelect.Value>
      {tail ?? (
        <BaseSelect.Icon className={tailClassName}>
          <ChevronDownIcon />
        </BaseSelect.Icon>
      )}
    </BaseSelect.Trigger>
  );

  const clearAllButton = showClear ? (
    <button
      type="button"
      aria-label={copy.clear}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClear?.();
      }}
      className={cn(
        "absolute top-1/2 hidden -translate-y-1/2 cursor-pointer items-center text-muted-foreground transition-colors",
        "hover:text-foreground focus-visible:outline-none focus-visible:text-foreground",
        "group-hover:flex group-focus-within:flex",
        size === "lg" ? "right-3.5" : size === "sm" ? "right-2.5" : "right-3",
      )}
    >
      <ClearIcon />
    </button>
  ) : null;

  // 未开 clearable 的 text 分支保持旧版逐字节结构；chips 需要外层承载可交互同级节点。
  if (!clearable && !(multiple && display === "chips")) return trigger;

  return (
    <span data-hulian-select-trigger-wrapper="" className="group relative block w-full">
      {trigger}
      {multiple && display === "chips" && (
        <span
          data-slot="select-chip-layer"
          aria-hidden="true"
          className={cn("pointer-events-none", chipLayerClass)}
        >
          {visibleChips.map((chip) => (
            <span
              key={chip.value}
              data-slot="select-chip"
              className={cn("pointer-events-none", chipVisualClass)}
            >
              <span className={chipLabelClass}>{chip.label}</span>
            </span>
          ))}
          {extra > 0 && <span className="shrink-0 text-xs text-muted-foreground">+{extra}</span>}
        </span>
      )}
      {multiple && display === "chips" && removable && !disabled && !readOnly && !loadingNode && (
        <span
          data-hulian-select-chip-controls=""
          className={cn("pointer-events-none", chipLayerClass)}
        >
          {visibleChips.map((chip) => (
            <span
              key={chip.value}
              className="pointer-events-none inline-flex shrink-0 items-center"
            >
              <span className={cn("invisible px-1.5 py-0.5 text-xs", chipLabelClass)}>
                {chip.label}
              </span>
              <button
                type="button"
                data-hulian-select-chip-remove=""
                data-hulian-select-chip-remove-value={chip.value}
                aria-label={removeLabel(chip.accessibleLabel)}
                className="pointer-events-auto -ml-5 inline-flex size-4 items-center justify-center rounded hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  const index = chipModels.findIndex((candidate) => candidate.value === chip.value);
                  const nextValue = chipModels[index + 1]?.value ?? chipModels[index - 1]?.value;
                  const currentButton = event.currentTarget;
                  const wrapper = currentButton.closest("[data-hulian-select-trigger-wrapper]");
                  const focusSurvivor = () => {
                    // maxDisplay can mount the chosen successor only after this deletion. Query
                    // the current DOM rather than the stale visible controls, then fall back to
                    // the trigger when the final chip disappears.
                    const removeButtons = Array.from(
                      wrapper?.querySelectorAll<HTMLButtonElement>(
                        "[data-hulian-select-chip-remove]",
                      ) ?? [],
                    );
                    const target =
                      (nextValue == null
                        ? null
                        : removeButtons.find(
                            (button) => button.dataset.hulianSelectChipRemoveValue === nextValue,
                          )) ??
                      removeButtons.find((button) => button !== currentButton) ??
                      removeButtons[0] ??
                      wrapper?.querySelector<HTMLButtonElement>("button[role='combobox']") ??
                      null;
                    target?.focus();
                  };
                  onRemoveValue?.(chip.value, event);
                  // Base UI's native focus-out listener can run after React commits. Re-query in
                  // both queues so focus follows the rendered successor (or the real Trigger).
                  queueMicrotask(focusSurvivor);
                  setTimeout(focusSurvivor, 0);
                }}
              >
                <ClearIcon />
              </button>
            </span>
          ))}
        </span>
      )}
      {clearAllButton}
    </span>
  );
}

// searchable 皮肤下 Combobox 的列表由 items 驱动（函数式 children 遍历「已过滤」项）。
// 消费者写的仍是声明式 <SelectItem>，这里按 value 建索引，过滤结果命中谁就渲染谁的原节点，
// 从而保留自定义选项内容；命不中（items 有、children 没写）时兜底渲染 label。
function indexItemChildren(children: ReactNode, map: Map<string, ReactNode>) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const childProps = (child as ReactElement<{ value?: unknown; children?: ReactNode }>).props;
    if (typeof childProps.value === "string") {
      map.set(childProps.value, child);
      return;
    }
    // SelectGroup / Fragment 等容器：下钻（搜索皮肤下分组被拍平，见 select.md）。
    if (childProps.children != null) indexItemChildren(childProps.children, map);
  });
}

function isSelectItemNode(node: ReactNode): node is ReactElement<SelectItemProps> {
  return (
    isValidElement<SelectItemProps>(node) &&
    node.type === SelectItem &&
    typeof node.props.value === "string"
  );
}

function orderStandardChildren(
  children: ReactNode,
  selectedValues: readonly string[],
  values?: string[],
): ReactNode[] {
  const nodes = Children.toArray(
    Children.map(children, (node) =>
      isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment
        ? orderStandardChildren(node.props.children, EMPTY_SELECTED_VALUES)
        : node,
    ),
  );
  const orderedItems = orderSelectedFirst(
    nodes.filter(isSelectItemNode).map((node) => ({ value: node.props.value, node })),
    selectedValues,
  ).map((entry) => entry.node);
  let itemIndex = 0;

  return nodes.map((node) => {
    if (isSelectItemNode(node)) {
      const item = orderedItems[itemIndex++]!;
      values?.push(item.props.value);
      return item;
    }
    if (
      isValidElement<{ children?: ReactNode }>(node) &&
      node.type === SelectGroup
    ) {
      return cloneElement(
        node,
        undefined,
        orderStandardChildren(node.props.children, selectedValues, values),
      );
    }
    return node;
  });
}

function findSelectContentChildren(children: ReactNode): ReactNode | undefined {
  let contentChildren: ReactNode | undefined;
  Children.forEach(children, (node) => {
    if (contentChildren !== undefined || !isValidElement<{ children?: ReactNode }>(node)) return;
    if (node.type === SelectContent) {
      contentChildren = node.props.children;
      return;
    }
    if (node.type === Fragment && node.props.children != null) {
      contentChildren = findSelectContentChildren(node.props.children);
    }
  });
  return contentChildren;
}

export function SelectContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: SelectContentProps) {
  const {
    searchable,
    selectedFirst,
    currentValue,
    multiple,
    searchPlaceholder,
    emptyMessage,
    loadingNode,
  } = useContext(SelectMetaContext);

  const childByValue = useMemo(() => {
    const map = new Map<string, ReactNode>();
    if (searchable) indexItemChildren(children, map);
    return map;
  }, [searchable, children]);

  if (searchable) {
    return (
      <ComboboxContent
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={className}
      >
        {(item: ComboboxItemData) => (
          <Fragment key={item.value}>
            {childByValue.get(item.value) ?? (
              <SelectItem value={item.value}>{item.label}</SelectItem>
            )}
          </Fragment>
        )}
      </ComboboxContent>
    );
  }

  const standardChildren =
    multiple && selectedFirst
      ? orderStandardChildren(
          children,
          Array.isArray(currentValue) ? currentValue : EMPTY_SELECTED_VALUES,
        )
      : children;

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
            "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none",
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransitions.popup}
        >
          <BaseSelect.List>
            {loadingNode ?? standardChildren}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ value, disabled, children, className }: SelectItemProps) {
  const { searchable, searchItemByValue } = useContext(SelectMetaContext);

  if (searchable) {
    // Combobox 的 item 值是 {value,label} 对象；优先复用 items 里的同一条，命不中就现造。
    const data = searchItemByValue?.get(value) ?? { value, label: children };
    return (
      <ComboboxItem value={data} disabled={disabled} className={className}>
        <span className="truncate">{children}</span>
      </ComboboxItem>
    );
  }

  return (
    <BaseSelect.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-[calc(var(--radius)-0.25rem)] py-1.5 pl-2 pr-8 text-sm outline-none",
        // 选中态（#344）：此前当前值在打开的面板里只有右侧一个 ✓，一旦键盘移动过、
        // 或指针划过别的行，选中项就再没有任何可见标记 —— 长列表里等于让人逐行找 ✓。
        // 色值对齐库内既有的列表选中态（Tree / Listbox / Cascader 都是 bg-primary/12 + text-primary）。
        "data-[selected]:bg-primary/12 data-[selected]:font-medium data-[selected]:text-primary",
        "data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
        // 叠加态必须显式写：`[data-selected]` 与 `[data-highlighted]` 特异性相同，同时命中时
        // 谁赢取决于 Tailwind 的生成顺序而不是这里的书写顺序。写成两个属性的链式选择器
        // （特异性 0,3,0）才稳定压过上面两条（各 0,2,0）—— 键盘停在当前值上时，
        // 它既要比普通 highlight 更重，又不能丢掉「这是已选项」的主色。
        "data-[selected]:data-[highlighted]:bg-primary/20 data-[selected]:data-[highlighted]:text-primary",
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

/** 选项分组容器：内放一个 SelectGroupLabel + 若干 SelectItem。searchable 皮肤下会被拍平。 */
export function SelectGroup({ children, className }: SelectGroupProps) {
  return (
    <BaseSelect.Group className={cn("py-1 first:pt-0 last:pb-0", className)}>
      {children}
    </BaseSelect.Group>
  );
}

/** 分组标题：Base UI 自动与父 SelectGroup 建立 aria-labelledby 关联。 */
export function SelectGroupLabel({ children, className }: SelectGroupLabelProps) {
  return (
    <BaseSelect.GroupLabel
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
    >
      {children}
    </BaseSelect.GroupLabel>
  );
}
