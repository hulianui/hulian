import type { SliderRoot } from "@base-ui-components/react/slider";

// 透传 Base UI Root（非泛型，默认联合类型 number | readonly number[]，数组 value 自动走 range）。
export interface SliderProps
  extends Omit<SliderRoot.Props, "className" | "render" | "children"> {
  /** Root wrapper className（简化为 string，覆盖 Base UI 的 string|fn 形态）。 */
  className?: string;
  /** 在轨道上方显示当前数值读出（Slider.Value）。 */
  showValue?: boolean;
}
