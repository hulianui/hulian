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
