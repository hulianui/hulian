import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  UIEventHandler,
} from "react";
import type { Combobox as BaseCombobox } from "@base-ui/react/combobox";

export type ComboboxSize = "sm" | "md" | "lg";

/** 选项数据：{value,label}。Base UI 自动用 label 显示、value 提交（无需 itemToString）。 */
export interface ComboboxItemData {
  value: string;
  label: ReactNode;
}

// 透明转发 Combobox.Root。泛型 Multiple 默认 false（单选）→ 旧用法零变化、向后兼容；
// 传 multiple 即推断为 true，value/onValueChange 自动变数组（Base UI 原生支持）。
export type ComboboxProps<Multiple extends boolean = false> =
  BaseCombobox.Root.Props<ComboboxItemData, Multiple> & {
    children?: ReactNode;
    /**
     * 自由输入创建新值：当前输入串在候选里**没有完全相同的一项**时，在列表首位多出一条
     * 「使用 “xxx”」，选它就把这串原样提交上去。
     *
     * 存在的理由是长尾字段（发证机构、单位名称这类）：几百个常见值做成选项能让绝大多数人少打字，
     * 但运营手里就是有一张列表上没有的。做成纯选择会逼他们挑一个近似值，那比自由输入更糟。
     *
     * 选中创建项时 `onValueChange` 收到的是 `{ value: 输入串, label: 输入串 }`（两端空白已去除），
     * 同时 `onCreate` 拿到那串 —— 后者是给「把它落库 / 追加进 `items`」用的。
     * @default false
     */
    creatable?: boolean;
    /**
     * 创建项被选中时触发，参数是去掉两端空白的输入串。与 `onValueChange` 同时发生，
     * 不是二选一：值的变化照常走 `onValueChange`，这里只负责「这是一个新值，去建它」。
     */
    onCreate?: (value: string) => void;
  };

/**
 * 多选 chips 外壳（可见字段）：内含 chip 列 + 输入框 + chevron；注册为浮层锚点。
 *
 * 剩余原生属性落到**内层 `<input>`**（不是 chips 容器）：`id` 要能被 `<label for>` 命中、
 * `name` 要能提交、`aria-label` 要落在 `role="combobox"` 那个节点上、`onBlur` 要能接
 * `Controller` —— 这四样的正确落点都是输入框；容器自身的钩子用 `className`。见 #160。
 */
export interface ComboboxChipsProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix" | "children"> {
  size?: ComboboxSize;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 输入框占位（一般仅在无选中时给）。 */
  placeholder?: string;
  className?: string;
  /** chip 列（按 value 顺序渲染 ComboboxChip）。 */
  children?: ReactNode;
}

/** 单个已选 chip（pill + 删除 ×，删除按 chips 内渲染顺序绑定 selectedValue[index]）。 */
export interface ComboboxChipProps {
  children: ReactNode;
  className?: string;
}

/**
 * 内联自动补全字段。
 *
 * 继承原生 `<input>` 属性，且剩余属性落到**内层 `<input>`** 而不是外壳 `<span>`：
 * `aria-label` / `id` / `name` / `onBlur` 挂在外壳上都是无效的（外壳只是皮肤，
 * `role="combobox"` 在内层）。外壳的类名仍走 `className`。见 #160。
 */
export interface ComboboxInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  size?: ComboboxSize;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 渲染清除按钮（Combobox.Clear，有值时显示）。 */
  clearable?: boolean;
  /** 字段左侧图标槽（对齐 Input.prefix）：搜索框放放大镜。 */
  prefix?: ReactNode;
  /**
   * 右侧展开箭头。搜索框形态请传 `false`：留着 chevron 的框读起来是「下拉选择」，
   * 而搜索框的语义是「打字得到建议」。@default true
   */
  showChevron?: boolean;
}

/**
 * 图4 范式触发按钮：显示已选 label / placeholder，点击展开「弹层内搜索」式浮层。
 *
 * 继承原生 `<button>` 属性，剩余属性落到触发按钮自身（它就是根节点）。
 */
export interface ComboboxTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "children"> {
  size?: ComboboxSize;
  /** 未选中时占位文案（按钮没有原生 placeholder，这里是瑚琏语义）。 */
  placeholder?: string;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  className?: string;
}

export interface ComboboxContentProps {
  /** render fn：List 自动遍历已过滤项调用。 */
  children: (item: ComboboxItemData, index: number) => ReactNode;
  emptyMessage?: ReactNode;
  /** 设置后在浮层顶部渲染搜索框（图4 范式，配合 ComboboxTrigger 使用）。不设则无内置搜索框（内联自动补全态）。 */
  searchPlaceholder?: string;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /** 列表滚动回调；`e.currentTarget` 即滚动容器（远程分页「滚到底加载更多」用）。 */
  onListScroll?: UIEventHandler<HTMLDivElement>;
  /**
   * 列表**上方**常驻表头（用法提示、分组说明、批量操作）。
   *
   * 与 `emptyMessage` 不是一回事：后者只在零结果时出现，所以「找不到就直接输入」这类**始终**
   * 要看见的提示挂不上去 —— 有历史值时它永远不显示。也与 `footer` 对称：一个在列表上、一个在列表下，
   * 两个都不参与列表滚动。
   */
  header?: ReactNode;
  /** 列表下方常驻页脚（加载中 / 计数 / 到底提示）。不参与列表滚动，故不会被新一页顶走。 */
  footer?: ReactNode;
  className?: string;
}

export interface ComboboxItemProps {
  /** 选项值（{value,label} 对象，Base UI 自动派生 label/value）。 */
  value: ComboboxItemData;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}
