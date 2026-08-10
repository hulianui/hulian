import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 实现早就在往下展开 rest，此前只是类型把口封死了（#157）。
 */
export interface ElasticSliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /**
   * 初始值（非受控）。组件内部维护数值，拖动时更新。默认 50。
   * 仅在挂载与该 prop 变化时同步进内部 state（对齐 React Bits 原行为）。
   */
  defaultValue?: number;
  /**
   * 量程下界（轨道最左对应的数值），默认 0。
   */
  startingValue?: number;
  /**
   * 量程上界（轨道最右对应的数值），默认 100。
   */
  maxValue?: number;
  /**
   * 是否吸附到步长（拖动时按 stepSize 取整），默认 false。
   */
  isStepped?: boolean;
  /**
   * 吸附步长，仅 isStepped 为 true 时生效，默认 1。
   */
  stepSize?: number;
  /**
   * 左侧图标（轨道左端），默认音量减号 lucide 图标。
   * 拖动越界到最左时会随回弹做位移 + 放大动效。
   */
  leftIcon?: ReactNode;
  /**
   * 右侧图标（轨道右端），默认音量加号 lucide 图标。
   * 拖动越界到最右时会随回弹做位移 + 放大动效。
   */
  rightIcon?: ReactNode;
  /**
   * 是否显示当前值数字指示（轨道上方居中），默认 true。
   */
  showValue?: boolean;
  /**
   * 拖动产生新值时回调，便于消费方接管/上报数值。
   */
  onValueChange?: (value: number) => void;
  /**
   * 透传到根容器的额外 className（merge via cn）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
