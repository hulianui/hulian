"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { NumberField } from "./number-field";

function Controlled(p: Record<string, unknown>) {
  const [v, setV] = useState<number | null>(2);
  return (
    <NumberField aria-label="数量" value={v} onValueChange={setV} disabled={p.disabled as boolean} min={0} max={10} />
  );
}

export const numberFieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "±按钮步进，输入框可直接键入，支持键盘 ↑↓。",
      code: `<NumberField aria-label="数量" defaultValue={3} />`,
      render: () => <NumberField aria-label="数量" defaultValue={3} />,
    },
    {
      title: "范围限制",
      description: "min/max 约束取值，到达边界对应按钮自动禁用。",
      code: `<NumberField aria-label="数量" defaultValue={0} min={0} max={5} />`,
      render: () => <NumberField aria-label="数量" defaultValue={0} min={0} max={5} />,
    },
    {
      title: "步长",
      description: "step 设置每次增减量，这里每步 5。",
      code: `<NumberField aria-label="步长5" defaultValue={10} step={5} />`,
      render: () => <NumberField aria-label="步长5" defaultValue={10} step={5} />,
    },
    {
      title: "禁用",
      description: "disabled 锁定整个控件。",
      code: `<NumberField aria-label="数量" defaultValue={3} disabled />`,
      render: () => <NumberField aria-label="数量" defaultValue={3} disabled />,
    },
  ],
  controls: [{ prop: "disabled", type: "boolean", defaultValue: false }],
  states: [
    { name: "default", render: () => <NumberField aria-label="数量" defaultValue={3} /> },
    { name: "min-max(0-5)", render: () => <NumberField aria-label="数量" defaultValue={0} min={0} max={5} /> },
    { name: "step=5", render: () => <NumberField aria-label="步长5" defaultValue={10} step={5} /> },
    { name: "disabled", render: () => <NumberField aria-label="数量" defaultValue={3} disabled /> },
  ],
  renderWithProps: (p) => <Controlled {...p} />,
  toCode: (p) => `<NumberField defaultValue={3}${p.disabled ? " disabled" : ""} />`,
};
