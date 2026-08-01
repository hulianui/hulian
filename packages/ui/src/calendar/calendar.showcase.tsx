"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Calendar } from "./calendar";
import type { CalendarPicker } from "./calendar.types";

function Demo({
  picker = "date",
  disabled,
  readOnly,
  showToday = true,
  initial = null,
}: {
  picker?: CalendarPicker;
  disabled?: boolean;
  readOnly?: boolean;
  showToday?: boolean;
  initial?: string | null;
}) {
  const [v, setV] = useState<string | null>(initial);
  return (
    <Calendar
      value={v}
      onValueChange={setV}
      picker={picker}
      disabled={disabled}
      readOnly={readOnly}
      showToday={showToday}
    />
  );
}

export const calendarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "常驻月历面板，不带触发器也不带浮层 —— 要「输入框 + 弹层」用 DatePicker，它内部就是这个面板。对外值是 ISO 日期串 YYYY-MM-DD。",
      code: `<Calendar defaultValue="2026-06-08" />`,
      render: () => <Calendar defaultValue="2026-06-08" />,
    },
    {
      title: "选月份 / 选年份",
      description:
        "picker 决定粒度与值形状：month → YYYY-MM，year → YYYY。面板标题可点，逐层上卷到月/年视图。",
      code: `<Calendar picker="month" defaultValue="2026-06" />
<Calendar picker="year" defaultValue="2026" />`,
      render: () => (
        <div className="flex flex-wrap gap-6">
          <Calendar picker="month" defaultValue="2026-06" />
          <Calendar picker="year" defaultValue="2026" />
        </div>
      ),
    },
    {
      title: "限定范围 + 禁用周末",
      description: "minDate / maxDate 框定可选区间，disabledDate 进一步逐日禁选。",
      code: `<Calendar
  defaultValue="2026-06-10"
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }}
/>`,
      render: () => (
        <Calendar
          defaultValue="2026-06-10"
          minDate="2026-06-01"
          maxDate="2026-06-30"
          disabledDate={(iso) => {
            const day = new Date(`${iso}T00:00:00`).getDay();
            return day === 0 || day === 6;
          }}
        />
      ),
    },
    {
      title: "指定初始月份",
      description: "defaultMonth 只决定面板停在哪一屏，与选中值无关 —— 适合「没有值但想从某个月开始看」。",
      code: `<Calendar defaultMonth="2026-09-01" />`,
      render: () => <Calendar defaultMonth="2026-09-01" />,
    },
    {
      title: "禁用 / 只读",
      description: "disabled 连翻页都停掉；readOnly 可以翻页浏览但选不动。",
      code: `<Calendar defaultValue="2026-06-08" disabled />
<Calendar defaultValue="2026-06-08" readOnly />`,
      render: () => (
        <div className="flex flex-wrap gap-6">
          <Calendar defaultValue="2026-06-08" disabled />
          <Calendar defaultValue="2026-06-08" readOnly />
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
        <Calendar
          defaultValue="2026-06-10"
          minDate="2026-06-01"
          maxDate="2026-06-30"
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
      showToday={p.showToday !== false}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<Calendar\n  value={date}\n  onValueChange={setDate}${
      p.picker && p.picker !== "date" ? `\n  picker="${p.picker}"` : ""
    }${p.showToday === false ? "\n  showToday={false}" : ""}${p.disabled ? "\n  disabled" : ""}${
      p.readOnly ? "\n  readOnly" : ""
    }\n/>`,
};
