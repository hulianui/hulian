"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DateTimePicker } from "./date-time-picker";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03T14:30:00");
  return <DateTimePicker label="选择日期时间" value={v} onValueChange={setV} />;
}

export const dateTimePickerShowcase: ShowcaseSpec = {
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
