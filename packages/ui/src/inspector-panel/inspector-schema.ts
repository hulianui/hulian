import type {
  InspectorField,
  InspectorSection,
  InspectorSpacingSides,
  InspectorToken,
  InspectorValue,
} from "./inspector-panel.types";

// 纯逻辑层：零 React 依赖，供组件与消费方共用，也让 schema 派生规则可单测。

/**
 * 混合值哨兵。多选场景下某属性在各选中元素上取值不一致时，把它放进 `props[path]`，
 * 面板就渲染「多个值」占位而不是显示第一个元素的值。
 * 用 `Symbol.for` 而非字符串常量：任何真实属性值都不可能等于它，不存在误判。
 */
export const MIXED: unique symbol = Symbol.for("hulian.inspector.mixed");

export function isMixed(value: unknown): value is typeof MIXED {
  return value === MIXED;
}

/**
 * 从属性值表里按 path 取值。
 * 先按扁平键命中（设计工具最常见的形态就是一张扁平 style 表），未命中再按 `a.b.c` 逐段下钻。
 * 取到对象/数组这类不可编辑的值时按「无值」处理，避免控件拿到无法渲染的东西。
 */
export function readInspectorValue(
  source: Record<string, unknown> | undefined,
  path: string,
): InspectorValue {
  if (!source) return undefined;
  let raw: unknown;
  if (Object.prototype.hasOwnProperty.call(source, path)) {
    raw = source[path];
  } else {
    let cursor: unknown = source;
    for (const segment of path.split(".")) {
      if (cursor == null || typeof cursor !== "object") return undefined;
      cursor = (cursor as Record<string, unknown>)[segment];
    }
    raw = cursor;
  }
  if (raw == null) return raw as null | undefined;
  if (isMixed(raw)) return raw;
  const type = typeof raw;
  if (type === "string" || type === "number" || type === "boolean") return raw as InspectorValue;
  return undefined;
}

/**
 * 派生四边 path：`padding` → `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft`。
 * 与 CSS-in-JS 的驼峰命名一致，所以内置预设不用逐个写 sides。
 */
export function spacingSides(
  key: string,
  override?: Partial<InspectorSpacingSides>,
): InspectorSpacingSides {
  const suffix = (side: string) => `${key}${side[0].toUpperCase()}${side.slice(1)}`;
  return {
    top: override?.top ?? suffix("top"),
    right: override?.right ?? suffix("right"),
    bottom: override?.bottom ?? suffix("bottom"),
    left: override?.left ?? suffix("left"),
  };
}

