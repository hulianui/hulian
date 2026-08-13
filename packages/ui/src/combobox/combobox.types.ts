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
    /**
     * 创建项那一行的文案，参数是去掉两端空白的输入串。不传则回落到 locale 的
     * `combobox.create`（默认「使用 “xxx”」）。
     *
     * 补它的理由是**同一个应用里两个 creatable 说的不是同一件事**（#259）：一个是「新建一个机构名」，
     * 另一个可能要写成「使用「xxx」（原文非标状态）」——括号里那句是给操作者的判断依据，少了它
     * 对方会以为自己填错了。此前只有全局 locale 一个出口，为一行文案得在业务里嵌一层
     * `ConfigProvider` 覆盖全局那份，而且覆盖时要把整个 `combobox` 段 spread 一遍才不丢
     * `clear` / `remove`。口径与 `emptyMessage` 一致：全局有默认、单点可覆盖。
     */
    createLabel?: (value: string) => ReactNode;
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
  /**
   * 自定义触发钮内容，替换掉默认那块「已选 label ?? placeholder」（#257）。
   *
   * 存在的理由是**窄格子里放不下值**：表格单元格里已经有一个字段在显示这个名字了，触发钮再显示
   * 一遍，同一个值在一个格子里出现两遍，看起来像两个字段。那种位置只放得下一枚状态图标。
   * 此前这条路被类型上的 `Omit<…, "children">` 堵死，`placeholder` 又只在未选中时出现——
   * 一选中就掉回显示名字，表达不了「不管选没选，都只画图标」。
   *
   * 传函数即按已选值分叉（`已绑定 / 未绑定` 换两个图标是最常见的形态）；传节点即固定内容。
   * 不传 = 原行为，向后兼容。
   *
   * ⚠️ 自定义内容不会自动截断：默认那块自带 `truncate`，换掉之后长文本的省略号得自己写。
   */
  children?: ReactNode | ((value: ComboboxItemData | null) => ReactNode);
  /**
   * 右侧展开箭头。退化成图标钮时请传 `false`：一枚图标旁边挂个 chevron 就又占回了宽度，
   * 而省宽度正是走 `children` 的理由。口径与 `ComboboxInput` 的同名 prop 一致。@default true
   */
  showChevron?: boolean;
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
