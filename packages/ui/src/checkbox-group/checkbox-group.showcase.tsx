"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { CheckboxGroup } from "./checkbox-group";
import { Checkbox } from "../checkbox";

function Controlled(p: Record<string, unknown>) {
  const [v, setV] = useState<string[]>(["apple"]);
  return (
    <CheckboxGroup
      value={v}
      onValueChange={setV}
      disabled={p.disabled as boolean}
      orientation={(p.orientation as "vertical" | "horizontal") ?? "vertical"}
    >
      <Checkbox value="apple" label="苹果" />
      <Checkbox value="banana" label="香蕉" />
      <Checkbox value="cherry" label="樱桃" />
    </CheckboxGroup>
  );
}

export const checkboxGroupShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "子项为瑚琏 Checkbox（各带 value），组按 value 匹配成员。",
      code: `<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" label="苹果" />
  <Checkbox value="banana" label="香蕉" />
  <Checkbox value="cherry" label="樱桃" />
</CheckboxGroup>`,
      render: () => (
        <CheckboxGroup defaultValue={["apple"]}>
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
          <Checkbox value="cherry" label="樱桃" />
        </CheckboxGroup>
      ),
    },
    {
      title: "横向排列",
      description: "orientation=horizontal 横排并自动换行。",
      code: `<CheckboxGroup defaultValue={["apple"]} orientation="horizontal">
  <Checkbox value="apple" label="苹果" />
  <Checkbox value="banana" label="香蕉" />
  <Checkbox value="cherry" label="樱桃" />
</CheckboxGroup>`,
      render: () => (
        <CheckboxGroup defaultValue={["apple"]} orientation="horizontal">
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
          <Checkbox value="cherry" label="樱桃" />
        </CheckboxGroup>
      ),
    },
    {
      title: "整组禁用",
      description: "disabled 下发到组内全部 Checkbox。",
      code: `<CheckboxGroup defaultValue={["banana"]} disabled>
  <Checkbox value="apple" label="苹果" />
  <Checkbox value="banana" label="香蕉" />
</CheckboxGroup>`,
      render: () => (
        <CheckboxGroup defaultValue={["banana"]} disabled>
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
        </CheckboxGroup>
      ),
    },
  ],
  controls: [
    {
      prop: "orientation",
      type: "select",
      options: ["vertical", "horizontal"],
      defaultValue: "vertical",
      label: "方向",
    },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "default",
      render: () => (
        <CheckboxGroup defaultValue={["apple"]}>
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
          <Checkbox value="cherry" label="樱桃" />
        </CheckboxGroup>
      ),
    },
    {
      name: "横排",
      render: () => (
        <CheckboxGroup defaultValue={["apple"]} orientation="horizontal">
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
          <Checkbox value="cherry" label="樱桃" />
        </CheckboxGroup>
      ),
    },
    {
      name: "disabled",
      render: () => (
        <CheckboxGroup defaultValue={["banana"]} disabled>
          <Checkbox value="apple" label="苹果" />
          <Checkbox value="banana" label="香蕉" />
        </CheckboxGroup>
      ),
    },
  ],
  renderWithProps: (p) => <Controlled {...p} />,
  toCode: () =>
    `<CheckboxGroup defaultValue={["apple"]}>\n  <Checkbox value="apple" label="苹果" />\n  <Checkbox value="banana" label="香蕉" />\n</CheckboxGroup>`,
};
