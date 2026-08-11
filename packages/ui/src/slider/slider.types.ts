import type { SliderRoot } from "@base-ui/react/slider";

// 透传 Base UI Root（非泛型，默认联合类型 number | readonly number[]，数组 value 自动走 range）。
export interface SliderProps
  extends Omit<SliderRoot.Props, "className" | "render" | "children"> {
  /** Root wrapper className（简化为 string，覆盖 Base UI 的 string|fn 形态）。 */
  className?: string;
  /** 在轨道上方显示当前数值读出（Slider.Value）。 */
  showValue?: boolean;
  /**
   * 滑块手柄的无障碍名。省略时自动取 Root 的 `aria-label`——单手柄场景通常不必传。
   *
   * range（value 为数组）两个手柄用同一个名字，读屏听起来是两个一模一样的滑块，此时传
   * 二元组分别命名（典型是「最低价 / 最高价」）。
   */
  thumbAriaLabel?: string | [string, string];
}
