import { zhCN, type ComponentLocale } from "../config/locale";
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

/**
 * 内置预设的文案。字段标签与枚举选项都从这里取 —— 面板不传 `sections` 时渲染的就是这套预设，
 * 硬编码会让英文消费方拿到一屏中文标签（hulianui/hulian#92）。
 * 形状与 `config/locale.ts` 的 `inspectorPanel.presets` 一致，组件把当前语言的字典传进来。
 */
export type InspectorPresetText = NonNullable<
  NonNullable<ComponentLocale["inspectorPanel"]>["presets"]
>;

export function buildLayoutFields(t: InspectorPresetText): InspectorField[] {
  return [
    {
      key: "display",
      label: t.display,
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
      label: t.flexDirection,
      kind: "enum",
      options: [
        { value: "row", label: t.directionRow },
        { value: "column", label: t.directionColumn },
      ],
    },
    {
      key: "justifyContent",
      label: t.justifyContent,
      kind: "enum",
      options: [
        { value: "flex-start", label: t.alignStart },
        { value: "center", label: t.alignCenter },
        { value: "flex-end", label: t.alignEnd },
        { value: "space-between", label: t.alignBetween },
      ],
    },
    {
      key: "alignItems",
      label: t.alignItems,
      kind: "enum",
      options: [
        { value: "flex-start", label: t.alignStart },
        { value: "center", label: t.alignCenter },
        { value: "flex-end", label: t.alignEnd },
        { value: "stretch", label: t.alignStretch },
      ],
    },
    { key: "gap", label: t.gap, kind: "length", min: 0, max: 64, step: 1, unit: "px" },
    { key: "padding", label: t.padding, kind: "spacing", min: 0, max: 200, unit: "px" },
    { key: "margin", label: t.margin, kind: "spacing", min: -200, max: 200, unit: "px" },
    { key: "width", label: t.width, kind: "text", placeholder: "auto / 100% / 320px" },
    { key: "height", label: t.height, kind: "text", placeholder: "auto / 100% / 240px" },
  ];
}

export function buildColorFields(t: InspectorPresetText): InspectorField[] {
  return [
    { key: "color", label: t.textColor, kind: "color", tokenGroup: "text" },
    { key: "backgroundColor", label: t.backgroundColor, kind: "color", tokenGroup: "surface" },
    { key: "borderColor", label: t.borderColor, kind: "color", tokenGroup: "border" },
  ];
}

export function buildTypographyFields(t: InspectorPresetText): InspectorField[] {
  return [
    { key: "fontSize", label: t.fontSize, kind: "length", min: 8, max: 96, step: 1, unit: "px" },
    {
      key: "fontWeight",
      label: t.fontWeight,
      kind: "enum",
      options: [
        { value: "400", label: t.weightRegular },
        { value: "500", label: t.weightMedium },
        { value: "600", label: t.weightSemibold },
        { value: "700", label: t.weightBold },
      ],
    },
    { key: "lineHeight", label: t.lineHeight, kind: "length", min: 1, max: 3, step: 0.05 },
    {
      key: "letterSpacing",
      label: t.letterSpacing,
      kind: "length",
      min: -2,
      max: 8,
      step: 0.1,
      unit: "px",
    },
    {
      key: "textAlign",
      label: t.textAlign,
      kind: "enum",
      options: [
        { value: "left", label: t.textAlignLeft },
        { value: "center", label: t.textAlignCenter },
        { value: "right", label: t.textAlignRight },
        { value: "justify", label: t.textAlignJustify },
      ],
    },
  ];
}

export function buildBorderFields(t: InspectorPresetText): InspectorField[] {
  return [
    {
      key: "borderWidth",
      label: t.borderWidth,
      kind: "length",
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
    },
    {
      key: "borderStyle",
      label: t.borderStyle,
      kind: "enum",
      options: [
        { value: "solid", label: t.strokeSolid },
        { value: "dashed", label: t.strokeDashed },
        { value: "dotted", label: t.strokeDotted },
        { value: "none", label: t.strokeNone },
      ],
    },
    {
      key: "borderRadius",
      label: t.borderRadius,
      kind: "length",
      min: 0,
      max: 64,
      step: 1,
      unit: "px",
    },
  ];
}

export function buildEffectsFields(t: InspectorPresetText): InspectorField[] {
  return [
    { key: "opacity", label: t.opacity, kind: "length", min: 0, max: 1, step: 0.05 },
    {
      key: "boxShadow",
      label: t.boxShadow,
      kind: "enum",
      display: "select",
      options: [
        { value: "none", label: t.shadowNone },
        { value: "sm", label: t.shadowSm },
        { value: "md", label: t.shadowMd },
        { value: "lg", label: t.shadowLg },
        { value: "xl", label: t.shadowXl },
      ],
    },
    {
      key: "overflow",
      label: t.overflow,
      kind: "enum",
      options: [
        { value: "visible", label: t.overflowVisible },
        { value: "hidden", label: t.overflowHidden },
        { value: "auto", label: t.overflowAuto },
      ],
    },
    { key: "hidden", label: t.hiddenElement, kind: "toggle" },
  ];
}

/** 按给定文案造出五类预设分区。 */
export function buildInspectorSections(t: InspectorPresetText): InspectorSection[] {
  return [
    { id: "layout", label: t.sectionLayout, fields: buildLayoutFields(t) },
    { id: "color", label: t.sectionColor, fields: buildColorFields(t) },
    { id: "typography", label: t.sectionTypography, fields: buildTypographyFields(t) },
    { id: "border", label: t.sectionBorder, fields: buildBorderFields(t) },
    { id: "effects", label: t.sectionEffects, fields: buildEffectsFields(t) },
  ];
}

const ZH_PRESETS = zhCN.components!.inspectorPanel!.presets;

// 中文默认形态：没包 ConfigProvider 时的兜底，也保持这几个具名导出对老代码可用。
export const layoutFields: InspectorField[] = buildLayoutFields(ZH_PRESETS);
export const colorFields: InspectorField[] = buildColorFields(ZH_PRESETS);
export const typographyFields: InspectorField[] = buildTypographyFields(ZH_PRESETS);
export const borderFields: InspectorField[] = buildBorderFields(ZH_PRESETS);
export const effectsFields: InspectorField[] = buildEffectsFields(ZH_PRESETS);

const PRESET_SECTIONS: InspectorSection[] = buildInspectorSections(ZH_PRESETS);

/**
 * 取内置预设分类。不传取全部（layout / color / typography / border / effects）；
 * 传了就按**传入顺序**返回命中的那几类，未知 id 静默忽略。
 *
 * `text` 不传时用中文预设 —— 组件内部会把当前语言的字典传进来。
 */
export function inspectorSections(
  categories?: readonly string[],
  text: InspectorPresetText = ZH_PRESETS,
): InspectorSection[] {
  const sections = text === ZH_PRESETS ? PRESET_SECTIONS : buildInspectorSections(text);
  if (!categories) return sections.map((section) => ({ ...section }));
  const found: InspectorSection[] = [];
  for (const id of categories) {
    const preset = sections.find((section) => section.id === id);
    if (preset) found.push({ ...preset });
  }
  return found;
}
