"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { RadioGroup, Radio } from "./radio";
import { Field } from "../field/field";

function RadioPlayground(p: Record<string, unknown>) {
  const [value, setValue] = useState("standard");
  return (
    <RadioGroup
      value={value}
      onValueChange={setValue}
      orientation={p.orientation as "vertical" | "horizontal"}
      disabled={p.disabled as boolean}
      aria-label="plan"
    >
      <Radio value="standard" label="标准" />
      <Radio value="pro" label="专业" />
      <Radio value="max" label="旗舰" />
    </RadioGroup>
  );
}

export const radioShowcase: ShowcaseSpec = {
  controls: [
    { prop: "orientation", type: "select", options: ["vertical", "horizontal"], defaultValue: "vertical", label: "排列" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    {
      name: "vertical",
      render: () => (
        <RadioGroup defaultValue="b" aria-label="v">
          <Radio value="a" label="选项一" />
          <Radio value="b" label="选项二" />
          <Radio value="c" label="选项三(禁用)" disabled />
        </RadioGroup>
      ),
    },
    {
      name: "horizontal",
      render: () => (
        <RadioGroup orientation="horizontal" defaultValue="m" aria-label="h">
          <Radio value="m" label="男" />
          <Radio value="f" label="女" />
        </RadioGroup>
      ),
    },
    {
      name: "in-field",
      render: () => (
        <Field label="套餐" error="请选择一个套餐" className="w-72">
          <RadioGroup defaultValue="">
            <Radio value="basic" label="基础版" />
            <Radio value="plus" label="增强版" />
          </RadioGroup>
        </Field>
      ),
    },
  ],
  renderWithProps: (p) => <RadioPlayground {...p} />,
  toCode: (p) =>
    `<RadioGroup orientation="${p.orientation}"${p.disabled ? " disabled" : ""} defaultValue="standard">\n  <Radio value="standard" label="标准" />\n  <Radio value="pro" label="专业" />\n</RadioGroup>`,
};
