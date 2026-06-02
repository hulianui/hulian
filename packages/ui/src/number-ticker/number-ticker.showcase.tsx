"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { NumberTicker } from "./number-ticker";

export const numberTickerShowcase: ShowcaseSpec = {
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
