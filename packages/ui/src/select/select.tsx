"use client";
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import {
  Combobox,
  ComboboxAnchorContext,
  ComboboxContent,
  ComboboxItem,
} from "../combobox/combobox";
import type { ComboboxItemData } from "../combobox/combobox.types";
import { Spinner } from "../spinner/spinner";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  SelectContentProps,
  SelectGroupLabelProps,
  SelectGroupProps,
  SelectItemProps,
  SelectProps,
  SelectTriggerProps,
} from "./select.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 驱动 Base UI 原生过渡（同 Dialog/Tooltip/Popover）。
// 用 transition 简写(而非长写)：Base UI 在过渡生命周期会往内联 style 注入 transition 简写，与长写
// 混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。简写同属性覆盖无混用 → 警告消除。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

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
  clearable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  loading?: boolean;
  loadingText?: ReactNode;
  /** searchable 皮肤下喂给 Combobox 的候选（已剔除 null 占位项）。 */
  searchItems?: ReadonlyArray<ComboboxItemData>;
  searchItemByValue?: ReadonlyMap<string, ComboboxItemData>;
  /** 当前是否有选中值（单选非空、多选数组非空）——决定清除按钮是否渲染。 */
  hasValue?: boolean;
  onClear?: () => void;
}
const SelectMetaContext = createContext<SelectMeta>({});

const EMPTY_ITEMS: ReadonlyArray<ComboboxItemData> = [];

// Combobox 是泛型函数组件，spread 动态构造的 props 推断不稳 → 在边界放宽签名
// （同 combobox.tsx 内对 BaseCombobox.Root 的处理），对外类型仍由 SelectProps 保证。
const SearchRoot = Combobox as unknown as (
  props: Record<string, unknown> & { children?: ReactNode },
) => ReactElement;

// placeholder 经注入一个 value:null 的 items 项实现（rc.0 Select.Value 无 placeholder prop）。
// 无值时 Base UI 自动显示该 null 项 label（占位）；有值时显示选中项 label。Value 因此不写 children。
// 多选值是数组，命不中 null 项 → 不注入，占位改由 SelectTrigger 的函数式 Value 渲染。
export function Select({
  items,
  placeholder,
  multiple,
  clearable,
  searchable,
  searchPlaceholder = "搜索",
  emptyMessage = "无匹配项",
  loading,
  loadingText = "加载中",
  value: valueProp,
  defaultValue,
  onValueChange,
  children,
  ...props
}: SelectProps) {
  // 值镜像：clearable/searchable 需要「读当前值」与「程序化置空」，Base UI 的 store 不对外暴露。
  // 受控时以 valueProp 为准；非受控时镜像跟着 onValueChange 走（此时仍把 defaultValue 交给 Base UI，
  // 除非开了 clearable —— 清除必须能反写，那一档才由瑚琏接管为受控）。
  const controlled = valueProp !== undefined;
  const [mirror, setMirror] = useState<string | string[] | null>(
    () => defaultValue ?? (multiple ? [] : null),
  );
  const current = controlled ? valueProp : mirror;

  const handleValueChange = useCallback(
    (next: unknown, eventDetails?: unknown) => {
      if (!controlled) setMirror(next as string | string[] | null);
      onValueChange?.(next, eventDetails);
    },
    [controlled, onValueChange],
  );

  const hasValue = multiple
    ? Array.isArray(current) && current.length > 0
    : current != null && current !== "";

  const handleClear = useCallback(() => {
    handleValueChange(multiple ? [] : null);
  }, [handleValueChange, multiple]);

  // 加载态占位：两种皮肤共用（标准皮肤放进 List，搜索皮肤复用 Combobox 的空态槽位）。
  const loadingNode = (
    <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted">
      <Spinner size="sm" tone="current" />
      {loadingText}
    </div>
  );

  // 搜索皮肤的候选：剔除 value 为 null 的占位项（Combobox 无 null 占位机制，占位走 Trigger 自身）。
  const searchItems = useMemo<ReadonlyArray<ComboboxItemData>>(() => {
    if (!searchable || loading || items == null) return EMPTY_ITEMS;
    return items
      .filter((it): it is { value: string; label: ReactNode } => it.value != null)
      .map((it) => ({ value: it.value, label: it.label }));
  }, [searchable, loading, items]);
  const searchItemByValue = useMemo(
    () => new Map(searchItems.map((item) => [item.value, item])),
    [searchItems],
  );

  const meta = useMemo<SelectMeta>(
    () => ({
      items,
      placeholder,
      multiple,
      clearable,
      searchable,
      searchPlaceholder,
      emptyMessage: loading ? loadingNode : emptyMessage,
      loading,
      loadingText,
      searchItems,
      searchItemByValue,
      hasValue,
      onClear: handleClear,
    }),
    // loadingNode 每渲染新建，但只在 loading 时进入 meta，且它只作展示节点 → 用 loading/loadingText 做依赖即可。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      items,
      placeholder,
      multiple,
      clearable,
      searchable,
      searchPlaceholder,
      emptyMessage,
      loading,
      loadingText,
      searchItems,
      searchItemByValue,
      hasValue,
      handleClear,
    ],
  );

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
      value: searchValue,
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
        typeof item?.label === "string" ? item.label : String(item?.value ?? ""),
    };
    return (
      <SelectMetaContext.Provider value={meta}>
        <SearchRoot {...rootProps}>{children}</SearchRoot>
      </SelectMetaContext.Provider>
    );
  }

  const finalItems =
    !multiple && placeholder != null && items != null
      ? [{ value: null, label: placeholder }, ...items]
      : items;
  const rootProps: Record<string, unknown> = {
    ...props,
    items: finalItems,
    multiple,
    onValueChange: handleValueChange,
    // clearable 需要程序化置空 → 该档接管为受控；否则保持旧版的 value/defaultValue 归属不变。
    ...(clearable ? { value: current } : { value: valueProp, defaultValue }),
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
) {
  const values = Array.isArray(value) ? value : value == null ? [] : [value];
  if (values.length === 0) return placeholder ?? null;
  const labels = values.map((v) => {
    // 搜索皮肤下 Combobox 的值是 {value,label} 对象，标准皮肤下是原始 string。
    const raw =
      v != null && typeof v === "object" && "value" in v ? (v as ComboboxItemData).value : v;
    return items?.find((it) => it.value === raw)?.label ?? String(raw);
  });
  const shown = labels.slice(0, maxDisplay);
  const extra = values.length - shown.length;
  return (
    <>
      {shown.map((label, i) => (
        <Fragment key={i}>
          {i > 0 && "、"}
          {label}
        </Fragment>
      ))}
      {extra > 0 && <span className="text-muted"> +{extra}</span>}
    </>
  );
}

