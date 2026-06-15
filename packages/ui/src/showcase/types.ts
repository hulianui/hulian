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
 * 一个「用法场景」示例（Vant 式：标题 + 说明 + 代码 + 活预览）。
 * code 与 render 必须一一对应——code 是用户可复制的 JSX，render 是其活预览。
 */
export interface ExampleSpec {
  title: string; // 场景名，如 "基础用法" / "尺寸" / "禁用态"
  description?: string; // 一句话场景说明（可选）
  code: string; // 可复制的 JSX 代码串
  render: () => ReactNode; // 与 code 对应的活预览
}

/**
 * 组件四件套里 *.showcase.tsx 的统一规格。
 * controls 为手写（非 TS 自动抽取），供 <Playground> 渲染。
 * examples 为「用法」场景（文档站主展示，Vant 式代码+活预览）；缺省时文档站回退用 states。
 */
export interface ShowcaseSpec {
  controls: Control[];
  states: StateSpec[];
  examples?: ExampleSpec[];
  renderWithProps: (props: Record<string, unknown>) => ReactNode;
  toCode: (props: Record<string, unknown>) => string;
}
