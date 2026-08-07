import type { InspectorPresetText } from "./inspector-schema";
import type { ReactNode } from "react";
import type { MIXED } from "./inspector-schema";

/** 混合值哨兵类型：多选时该属性在各选中元素上取值不一致。 */
export type InspectorMixed = typeof MIXED;

/** 面板可编辑的标量值域（对象/数组不参与编辑，读出后按「无值」处理）。 */
export type InspectorValue = string | number | boolean | null | undefined | InspectorMixed;

/** 字段控件种类。新增控件只在这里加一个 kind，面板不认识具体业务属性。 */
export type InspectorFieldKind =
  | "spacing"
  | "color"
  | "length"
  | "number"
  | "enum"
  | "toggle"
  | "text";

/** 枚举选项。`label` 缺省时直接显示 `value`。 */
export interface InspectorOption {
  value: string;
  label?: string;
}

export interface InspectorFieldBase {
  /** 属性路径，同时是 `onChange` 回吐的 path（支持 `a.b.c` 点号路径）。 */
  key: string;
  /** 控件左侧标签，同时作为控件的 `aria-label`。 */
  label: string;
  /** 标签下方的一行灰字说明。 */
  hint?: string;
  /** 单字段禁用。 */
  disabled?: boolean;
}

/** 四边路径。缺省由 `spacingSides` 按 `${key}Top` 这类 CSS-in-JS 驼峰规则派生。 */
export interface InspectorSpacingSides {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

/** 四联间距（上/右/下/左 + 链接锁定同步）。 */
export interface InspectorSpacingField extends InspectorFieldBase {
  kind: "spacing";
  /** 覆盖任意一边的 path；未覆盖的边仍走默认派生。 */
  sides?: Partial<InspectorSpacingSides>;
  min?: number;
  max?: number;
  step?: number;
  /** 有单位则回吐 `"12px"` 字符串，无单位回吐数字 `12`。 */
  unit?: string;
}

/** 色值：token 色板 + 自由文本 + 取色器浮层。 */
export interface InspectorColorField extends InspectorFieldBase {
  kind: "color";
  /** 只显示 `tokenSource` 里该 group 的 token（未分组的 token 恒显示）。 */
  tokenGroup?: string;
}

/** 有界连续量：滑杆 + 数字框。 */
export interface InspectorLengthField extends InspectorFieldBase {
  kind: "length";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

/** 无界数值：只有数字框。 */
export interface InspectorNumberField extends InspectorFieldBase {
  kind: "number";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /**
   * 标签内联进输入框（Sketch 的 `X` / `Y` / `W` / `H` 那种排布），而不是占左侧那一列 80px。
   * 内联后标签同时成为**拖拽调值**的抓手：横向拖动每 1px 走一个 `step`，按住 Shift 走 10 倍。
   *
   * 处于 `columns > 1` 的分组里时自动开启，不必逐个字段写（#115）。
   */
  inlineLabel?: boolean;
}

/** 互斥枚举：≤4 项默认 Segmented，更多默认 Select。 */
export interface InspectorEnumField extends InspectorFieldBase {
  kind: "enum";
  options: InspectorOption[];
  display?: "segmented" | "select";
}

/** 布尔开关。 */
export interface InspectorToggleField extends InspectorFieldBase {
  kind: "toggle";
}

/** 自由文本（宽高这类 `auto` / `100%` / `320px` 混写量）。 */
export interface InspectorTextField extends InspectorFieldBase {
  kind: "text";
  placeholder?: string;
}

export type InspectorField =
  | InspectorSpacingField
  | InspectorColorField
  | InspectorLengthField
  | InspectorNumberField
  | InspectorEnumField
  | InspectorToggleField
  | InspectorTextField;

/** 一个可折叠分类。 */
export interface InspectorSection {
  id: string;
  label: string;
  fields: InspectorField[];
  /** 缺省展开（未指定时按 true 处理）。 */
  defaultOpen?: boolean;
  /**
   * 本组字段按几列网格排布，默认 1（一行一个字段）。
   *
   * 设计工具语境下 `X / Y / 旋转`、`W / H / 翻转` 是一行三格，而不是一行一个字段配 80px 的
   * 标签列——同样的内容，一行一个要占三倍高度。多列模式下数值字段的标签自动内联进输入框（#115）。
   *
   * 只影响能内联标签的字段（number）；spacing / color 这类本来就独占一行的仍占满整行。
   */
  columns?: 1 | 2 | 3;
}

/**
 * 主题色 token。
 * 形状与文档站 `SEMANTIC_GROUPS` 里的色卡结构对齐（`{ token, label }`），
 * 所以 `SEMANTIC_GROUPS.flatMap((g) => g.colors)` 可以直接喂进 `tokenSource`。
 */
export interface InspectorToken {
  /** CSS 变量名去掉 `--`，**必须带 `color-` 前缀**（如 `color-primary`），否则不解析。 */
  token: string;
  /** 人读名，缺省取 `token`。 */
  label?: string;
  /** 字面值（如 `oklch(0.55 0.2 265)`）。给了就用它上色与回吐，不给则用 `var(--token)`。 */
  value?: string;
  /** 分组 id，配合字段的 `tokenGroup` 过滤。 */
  group?: string;
}

/** 一条属性变更。 */
export interface InspectorChange {
  path: string;
  value: InspectorValue;
}

/**
 * 回吐时机。
 * - `change`：滑杆每帧、输入框每次按键都回吐（实时预览，消费方要能扛住高频）
 * - `commit`：滑杆松手、输入框失焦/回车才回吐（拖动中只动面板内部状态）
 */
export type InspectorCommitMode = "change" | "commit";

/** 内置文案，全部可覆盖（本组件不接 ConfigProvider locale，见文档 i18n 一节）。 */
export interface InspectorPanelLabels {
  /**
   * 内置预设 schema 的字段标签与枚举选项文案。传了 `sections` prop 时它不生效 ——
   * 那种情况标签由你自己的 schema 决定。
   */
  presets: InspectorPresetText;
  title: string;
  empty: string;
  mixed: string;
  linkSides: string;
  sideTop: string;
  sideRight: string;
  sideBottom: string;
  sideLeft: string;
  pickColor: string;
  colorTokens: string;
}

export interface InspectorPanelProps {
  /**
   * 当前选中元素的标识（路径 / id）。显式传 `null` 面板进空态；
   * 不传（undefined）则不判空，直接渲染 schema。
   */
  selectedElement?: string | null;
  /** 属性值表：键为字段 path。支持扁平键与点号嵌套两种写法。 */
  props?: Record<string, unknown>;
  /**
   * 行高与内边距的密度档。`compact` 整体收紧到接近 Sketch 检查器的量级，
   * 用于真实的设计工具侧栏（一屏要放下十几组属性）；`comfortable` 是通用中后台表单的手感。
   */
  density?: "comfortable" | "compact";
  /** 单 path 变更回吐。 */
  onChange: (path: string, value: InspectorValue) => void;
  /**
   * 一次交互改多个 path（目前只有链接锁定的 spacing）时的批量回吐。
   * 传了它，这类变更**只**走它，不再逐条触发 `onChange`；不传则退化为同一 tick 内连续 4 次 `onChange`。
   */
  onBatchChange?: (changes: InspectorChange[]) => void;
  /** 完整分类 schema。传了它 `categories` 失效。 */
  sections?: InspectorSection[];
  /** 只显示内置预设里的这几类，且按数组顺序排列。 */
  categories?: readonly string[];
  /** 色值控件可选的主题 token。 */
  tokenSource?: readonly InspectorToken[];
  /** @default "change" */
  commitMode?: InspectorCommitMode;
  /** 面板标题，传 `null` 不渲染标题栏。 */
  title?: ReactNode;
  /** 空态文案（`selectedElement === null` 时显示）。 */
  emptyText?: ReactNode;
  /** 内置文案覆盖。 */
  labels?: Partial<InspectorPanelLabels>;
  className?: string;
}
