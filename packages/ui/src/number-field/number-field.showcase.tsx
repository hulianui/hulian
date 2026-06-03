"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { NumberField } from "./number-field";

function Controlled(p: Record<string, unknown>) {
  const [v, setV] = useState<number | null>(2);
  return (
    <NumberField aria-label="数量" value={v} onValueChange={setV} disabled={p.disabled as boolean} min={0} max={10} />
  );
}

export const numberFieldShowcase: ShowcaseSpec = {
  controls: [{ prop: "disabled", type: "boolean", defaultValue: false }],
  states: [
    { name: "default", render: () => <NumberField aria-label="数量" defaultValue={3} /> },
    { name: "min-max(0-5)", render: () => <NumberField aria-label="数量" defaultValue={0} min={0} max={5} /> },
    { name: "step=5", render: () => <NumberField aria-label="步长5" defaultValue={10} step={5} /> },
    { name: "disabled", render: () => <NumberField aria-label="数量" defaultValue={3} disabled /> },
  ],
  renderWithProps: (p) => <Controlled {...p} />,
  toCode: (p) => `<NumberField defaultValue={3}${p.disabled ? " disabled" : ""} />`,
};
