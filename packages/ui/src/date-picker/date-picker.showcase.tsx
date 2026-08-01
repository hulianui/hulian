"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DatePicker } from "./date-picker";
import type { CalendarPicker } from "../calendar/calendar.types";

function Demo({
  picker = "date",
  disabled,
  readOnly,
  clearable = true,
  showToday = true,
  initial = null,
}: {
  picker?: CalendarPicker;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  showToday?: boolean;
  initial?: string | null;
}) {
  const [v, setV] = useState<string | null>(initial);
  return (
    <DatePicker
      value={v}
      onValueChange={setV}
      picker={picker}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
      showToday={showToday}
      aria-label="选择日期"
    />
  );
}

export const datePickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点触发器弹出单月日历，选一天即提交并关闭。对外值是 ISO 日期串 YYYY-MM-DD。",
      code: `<DatePicker defaultValue="2026-06-08" />`,
      render: () => <DatePicker defaultValue="2026-06-08" aria-label="选择日期" />,
    },
    {
      title: "选月份 / 选年份",
      description:
        "picker 决定粒度与值形状：month → YYYY-MM，year → YYYY。面板标题可点，逐层上卷到月/年视图。",
      code: `<DatePicker picker="month" defaultValue="2026-06" />
<DatePicker picker="year" defaultValue="2026" />`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <DatePicker picker="month" defaultValue="2026-06" aria-label="选择月份" />
          <DatePicker picker="year" defaultValue="2026" aria-label="选择年份" />
        </div>
      ),
    },
    {
      title: "限定范围 + 禁用周末",
      description: "minDate / maxDate 框定可选区间，disabledDate 进一步逐日禁选。",
      code: `<DatePicker
  defaultValue="2026-06-10"
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }}
/>`,
      render: () => (
        <DatePicker
          defaultValue="2026-06-10"
          minDate="2026-06-01"
          maxDate="2026-06-30"
          aria-label="选择工作日"
          disabledDate={(iso) => {
            const day = new Date(`${iso}T00:00:00`).getDay();
            return day === 0 || day === 6;
          }}
        />
      ),
    },
    {
      title: "自定义显示格式",
      description: "displayFormat 只改触发器上的显示，对外值形状不变。",
      code: `<DatePicker defaultValue="2026-06-08" displayFormat="YYYY 年 M 月 D 日" />`,
      render: () => (
        <DatePicker defaultValue="2026-06-08" displayFormat="YYYY 年 M 月 D 日" aria-label="选择日期" />
      ),
    },
    {
      title: "禁用 / 只读",
      description: "disabled 整体置灰且打不开；readOnly 可以看面板但选不动。",
      code: `<DatePicker defaultValue="2026-06-08" disabled />
<DatePicker defaultValue="2026-06-08" readOnly />`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <DatePicker defaultValue="2026-06-08" disabled aria-label="禁用" />
          <DatePicker defaultValue="2026-06-08" readOnly aria-label="只读" />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "picker",
      type: "select",
      options: ["date", "month", "year"],
      defaultValue: "date",
      label: "粒度",
    },
    { prop: "clearable", type: "boolean", defaultValue: true, label: "可清除" },
    { prop: "showToday", type: "boolean", defaultValue: true, label: "今天快捷" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "带默认值", render: () => <Demo initial="2026-06-08" /> },
    { name: "选月份", render: () => <Demo picker="month" initial="2026-06" /> },
    { name: "选年份", render: () => <Demo picker="year" initial="2026" /> },
    {
      name: "限定范围(min/max + 禁用周末)",
      render: () => (
        <DatePicker
          defaultValue="2026-06-10"
          minDate="2026-06-01"
          maxDate="2026-06-30"
          aria-label="选择工作日"
          disabledDate={(iso) => {
            const day = new Date(`${iso}T00:00:00`).getDay();
            return day === 0 || day === 6;
          }}
        />
      ),
    },
    { name: "禁用", render: () => <Demo disabled initial="2026-06-08" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      picker={(p.picker as CalendarPicker) ?? "date"}
      clearable={p.clearable !== false}
      showToday={p.showToday !== false}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<DatePicker\n  value={date}\n  onValueChange={setDate}${
      p.picker && p.picker !== "date" ? `\n  picker="${p.picker}"` : ""
    }${p.clearable === false ? "\n  clearable={false}" : ""}${
      p.showToday === false ? "\n  showToday={false}" : ""
    }${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}\n/>`,
};
