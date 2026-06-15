"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TimeField } from "./time-field";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03T09:30:00");
  return <TimeField label="选择时间" value={v} onValueChange={setV} />;
}

export const timeFieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "纯键盘段编辑的时间输入框，24 小时制（HH:mm），无弹层。",
      code: `<TimeField label="选择时间" defaultValue="2026-06-03T09:30:00" />`,
      render: () => <TimeField label="选择时间" defaultValue="2026-06-03T09:30:00" />,
    },
    {
      title: "受控",
      description: "对外受控值为 ISO 字符串，onValueChange 回传 ISO 或 null。",
      code: `const [time, setTime] = useState<string | null>("2026-06-03T09:30:00");

<TimeField label="选择时间" value={time} onValueChange={setTime} />`,
      render: () => <TimeField label="选择时间" defaultValue="2026-06-03T09:30:00" />,
    },
    {
      title: "只读",
      description: "可查看但不可编辑各时间段。",
      code: `<TimeField label="选择时间" value="2026-06-03T09:30:00" readOnly />`,
      render: () => <TimeField label="选择时间" value="2026-06-03T09:30:00" readOnly />,
    },
    {
      title: "禁用",
      description: "整体置灰，不可编辑。",
      code: `<TimeField label="选择时间" value="2026-06-03T09:30:00" disabled />`,
      render: () => <TimeField label="选择时间" value="2026-06-03T09:30:00" disabled />,
    },
  ],
  controls: [
    { prop: "label", type: "text", defaultValue: "选择时间", label: "标签" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    { name: "带 defaultValue", render: () => <TimeField label="起始时间" defaultValue="2026-06-03T08:00:00" /> },
    { name: "禁用", render: () => <TimeField label="选择时间" value="2026-06-03T09:30:00" disabled /> },
  ],
  renderWithProps: (p) => (
    <TimeField
      label={typeof p.label === "string" ? p.label : "选择时间"}
      defaultValue="2026-06-03T09:30:00"
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<TimeField label="${p.label ?? "选择时间"}" defaultValue="2026-06-03T09:30:00"${p.disabled ? " disabled" : ""}${p.readOnly ? " readOnly" : ""} />`,
};
