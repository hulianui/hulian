import type { ComponentProps, ReactNode } from "react";
import type { Select as BaseSelect } from "@base-ui/react/select";

export type SelectSize = "sm" | "md" | "lg";

/** 选项元数据：`value` 为 `null` 的项被瑚琏内部用作占位（见 SelectProps.placeholder）。 */
export interface SelectItemData {
  value: string | null;
  label: ReactNode;
}

// rc.0 的 Select.Value 无 placeholder prop（context7 文档对应 v1.2+，与本项目 rc.0 不符，实证见 spec §2）。
// 瑚琏把 placeholder 提升到 Select：内部注入一个 value:null 的 items 项作占位 label，
// 无值时 Base UI 的 resolveSelectedLabel 命中该 null 项自动显示其 label。
export interface SelectProps
  extends Omit<
    ComponentProps<typeof BaseSelect.Root>,
    "items" | "multiple" | "value" | "defaultValue" | "onValueChange"
  > {
  /** 受控值：单选 `string | null`；multiple 时 `string[]`。 */
  value?: string | string[] | null;
  /** 非受控初值：单选 `string | null`；multiple 时 `string[]`。 */
  defaultValue?: string | string[] | null;
  /**
   * 选中值变化回调：单选回传 `string | null`，multiple 回传 `string[]`。
   * （组件非泛型，参数按使用场景收窄——直接接 `useState<string[]>` 的 setter 也类型兼容。）
   */
  onValueChange?: (value: any, eventDetails?: unknown) => void;
  /** 选项数据（{value,label}）；Base UI 据此让 Trigger 显示选中项 label 而非 raw value。 */
  items?: ReadonlyArray<SelectItemData>;
  /** 无选中值时的占位文本（瑚琏注入 value:null 项实现，rc.0 无 Value.placeholder prop）。 */
  placeholder?: ReactNode;
  /** 多选模式：受控值为 `string[]`（value/defaultValue/onValueChange 均为数组）；选中后浮层保持打开。 */
  multiple?: boolean;
  /**
   * 可清除（对标 el-select `clearable`）：有值时 Trigger 右侧 hover/focus 浮出清除按钮，
   * 点击置空并触发 `onValueChange`（单选回传 `null`，多选回传 `[]`）。
   * 开启后组件会接管 value（内部受控镜像），未开启时 value 归属与旧版完全一致。
   */
  clearable?: boolean;
  /**
   * 可搜索（对标 el-select `filterable`）：切到 Combobox 搜索皮肤——浮层顶部渲染搜索框，
   * 过滤逻辑复用 Base UI Combobox（不另造）。依赖 `items` 提供候选与 label。
   * 注意：该皮肤下选项列表由 `items` 驱动拍平渲染，`SelectGroup` 分组不生效。
   */
  searchable?: boolean;
  /** searchable 时浮层内搜索框的占位文案。@default "搜索" */
  searchPlaceholder?: string;
  /** searchable 时无匹配项的空态文案。@default "无匹配项" */
  emptyMessage?: ReactNode;
  /** 加载态：Trigger 图标换 Spinner，浮层只渲染加载占位（不渲染选项）。 */
  loading?: boolean;
  /** 加载态占位文案。@default "加载中" */
  loadingText?: ReactNode;
}

export interface SelectTriggerProps
  extends Omit<ComponentProps<"button">, "className" | "size"> {
  size?: SelectSize;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 多选模式下 Trigger 最多平铺几个已选 label，超出折叠为 +N 计数。@default 2 */
  maxDisplay?: number;
  className?: string;
}

export interface SelectContentProps {
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface SelectItemProps {
  /** 选项值（本批原始 string 值；对象值留后续批次）。 */
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/** 选项分组容器（内放一个 SelectGroupLabel + 若干 SelectItem）。searchable 皮肤下不生效。 */
export interface SelectGroupProps {
  children: ReactNode;
  className?: string;
}

/** 分组标题（Base UI 自动与父 SelectGroup 建立 aria 关联）。 */
export interface SelectGroupLabelProps {
  children: ReactNode;
  className?: string;
}
