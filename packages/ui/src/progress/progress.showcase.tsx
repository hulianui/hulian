"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Progress } from "./progress";

export const progressShowcase: ShowcaseSpec = {
  controls: [
    { prop: "value", type: "number", defaultValue: 40, label: "value" },
    { prop: "max", type: "number", defaultValue: 100, label: "max" },
    {
      prop: "variant",
      type: "select",
      options: ["linear", "circular"],
      defaultValue: "linear",
      label: "形态",
    },
    {
      prop: "tone",
      type: "select",
      options: ["primary", "danger"],
      defaultValue: "primary",
      label: "色调",
    },
    { prop: "showValue", type: "boolean", defaultValue: false, label: "显示数值" },
    { prop: "indeterminate", type: "boolean", defaultValue: false, label: "不定态" },
  ],
  states: [
    { name: "linear 25%", render: () => <Progress value={25} className="w-64" /> },
    { name: "linear 60% + 数值", render: () => <Progress value={60} showValue className="w-64" /> },
    { name: "linear 100%", render: () => <Progress value={100} className="w-64" /> },
    {
      name: "linear danger 90%",
      render: () => <Progress value={90} tone="danger" showValue className="w-64" />,
    },
    { name: "linear 不定态", render: () => <Progress className="w-64" /> },
    { name: "circular 75% + 数值", render: () => <Progress variant="circular" value={75} showValue /> },
    {
      name: "circular danger 40%",
      render: () => <Progress variant="circular" value={40} tone="danger" showValue />,
    },
    { name: "circular 不定态", render: () => <Progress variant="circular" /> },
  ],
  renderWithProps: (p) => {
    const indeterminate = p.indeterminate as boolean;
    return (
      <Progress
        value={indeterminate ? undefined : (p.value as number)}
        max={p.max as number}
        variant={p.variant as "linear" | "circular"}
        tone={p.tone as "primary" | "danger"}
        showValue={p.showValue as boolean}
        className={p.variant === "circular" ? undefined : "w-64"}
      />
    );
  },
  toCode: (p) => {
    const indeterminate = p.indeterminate as boolean;
    const valueAttr = indeterminate ? "" : ` value={${p.value}}`;
    const variantAttr = p.variant === "circular" ? ` variant="circular"` : "";
    const toneAttr = p.tone === "danger" ? ` tone="danger"` : "";
    return `<Progress${variantAttr}${valueAttr}${toneAttr}${p.showValue ? " showValue" : ""} />`;
  },
};
