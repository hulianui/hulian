"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DateTimePicker } from "./date-time-picker";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03T14:30:00");
  return <DateTimePicker label="选择日期时间" value={v} onValueChange={setV} />;
}

export const dateTimePickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "一体弹层同时选「年月日 + 时间」，24 小时制。",
      code: `<DateTimePicker label="选择日期时间" defaultValue="2026-06-03T14:30:00" />`,
      render: () => <DateTimePicker label="选择日期时间" defaultValue="2026-06-03T14:30:00" />,
    },
    {
      title: "受控",
      description: "对外受控值为含日期+时间的 ISO 字符串。",
      code: `const [dt, setDt] = useState<string | null>("2026-06-03T14:30:00");

<DateTimePicker label="选择日期时间" value={dt} onValueChange={setDt} />`,
      render: () => <DateTimePicker label="选择日期时间" defaultValue="2026-06-03T14:30:00" />,
    },
    {
      title: "分钟步进",
      description: "minutesStep 约束分钟列的步进（如预约场景 15 分钟一档）。",
      code: `<DateTimePicker label="预约时间" defaultValue="2026-06-15T09:00:00" minutesStep={15} />`,
      render: () => <DateTimePicker label="预约时间" defaultValue="2026-06-15T09:00:00" minutesStep={15} />,
    },
    {
      title: "精确到秒",
      description: "withSeconds 启用秒列，格式变为 YYYY-MM-DD HH:mm:ss。",
      code: `<DateTimePicker label="时间戳" defaultValue="2026-06-15T09:00:30" withSeconds />`,
      render: () => <DateTimePicker label="时间戳" defaultValue="2026-06-15T09:00:30" withSeconds />,
    },
    {
      title: "禁用",
      description: "整体置灰，不可打开也不可编辑。",
      code: `<DateTimePicker label="选择日期时间" value="2026-06-03T14:30:00" disabled />`,
      render: () => <DateTimePicker label="选择日期时间" value="2026-06-03T14:30:00" disabled />,
    },
  ],
  controls: [
    { prop: "label", type: "text", defaultValue: "选择日期时间", label: "标签" },
    { prop: "withSeconds", type: "boolean", defaultValue: false, label: "精确到秒" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    {
      name: "带 defaultValue",
      render: () => <DateTimePicker label="开始时间" defaultValue="2026-06-15T09:00:00" />,
    },
    {
      name: "15 分钟步进",
      render: () => <DateTimePicker label="预约时间" defaultValue="2026-06-15T09:00:00" minutesStep={15} />,
    },
    {
      name: "精确到秒",
      render: () => <DateTimePicker label="时间戳" defaultValue="2026-06-15T09:00:30" withSeconds />,
    },
    { name: "禁用", render: () => <DateTimePicker label="选择日期时间" value="2026-06-03T14:30:00" disabled /> },
  ],
  renderWithProps: (p) => (
    <DateTimePicker
      label={typeof p.label === "string" ? p.label : "选择日期时间"}
      defaultValue="2026-06-03T14:30:00"
      withSeconds={p.withSeconds === true}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<DateTimePicker label="${p.label ?? "选择日期时间"}" defaultValue="2026-06-03T14:30:00"${p.withSeconds ? " withSeconds" : ""}${p.disabled ? " disabled" : ""}${p.readOnly ? " readOnly" : ""} />`,
};
