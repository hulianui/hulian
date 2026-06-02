"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Switch } from "./switch";

function Controlled(p: Record<string, unknown>) {
  const [on, setOn] = useState(false);
  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      disabled={p.disabled as boolean}
      aria-label="demo"
    />
  );
}

export const switchShowcase: ShowcaseSpec = {
  controls: [{ prop: "disabled", type: "boolean", defaultValue: false }],
  states: [
    { name: "off", render: () => <Switch aria-label="off" /> },
    { name: "on", render: () => <Switch defaultChecked aria-label="on" /> },
    { name: "disabled", render: () => <Switch disabled aria-label="disabled" /> },
    { name: "disabled-on", render: () => <Switch disabled defaultChecked aria-label="disabled-on" /> },
  ],
  renderWithProps: (p) => <Controlled {...p} />,
  toCode: (p) => `<Switch${p.disabled ? " disabled" : ""} />`,
};
