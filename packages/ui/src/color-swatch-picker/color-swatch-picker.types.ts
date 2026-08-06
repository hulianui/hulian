export type SwatchSize = "sm" | "md" | "lg";

/**
 * 带可读名的色块项。
 * `color` 是选中身份与底色（任意 CSS 颜色串），`label` 是读屏与 hover 提示读到的人读名。
 */
export interface ColorSwatchItem {
  color: string;
  /** 缺省回退到 `color` 本身。token 色（`var(--color-primary)`）请务必给，否则读屏念变量名。 */
  label?: string;
}

/** `colors` 单项：裸色值串，或带可读名的对象。 */
export type ColorSwatchInput = string | ColorSwatchItem;

/** `normalizeSwatches` 的产物：`label` 已补齐，可直接喂 `aria-label` / `title`。 */
export interface NormalizedColorSwatch {
  color: string;
  label: string;
}

export interface ColorSwatchPickerProps {
  /**
   * 预设色块列表。字符串项 = 任意 CSS 颜色串（hex / rgb / hsl / 具名色 / `var(--color-x)`）；
   * 对象项 `{ color, label }` 可另给可读名，作为该色块的 `aria-label` 与 hover 提示。
   *
   * 两种形态可混写。**语义 token 色必须给 `label`**：`var(--color-primary)` 直接当无障碍名
   * 会被读屏原样念成变量名，对屏幕阅读器用户毫无意义。
   */
  colors: readonly ColorSwatchInput[];
  /** 受控选中值（须与某个色块的 `color` 严格相等）。 */
  value?: string;
  /** 非受控初始选中值。 */
  defaultValue?: string;
  /** 选中变更回调，参数始终是色块的 `color` 字符串（不是 `label`）。 */
  onValueChange?: (color: string) => void;
  /** 色块尺寸，默认 md。 */
  size?: SwatchSize;
  /** 整组禁用。 */
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}
