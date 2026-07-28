export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
  /** 视觉尺寸，默认 md（轨道 40×24，与加这个 prop 之前逐像素一致）。 */
  size?: "sm" | "md" | "lg";
  /**
   * 扩出一块不可见的 ≥44px 命中区（只影响命中，不占布局、不改视觉）。
   * 移动端建议开：md 轨道只有 24px 高，低于触控目标推荐值。
   * 默认关，因为它会向上下各溢出约 10px，紧密排布的桌面表单里可能压到相邻控件。
   */
  touchTarget?: boolean;
}
