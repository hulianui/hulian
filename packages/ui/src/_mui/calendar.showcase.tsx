"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Calendar } from "./calendar";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03");
  return <Calendar value={v} onValueChange={setV} />;
}

export const calendarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "非受控；传入 ISO 字符串作默认选中日。",
      code: `<Calendar defaultValue="2026-06-15" />`,
      render: () => <Calendar defaultValue="2026-06-15" />,
    },
    {
      title: "受控",
      description: "对外受控值为 ISO 字符串，onValueChange 回传 ISO 或 null。",
      code: `const [date, setDate] = useState<string | null>("2026-06-03");

<Calendar value={date} onValueChange={setDate} />`,
      render: () => <Calendar defaultValue="2026-06-03" />,
    },
    {
      title: "限定可选范围",
      description: "minDate / maxDate 之外的日期不可选。",
      code: `<Calendar
  defaultValue="2026-06-15"
  minDate="2026-06-10"
  maxDate="2026-06-20"
/>`,
      render: () => <Calendar defaultValue="2026-06-15" minDate="2026-06-10" maxDate="2026-06-20" />,
    },
    {
      title: "只读",
      description: "可查看选中日但不可改动。",
      code: `<Calendar value="2026-06-03" readOnly />`,
      render: () => <Calendar value="2026-06-03" readOnly />,
    },
  ],
  controls: [
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    { name: "带 defaultValue", render: () => <Calendar defaultValue="2026-06-15" /> },
    { name: "只读", render: () => <Calendar value="2026-06-03" readOnly /> },
  ],
  renderWithProps: (p) => (
    <Calendar
      defaultValue="2026-06-03"
      readOnly={p.readOnly === true}
      disabled={p.disabled === true}
    />
  ),
  toCode: (p) =>
    `<Calendar defaultValue="2026-06-03"${p.readOnly ? " readOnly" : ""}${p.disabled ? " disabled" : ""} />`,
};
