import type { ColorSwatchInput, NormalizedColorSwatch } from "./color-swatch-picker.types";

// 纯逻辑层：零 React 依赖，让「色值 → 可读名」这条规则可单测，也供消费方复用。

/**
 * 把 `colors` 的混合数组统一成 `{ color, label }`。
 *
 * - 字符串项 → `label` 取色值本身（保持旧行为：读屏念出裸色值）
 * - 对象项没给 `label` 或给了空白串 → 同样回退到色值
 *
 * `label` 只影响无障碍名与 hover 提示；`color` 始终是选中身份与底色，
 * 所以归一化不会改变 `value` / `onValueChange` 的语义。
 */
export function normalizeSwatches(colors: readonly ColorSwatchInput[]): NormalizedColorSwatch[] {
  return colors.map((entry) => {
    if (typeof entry === "string") return { color: entry, label: entry };
    const label = entry.label?.trim();
    return { color: entry.color, label: label ? label : entry.color };
  });
}
