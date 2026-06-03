export type SwatchSize = "sm" | "md" | "lg";

export interface ColorSwatchPickerProps {
  /** 预设色块列表，任意 CSS 颜色串（hex / rgb / hsl / 具名色）。 */
  colors: string[];
  /** 受控选中值（须与 colors 中某项严格相等）。 */
  value?: string;
  /** 非受控初始选中值。 */
  defaultValue?: string;
  /** 选中变更回调。 */
  onValueChange?: (color: string) => void;
  /** 色块尺寸，默认 md。 */
  size?: SwatchSize;
  /** 整组禁用。 */
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}
