"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DateRangePicker } from "./date-range-picker";
import type { DateRangeValue } from "./date-range-picker.types";

function Demo({
  presets = true,
  size = "md",
  disabled,
  readOnly,
  initial = null,
}: {
  presets?: boolean;
  size?: "sm" | "md" | "lg";
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
      size={size}
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
      title: "月份区间 / 年份区间",
      description:
        "picker 决定粒度，与 DatePicker 的同名 prop 同义（对标 el-date-picker 的 monthrange）。值形状随之变成 [\"YYYY-MM\"] / [\"YYYY\"]，预设也换成该粒度的常用档；两端仍由组件自己夹，选不出「起点晚于终点」。",
      code: `<DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]} />
<DateRangePicker picker="year" defaultValue={["2024", "2026"]} />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]} />
          <DateRangePicker picker="year" defaultValue={["2024", "2026"]} />
        </div>
      ),
    },
    {
      title: "月份区间的上界",
      description:
        "maxDate 恒按 ISO 日期说话。月粒度下判的是「整月都超界才禁」，所以写今天即可得到「当月可选、未来月灰掉」——运营点右面板拿到明年某月那个坑就是这么堵的。",
      code: `<DateRangePicker picker="month" maxDate="2026-08-14" defaultValue={["2026-05", "2026-08"]} />`,
      render: () => (
        <DateRangePicker picker="month" maxDate="2026-08-14" defaultValue={["2026-05", "2026-08"]} />
      ),
    },
    {
      title: "尺寸",
      description:
        "size 与 Input / Select 共用同一套刻度（sm 32px / md 40px / lg 48px），同一行表单里高度天然对齐。面板里日期格的几何不随之变化。",
      code: `<DateRangePicker size="sm" defaultValue={["2026-06-08", "2026-06-20"]} />
<DateRangePicker size="md" defaultValue={["2026-06-08", "2026-06-20"]} />
<DateRangePicker size="lg" defaultValue={["2026-06-08", "2026-06-20"]} />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker size="sm" defaultValue={["2026-06-08", "2026-06-20"]} />
          <DateRangePicker size="md" defaultValue={["2026-06-08", "2026-06-20"]} />
          <DateRangePicker size="lg" defaultValue={["2026-06-08", "2026-06-20"]} />
        </div>
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
    {
      prop: "size",
      type: "select",
      options: ["sm", "md", "lg"],
      defaultValue: "md",
      label: "尺寸",
    },
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
    {
      name: "月份区间(picker=month)",
      render: () => <DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]} />,
    },
    {
      name: "年份区间(picker=year)",
      render: () => <DateRangePicker picker="year" defaultValue={["2024", "2026"]} />,
    },
    { name: "小号", render: () => <Demo size="sm" initial={["2026-06-08", "2026-06-20"]} /> },
    { name: "大号", render: () => <Demo size="lg" initial={["2026-06-08", "2026-06-20"]} /> },
    { name: "禁用", render: () => <Demo disabled initial={["2026-06-01", "2026-06-15"]} /> },
  ],
  renderWithProps: (p) => (
    <Demo
      presets={p.presets !== false}
      size={(p.size as "sm" | "md" | "lg") ?? "md"}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<DateRangePicker\n  value={range}\n  onValueChange={setRange}${p.presets === false ? "\n  presets={false}" : ""}${p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}\n/>`,
};
