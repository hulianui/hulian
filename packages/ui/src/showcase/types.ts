import type { ReactNode } from "react";

export type ControlType = "text" | "select" | "boolean" | "number";

export interface Control {
  prop: string;
  type: ControlType;
  options?: string[]; // for select
  defaultValue: string | number | boolean;
  label?: string;
}

export interface StateSpec {
  name: string; // default / hover / disabled / loading / ...
  render: () => ReactNode;
}

/**
 * 组件四件套里 *.showcase.tsx 的统一规格。
 * controls 为手写（非 TS 自动抽取），供 <Playground> 渲染。
 */
export interface ShowcaseSpec {
  controls: Control[];
  states: StateSpec[];
  renderWithProps: (props: Record<string, unknown>) => ReactNode;
  toCode: (props: Record<string, unknown>) => string;
}
