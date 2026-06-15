"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DatePicker } from "./date-picker";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03");
  return <DatePicker label="选择日期" value={v} onValueChange={setV} />;
}

export const datePickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点击输入框弹出日历选择日期。",
      code: `<DatePicker label="选择日期" defaultValue="2026-06-03" />`,
      render: () => <DatePicker label="选择日期" defaultValue="2026-06-03" />,
    },
    {
      title: "受控",
      description: "对外受控值为 ISO 字符串，onValueChange 回传 ISO 或 null。",
      code: `const [date, setDate] = useState<string | null>("2026-06-03");

<DatePicker label="选择日期" value={date} onValueChange={setDate} />`,
      render: () => <DatePicker label="选择日期" defaultValue="2026-06-03" />,
    },
    {
      title: "限定可选范围",
      description: "minDate / maxDate 之外的日期在弹出日历中不可选。",
      code: `<DatePicker
  label="到期日"
  defaultValue="2026-06-15"
  minDate="2026-06-10"
  maxDate="2026-06-20"
/>`,
      render: () => (
        <DatePicker label="到期日" defaultValue="2026-06-15" minDate="2026-06-10" maxDate="2026-06-20" />
      ),
    },
    {
      title: "禁用",
      description: "整体置灰，不可打开也不可编辑。",
      code: `<DatePicker label="选择日期" value="2026-06-03" disabled />`,
      render: () => <DatePicker label="选择日期" value="2026-06-03" disabled />,
    },
  ],
  controls: [
    { prop: "label", type: "text", defaultValue: "选择日期", label: "标签" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    { name: "带 defaultValue", render: () => <DatePicker label="到期日" defaultValue="2026-06-15" /> },
    { name: "禁用", render: () => <DatePicker label="选择日期" value="2026-06-03" disabled /> },
  ],
  renderWithProps: (p) => (
    <DatePicker
      label={typeof p.label === "string" ? p.label : "选择日期"}
      defaultValue="2026-06-03"
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<DatePicker label="${p.label ?? "选择日期"}" defaultValue="2026-06-03"${p.disabled ? " disabled" : ""}${p.readOnly ? " readOnly" : ""} />`,
};
