"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { NumberTicker } from "./number-ticker";

export const numberTickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "进入视口后从 0 滚动到目标值，自动千分位。",
      code: `<NumberTicker value={12345} className="text-4xl font-semibold" />`,
      render: () => <NumberTicker value={12345} className="text-4xl font-semibold" />,
    },
    {
      title: "小数位",
      description: "decimalPlaces 控制小数位数，适合百分比 / 金额。",
      code: `<NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />`,
      render: () => <NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />,
    },
    {
      title: "向下计数",
      description: "startValue 大于 value 时自然向下滚动，无需额外方向参数。",
      code: `<NumberTicker startValue={100} value={0} className="text-4xl font-semibold" />`,
      render: () => <NumberTicker startValue={100} value={0} className="text-4xl font-semibold" />,
    },
    {
      title: "起始值与时长",
      description: "startValue 设定滚动起点，duration 拉长动画节奏。",
      code: `<NumberTicker startValue={1000} value={8888} duration={2.4} className="text-4xl font-semibold" />`,
      render: () => (
        <NumberTicker startValue={1000} value={8888} duration={2.4} className="text-4xl font-semibold" />
      ),
    },
  ],
  controls: [
    { prop: "value", type: "number", defaultValue: 1234 },
    { prop: "startValue", type: "number", defaultValue: 0 },
    { prop: "decimalPlaces", type: "number", defaultValue: 0 },
    { prop: "duration", type: "number", defaultValue: 1.2 },
  ],
  states: [
    { name: "整数千分位", render: () => <NumberTicker value={12345} className="text-4xl font-semibold" /> },
    {
      name: "百分比（1 位小数）",
      render: () => <NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />,
    },
    { name: "向下计数", render: () => <NumberTicker startValue={100} value={0} className="text-4xl font-semibold" /> },
  ],
  renderWithProps: (p) => (
    <NumberTicker
      value={p.value as number}
      startValue={p.startValue as number}
      decimalPlaces={p.decimalPlaces as number}
      duration={p.duration as number}
      className="text-4xl font-semibold"
    />
  ),
  toCode: (p) => `<NumberTicker value={${p.value}} decimalPlaces={${p.decimalPlaces}} />`,
};
