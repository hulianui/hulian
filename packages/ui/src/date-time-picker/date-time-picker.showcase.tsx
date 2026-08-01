"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DateTimePicker } from "./date-time-picker";

function Demo({
  withSeconds,
  minuteStep,
  disabled,
  readOnly,
  clearable = true,
  showNow = true,
  initial = null,
}: {
  withSeconds?: boolean;
  minuteStep?: number;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  showNow?: boolean;
  initial?: string | null;
}) {
  const [v, setV] = useState<string | null>(initial);
  return (
    <DateTimePicker
      value={v}
      onValueChange={setV}
      withSeconds={withSeconds}
      minuteStep={minuteStep}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
      showNow={showNow}
      aria-label="选择日期时间"
    />
  );
}

export const dateTimePickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "左边一整块日历、右边时间列，两边各选各的互不干扰。对外值是定宽文本 YYYY-MM-DD HH:mm，字典序即时间序。",
      code: `<DateTimePicker defaultValue="2026-06-08 09:30" />`,
      render: () => <DateTimePicker defaultValue="2026-06-08 09:30" aria-label="选择日期时间" />,
    },
    {
      title: "带秒 + 步进",
      description: "withSeconds 加出秒列；minuteStep / secondStep 控制列粒度（常用 5 / 15 / 30）。",
      code: `<DateTimePicker withSeconds minuteStep={15} defaultValue="2026-06-08 09:30:00" />`,
      render: () => (
        <DateTimePicker withSeconds minuteStep={15} defaultValue="2026-06-08 09:30:00" aria-label="选择日期时间" />
      ),
    },
    {
      title: "限定区间",
      description:
        "minDateTime / maxDateTime 是**日期时间整体**的边界：日期部分限制日历，时间部分只在压着边界的那一天生效 —— 区间内部的日子 24 小时全开。",
      code: `<DateTimePicker
  defaultValue="2026-06-10 12:00"
  minDateTime="2026-06-08 09:30"
  maxDateTime="2026-06-20 18:00"
/>`,
      render: () => (
        <DateTimePicker
          defaultValue="2026-06-10 12:00"
          minDateTime="2026-06-08 09:30"
          maxDateTime="2026-06-20 18:00"
          aria-label="选择日期时间"
        />
      ),
    },
    {
      title: "自定义显示格式",
      description: "displayFormat 只改触发器上的显示，对外值形状不变。",
      code: `<DateTimePicker defaultValue="2026-06-08 09:30" displayFormat="M 月 D 日 HH:mm" />`,
      render: () => (
        <DateTimePicker
          defaultValue="2026-06-08 09:30"
          displayFormat="M 月 D 日 HH:mm"
          aria-label="选择日期时间"
        />
      ),
    },
    {
      title: "禁用 / 只读",
      description: "disabled 整体置灰且打不开；readOnly 能看面板但选不动。",
      code: `<DateTimePicker defaultValue="2026-06-08 09:30" disabled />
<DateTimePicker defaultValue="2026-06-08 09:30" readOnly />`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <DateTimePicker defaultValue="2026-06-08 09:30" disabled aria-label="禁用" />
          <DateTimePicker defaultValue="2026-06-08 09:30" readOnly aria-label="只读" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "withSeconds", type: "boolean", defaultValue: false, label: "显示秒" },
    {
      prop: "minuteStep",
      type: "select",
      options: ["1", "5", "15", "30"],
      defaultValue: "1",
      label: "分钟步进",
    },
    { prop: "clearable", type: "boolean", defaultValue: true, label: "可清除" },
    { prop: "showNow", type: "boolean", defaultValue: true, label: "此刻快捷" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "带默认值", render: () => <Demo initial="2026-06-08 09:30" /> },
    { name: "带秒 + 15 分步进", render: () => <Demo withSeconds minuteStep={15} initial="2026-06-08 09:30:00" /> },
    {
      name: "限定区间",
      render: () => (
        <DateTimePicker
          defaultValue="2026-06-10 12:00"
          minDateTime="2026-06-08 09:30"
          maxDateTime="2026-06-20 18:00"
          aria-label="选择日期时间"
        />
      ),
    },
    { name: "禁用", render: () => <Demo disabled initial="2026-06-08 09:30" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      withSeconds={p.withSeconds === true}
      minuteStep={Number(p.minuteStep ?? 1) || 1}
      clearable={p.clearable !== false}
      showNow={p.showNow !== false}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<DateTimePicker\n  value={dateTime}\n  onValueChange={setDateTime}${p.withSeconds ? "\n  withSeconds" : ""}${
      p.minuteStep && p.minuteStep !== "1" ? `\n  minuteStep={${p.minuteStep}}` : ""
    }${p.clearable === false ? "\n  clearable={false}" : ""}${p.showNow === false ? "\n  showNow={false}" : ""}${
      p.disabled ? "\n  disabled" : ""
    }${p.readOnly ? "\n  readOnly" : ""}\n/>`,
};
