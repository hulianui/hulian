"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Calendar } from "./calendar";

function Demo() {
  const [v, setV] = useState<string | null>("2026-06-03");
  return <Calendar value={v} onValueChange={setV} />;
}

export const calendarShowcase: ShowcaseSpec = {
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
