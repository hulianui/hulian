"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Slider } from "./slider";

export const sliderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "defaultValue 设初始值，拖动滑块取值。",
      code: `<Slider defaultValue={40} className="w-64" />`,
      render: () => <Slider defaultValue={40} className="w-64" />,
    },
    {
      title: "显示数值",
      description: "showValue 在轨道上方读出当前值。",
      code: `<Slider defaultValue={60} showValue className="w-64" />`,
      render: () => <Slider defaultValue={60} showValue className="w-64" />,
    },
    {
      title: "区间选择",
      description: "defaultValue 传数组自动变为双滑块区间选择。",
      code: `<Slider defaultValue={[25, 75]} showValue className="w-64" />`,
      render: () => <Slider defaultValue={[25, 75]} showValue className="w-64" />,
    },
    {
      title: "步进",
      description: "step 控制最小步长，这里每档 10。",
      code: `<Slider defaultValue={50} step={10} showValue className="w-64" />`,
      render: () => <Slider defaultValue={50} step={10} showValue className="w-64" />,
    },
    {
      title: "禁用",
      description: "disabled 锁定滑块，整体降透明度。",
      code: `<Slider defaultValue={40} disabled className="w-64" />`,
      render: () => <Slider defaultValue={40} disabled className="w-64" />,
    },
  ],
  controls: [
    { prop: "value", type: "number", defaultValue: 40, label: "value" },
    { prop: "min", type: "number", defaultValue: 0, label: "min" },
    { prop: "max", type: "number", defaultValue: 100, label: "max" },
    { prop: "step", type: "number", defaultValue: 1, label: "step" },
    { prop: "showValue", type: "boolean", defaultValue: true, label: "显示数值" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Slider defaultValue={40} className="w-64" /> },
    { name: "showValue", render: () => <Slider defaultValue={60} showValue className="w-64" /> },
    { name: "range", render: () => <Slider defaultValue={[25, 75]} showValue className="w-64" /> },
    { name: "step=10", render: () => <Slider defaultValue={50} step={10} className="w-64" /> },
    { name: "disabled", render: () => <Slider defaultValue={40} disabled className="w-64" /> },
  ],
  renderWithProps: (p) => (
    <Slider
      defaultValue={p.value as number}
      min={p.min as number}
      max={p.max as number}
      step={p.step as number}
      showValue={p.showValue as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Slider defaultValue={${p.value}} min={${p.min}} max={${p.max}} step={${p.step}}${
      p.showValue ? " showValue" : ""
    }${p.disabled ? " disabled" : ""} />`,
};
