import type { ReactNode } from "react";
import type { ComboboxSize } from "../combobox/combobox.types";

export type RemoteSelectSize = ComboboxSize;

/** 远程返回的一行原始数据：字段名由后端决定，取值靠 valueKey / labelKey 映射。 */
export type RemoteSelectRow = Record<string, unknown>;

/** 归一后的选项。value/label 恒为 string（Base UI 以 {value,label} 形状自动派生显示与提交值）；raw 保留原始行。 */
export interface RemoteSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  raw: RemoteSelectRow;
}

/** 一次远程请求的上下文。signal 在该请求被新一次搜索/新一页取代或组件卸载时 abort。 */
export interface RemoteSelectFetchContext {
  /** 页码，从 1 起。 */
  page: number;
  pageSize: number;
  /** 传给 fetch/axios 的取消信号，务必透传，否则慢响应仍会占用连接。 */
  signal: AbortSignal;
}

export interface RemoteSelectFetchResult {
  /** 当前页原始行。 */
  options: RemoteSelectRow[];
  /** 总条数；给了就按 `已加载 < total` 判断还有没有下一页，不给则按「本页满 pageSize 即可能还有」推断。 */
  total?: number;
}

/**
 * 搜索数据源：按关键词 + 页码取数。
 * 只负责「列表」，不负责「回显」——已选但不在列表里的值由 resolveValue 单独解。
 */
export type RemoteSelectFetcher = (
  query: string,
  ctx: RemoteSelectFetchContext,
) => Promise<RemoteSelectFetchResult>;

/**
 * 初值回显解析器：按 value 批量解 label。
 * 编辑表单打开时 value 已有但不在首屏列表里（比如它在第 7 页、或已被搜索词过滤掉），
 * 只有它能把 label 解出来；缺了就只能显示裸 value。与 fetcher 分离，不要合并。
 */
export type RemoteSelectResolver = (values: string[]) => Promise<RemoteSelectRow[]>;

/** 对外 value 允许 string | number（后端主键常是数字），内部一律按 string 处理。 */
export type RemoteSelectRawValue = string | number;

export interface RemoteSelectBaseProps {
  /** 远程搜索数据源（必填）。 */
  fetcher: RemoteSelectFetcher;
  /** 初值回显解析器：value 不在已加载列表里时用它单独解 label（编辑表单必传）。 */
  resolveValue?: RemoteSelectResolver;
  /** 从原始行取 label 的字段名。 */
  labelKey?: string;
  /** 从原始行取 value 的字段名。 */
  valueKey?: string;
  /** 输入防抖毫秒数。 */
  debounce?: number;
  /** 每页条数，透传给 fetcher。 */
  pageSize?: number;
  /** 字段占位文案。 */
  placeholder?: string;
  /** 无数据文案。 */
  emptyMessage?: ReactNode;
  /** 加载中文案。 */
  loadingMessage?: ReactNode;
  /** 尺寸。 */
  size?: RemoteSelectSize;
  /** 禁用。 */
  disabled?: boolean;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 单选时渲染清除按钮（多选靠 chip 上的 × 逐个删）。 */
  clearable?: boolean;
  /** 非受控初始展开（调试 / 文档演示用）。 */
  defaultOpen?: boolean;
  /** 自定义选项行渲染（默认单行 label）。 */
  renderOption?: (option: RemoteSelectOption) => ReactNode;
  /** 字段（输入框 / chips 外壳）类名。 */
  className?: string;
  /** 浮层类名。 */
  popupClassName?: string;
}

export interface RemoteSelectSingleProps extends RemoteSelectBaseProps {
  multiple?: false;
  /** 受控值。 */
  value?: RemoteSelectRawValue | null;
  /** 非受控初值。 */
  defaultValue?: RemoteSelectRawValue | null;
  /** 选中变化。第二参给出完整选项（含 raw 原始行），未选中为 null。 */
  onChange?: (value: string | null, option: RemoteSelectOption | null) => void;
}

export interface RemoteSelectMultipleProps extends RemoteSelectBaseProps {
  multiple: true;
  /** 受控值。数组顺序即 chip 渲染顺序。 */
  value?: RemoteSelectRawValue[];
  /** 非受控初值。 */
  defaultValue?: RemoteSelectRawValue[];
  /** 选中变化。第二参与 value 同序。 */
  onChange?: (value: string[], options: RemoteSelectOption[]) => void;
}

export type RemoteSelectProps = RemoteSelectSingleProps | RemoteSelectMultipleProps;
