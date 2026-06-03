"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { DatePicker } from "./date-picker";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03");
  return <DatePicker label="选择日期" value={v} onValueChange={setV} />;
}

export const datePickerShowcase: ShowcaseSpec = {
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