/** 把 `12` / `"12"` / `"12px"` / `"1.5rem"` 统一读成数字；读不出（`auto` / 混合值 / 空）返回 null。 */
export function parseLength(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  const matched = /^\s*(-?\d*\.?\d+)/.exec(raw);
  if (!matched) return null;
  const parsed = Number(matched[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/** 有单位回吐 `"12px"` 字符串，无单位回吐数字 `12`——回吐形态只由字段的 `unit` 决定，与输入形态无关。 */
export function formatLength(value: number, unit?: string): number | string {
  return unit ? `${value}${unit}` : value;
}

/** token 的可绘制值：给了字面 `value` 用它，否则回落 `var(--token)`。 */
export function tokenColor(token: InspectorToken): string {
  return token.value ?? `var(--${token.token})`;
}

/** 未分组的 token 在所有色值字段里都出现；分了组的只在同名 `tokenGroup` 字段里出现。 */
export function fieldTokens(
  tokens: readonly InspectorToken[] | undefined,
  group?: string,
): InspectorToken[] {
  if (!tokens || tokens.length === 0) return [];
  if (!group) return [...tokens];
  return tokens.filter((token) => token.group === undefined || token.group === group);
}

/** 当前值是否正好等于某个 token（字面值、`var(--x)`、裸 token 名三种写法都认）。 */
export function matchToken(
  value: InspectorValue,
  tokens: readonly InspectorToken[],
): InspectorToken | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  return tokens.find(
    (token) =>
      value === tokenColor(token) || value === `var(--${token.token})` || value === token.token,
  );
}

/** 能不能喂给 ColorPicker（它只吃 hex / rgb() / hsl()，喂 `var(--x)` 会解析失败）。 */
export function isLiteralColor(value: InspectorValue): value is string {
  return typeof value === "string" && /^(#|rgba?\(|hsla?\()/i.test(value.trim());
}

// ===== 内置预设 schema =====
// 都是普通数组，消费方可以整段替换、可以 concat 自己的字段、也可以只挑几个。

export const layoutFields: InspectorField[] = [
  {
    key: "display",
    label: "显示",
    kind: "enum",
    display: "select",
    options: [
      { value: "block" },
      { value: "flex" },
      { value: "grid" },
      { value: "inline-flex" },
      { value: "none" },
    ],
  },
  {
    key: "flexDirection",
    label: "主轴",
    kind: "enum",
    options: [
      { value: "row", label: "横向" },
      { value: "column", label: "纵向" },
    ],
  },
  {
    key: "justifyContent",
    label: "主轴对齐",
    kind: "enum",
    options: [
      { value: "flex-start", label: "起" },
      { value: "center", label: "中" },
      { value: "flex-end", label: "末" },
      { value: "space-between", label: "分" },
    ],
  },
  {
    key: "alignItems",
    label: "交叉轴对齐",
    kind: "enum",
    options: [
      { value: "flex-start", label: "起" },
      { value: "center", label: "中" },
      { value: "flex-end", label: "末" },
      { value: "stretch", label: "拉" },
    ],
  },
  { key: "gap", label: "间隙", kind: "length", min: 0, max: 64, step: 1, unit: "px" },
  { key: "padding", label: "内边距", kind: "spacing", min: 0, max: 200, unit: "px" },
  { key: "margin", label: "外边距", kind: "spacing", min: -200, max: 200, unit: "px" },
  { key: "width", label: "宽度", kind: "text", placeholder: "auto / 100% / 320px" },
  { key: "height", label: "高度", kind: "text", placeholder: "auto / 100% / 240px" },
];

export const colorFields: InspectorField[] = [
  { key: "color", label: "文字色", kind: "color", tokenGroup: "text" },
  { key: "backgroundColor", label: "背景色", kind: "color", tokenGroup: "surface" },
  { key: "borderColor", label: "边框色", kind: "color", tokenGroup: "border" },
];

export const typographyFields: InspectorField[] = [
  { key: "fontSize", label: "字号", kind: "length", min: 8, max: 96, step: 1, unit: "px" },
  {
    key: "fontWeight",
    label: "字重",
    kind: "enum",
    options: [
      { value: "400", label: "常规" },
      { value: "500", label: "中" },
      { value: "600", label: "半粗" },
      { value: "700", label: "粗" },
    ],
  },
  { key: "lineHeight", label: "行高", kind: "length", min: 1, max: 3, step: 0.05 },
  { key: "letterSpacing", label: "字距", kind: "length", min: -2, max: 8, step: 0.1, unit: "px" },
  {
    key: "textAlign",
    label: "对齐",
    kind: "enum",
    options: [
      { value: "left", label: "左" },
      { value: "center", label: "中" },
      { value: "right", label: "右" },
      { value: "justify", label: "两端" },
    ],
  },
];

export const borderFields: InspectorField[] = [
  { key: "borderWidth", label: "边框宽", kind: "length", min: 0, max: 12, step: 1, unit: "px" },
  {
    key: "borderStyle",
    label: "线型",
    kind: "enum",
    options: [
      { value: "solid", label: "实线" },
      { value: "dashed", label: "虚线" },
      { value: "dotted", label: "点线" },
      { value: "none", label: "无" },
    ],
  },
  { key: "borderRadius", label: "圆角", kind: "length", min: 0, max: 64, step: 1, unit: "px" },
];

export const effectsFields: InspectorField[] = [
  { key: "opacity", label: "不透明度", kind: "length", min: 0, max: 1, step: 0.05 },
  {
    key: "boxShadow",
    label: "阴影",
    kind: "enum",
    display: "select",
    options: [
      { value: "none", label: "无" },
      { value: "sm", label: "近" },
      { value: "md", label: "中" },
      { value: "lg", label: "远" },
      { value: "xl", label: "极远" },
    ],
  },
  {
    key: "overflow",
    label: "溢出",
    kind: "enum",
    options: [
      { value: "visible", label: "显示" },
      { value: "hidden", label: "裁剪" },
      { value: "auto", label: "滚动" },
    ],
  },
  { key: "hidden", label: "隐藏元素", kind: "toggle" },
];

const PRESET_SECTIONS: InspectorSection[] = [
  { id: "layout", label: "布局", fields: layoutFields },
  { id: "color", label: "颜色", fields: colorFields },
  { id: "typography", label: "排版", fields: typographyFields },
  { id: "border", label: "边框", fields: borderFields },
  { id: "effects", label: "效果", fields: effectsFields },
];

/**
 * 取内置预设分类。不传取全部（layout / color / typography / border / effects）；
 * 传了就按**传入顺序**返回命中的那几类，未知 id 静默忽略。
 */
export function inspectorSections(categories?: readonly string[]): InspectorSection[] {
  if (!categories) return PRESET_SECTIONS.map((section) => ({ ...section }));
  const found: InspectorSection[] = [];
  for (const id of categories) {
    const preset = PRESET_SECTIONS.find((section) => section.id === id);
    if (preset) found.push({ ...preset });
  }
  return found;
}
