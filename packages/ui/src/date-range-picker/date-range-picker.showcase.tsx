"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DateRangePicker } from "./date-range-picker";
import type { DateRangeValue } from "./date-range-picker.types";

function Demo({
  presets = true,
  disabled,
  readOnly,
  initial = null,
}: {
  presets?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  initial?: DateRangeValue | null;
}) {
  const [v, setV] = useState<DateRangeValue | null>(initial);
  return (
    <DateRangePicker
      value={v}
      onValueChange={setV}
      presets={presets}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
}

export const dateRangePickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点击触发器弹出双月日历，依次选起止两端确定区间。",
      code: `<DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]} />`,
      render: () => <DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]} />,
    },
    {
      title: "受控",
      description: "对外受控值为 [start, end]（ISO YYYY-MM-DD），清空回传 null。",
      code: `const [range, setRange] = useState<DateRangeValue | null>(["2026-06-08", "2026-06-20"]);

<DateRangePicker value={range} onValueChange={setRange} />`,
      render: () => <DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]} />,
    },
    {
      title: "无快捷预设",
      description: "presets={false} 隐藏左侧「今天 / 最近 7 天…」预设栏。",
      code: `<DateRangePicker defaultValue={["2026-06-03", "2026-06-09"]} presets={false} />`,
      render: () => <DateRangePicker defaultValue={["2026-06-03", "2026-06-09"]} presets={false} />,
    },
    {
      title: "限定范围 + 禁用周末",
      description: "minDate / maxDate 框定可选区间，disabledDate 进一步禁选某些天。",
      code: `<DateRangePicker
  defaultValue={["2026-06-10", "2026-06-12"]}
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }}
/>`,
      render: () => (
        <DateRangePicker
          defaultValue={["2026-06-10", "2026-06-12"]}
          minDate="2026-06-01"
          maxDate="2026-06-30"
          disabledDate={(iso) => {
            const day = new Date(iso + "T00:00:00").getDay();
            return day === 0 || day === 6;
          }}
        />
      ),
    },
    {
      title: "禁用",
      description: "整体置灰，触发器不可打开。",
      code: `<DateRangePicker defaultValue={["2026-06-01", "2026-06-15"]} disabled />`,
      render: () => <DateRangePicker defaultValue={["2026-06-01", "2026-06-15"]} disabled />,
    },
  ],
  controls: [
    { prop: "presets", type: "boolean", defaultValue: true, label: "快捷预设" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "带默认区间", render: () => <Demo initial={["2026-06-08", "2026-06-20"]} /> },
    {
      name: "限定范围(min/max + 禁用周末)",
      render: () => (
        <DateRangePicker
          defaultValue={["2026-06-10", "2026-06-12"]}
          minDate="2026-06-01"
          maxDate="2026-06-30"
          disabledDate={(iso) => {
            const day = new Date(iso + "T00:00:00").getDay();
            return day === 0 || day === 6;
          }}
        />
      ),
    },
    { name: "无预设", render: () => <Demo presets={false} initial={["2026-06-03", "2026-06-09"]} /> },
    { name: "禁用", render: () => <Demo disabled initial={["2026-06-01", "2026-06-15"]} /> },
  ],
  renderWithProps: (p) => (
    <Demo presets={p.presets !== false} disabled={p.disabled === true} readOnly={p.readOnly === true} />
  ),
  toCode: (p) =>
    `<DateRangePicker\n  value={range}\n  onValueChange={setRange}${p.presets === false ? "\n  presets={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}\n/>`,
};
