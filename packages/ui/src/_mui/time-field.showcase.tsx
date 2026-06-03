"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TimeField } from "./time-field";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03T09:30:00");
  return <TimeField label="选择时间" value={v} onValueChange={setV} />;
}

export const timeFieldShowcase: ShowcaseSpec = {
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