function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value) => refs.forEach((ref) => setRef(ref, value));
}

export function SelectTrigger({
  size,
  invalid,
  maxDisplay = 2,
  className,
  ref: forwardedRef,
  ...triggerProps
}: SelectTriggerProps) {
  const { items, placeholder, multiple, searchable, clearable, loading, hasValue, onClear } =
    useContext(SelectMetaContext);
  const anchorRef = useContext(ComboboxAnchorContext);
  const searchableRef = useMemo(
    () => mergeRefs(anchorRef as Ref<HTMLButtonElement> | undefined, forwardedRef),
    [anchorRef, forwardedRef],
  );
  // 清除按钮只在「开了 clearable + 当前有值 + 非加载态」时进 DOM；可见性再由 hover/focus 控制。
  const showClear = Boolean(clearable && hasValue && !loading);

  const tail = loading ? (
    <span className="flex shrink-0 items-center text-muted">
      <Spinner size="sm" tone="current" />
    </span>
  ) : null;
  const tailClassName = cn(
    "flex shrink-0 items-center text-muted transition-transform data-[popup-open]:rotate-180",
    // 清除按钮浮出时把箭头让位（二者共用右侧同一格，同 el-select 的 hover 互换）。
    showClear && "group-hover:opacity-0 group-focus-within:opacity-0",
  );

  const trigger = searchable ? (
    <BaseCombobox.Trigger
      {...triggerProps}
      ref={searchableRef}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      <BaseCombobox.Value>
        {(value: unknown) =>
          multiple ? (
            <span className="truncate">
              {renderMultipleValue(value, items, placeholder, maxDisplay)}
            </span>
          ) : (
            <span className={cn("truncate", value == null && "text-muted")}>
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
      ref={forwardedRef}
      {...(invalid && { "data-invalid": "", "aria-invalid": true })}
      className={cn(selectTriggerVariants({ size }), className)}
    >
      {/* 单选不写 children：有值显示选中 label，无值显示注入的 null 项 label（=placeholder）；
          多选走函数式 children 平铺已选 label + 超出 +N。data-placeholder 态置 muted。 */}
      <BaseSelect.Value className="truncate data-[placeholder]:text-muted">
        {multiple
          ? (value: unknown) => renderMultipleValue(value, items, placeholder, maxDisplay)
          : undefined}
      </BaseSelect.Value>
      {tail ?? (
        <BaseSelect.Icon className={tailClassName}>
          <ChevronDownIcon />
        </BaseSelect.Icon>
      )}
    </BaseSelect.Trigger>
  );

  // 未开 clearable：DOM 与旧版逐字节一致（不加包裹层），保证既有布局/选择器不被动到。
  if (!clearable) return trigger;
  // 清除按钮做成 Trigger 的兄弟而非子节点——button 内嵌 button 是非法 HTML，
  // 且嵌套后点击会冒泡到 Trigger 把浮层打开。绝对定位盖在箭头位置上。
  return (
    <span className="group relative block w-full">
      {trigger}
      {showClear && (
        <button
          type="button"
          aria-label="清除"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onClear?.();
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

export function SelectContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: SelectContentProps) {
  const { searchable, searchPlaceholder, emptyMessage, loading, loadingText } =
    useContext(SelectMetaContext);

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
          style={overlayTransition}
        >
          <BaseSelect.List>
            {loading ? (
              // 加载态只出占位，不渲染选项（避免展示上一轮的陈旧数据）。
              <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted">
                <Spinner size="sm" tone="current" />
                {loadingText}
              </div>
            ) : (
              children
            )}
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
    <BaseSelect.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted", className)}>
      {children}
    </BaseSelect.GroupLabel>
  );
}
