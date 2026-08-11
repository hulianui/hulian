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
  examples: [
    {
      title: "基础用法",
      description: "RadioGroup 包裹多个 Radio，单选互斥，默认纵向排列。",
      code: `<RadioGroup defaultValue="b" aria-label="选项">
  <Radio value="a" label="选项一" />
  <Radio value="b" label="选项二" />
  <Radio value="c" label="选项三" />
</RadioGroup>`,
      render: () => (
        <RadioGroup defaultValue="b" aria-label="选项">
          <Radio value="a" label="选项一" />
          <Radio value="b" label="选项二" />
          <Radio value="c" label="选项三" />
        </RadioGroup>
      ),
    },
    {
      title: "横向排列",
      description: "设置 orientation=\"horizontal\" 让选项横向排布。",
      code: `<RadioGroup orientation="horizontal" defaultValue="m" aria-label="性别">
  <Radio value="m" label="男" />
  <Radio value="f" label="女" />
</RadioGroup>`,
      render: () => (
        <RadioGroup orientation="horizontal" defaultValue="m" aria-label="性别">
          <Radio value="m" label="男" />
          <Radio value="f" label="女" />
        </RadioGroup>
      ),
    },
    {
      title: "禁用",
      description: "单个 Radio 加 disabled 禁用某项；整组 disabled 禁用全部。",
      code: `<RadioGroup defaultValue="a" aria-label="套餐">
  <Radio value="a" label="标准" />
  <Radio value="b" label="专业（暂不可选）" disabled />
  <Radio value="c" label="旗舰" />
</RadioGroup>`,
      render: () => (
        <RadioGroup defaultValue="a" aria-label="套餐">
          <Radio value="a" label="标准" />
          <Radio value="b" label="专业（暂不可选）" disabled />
          <Radio value="c" label="旗舰" />
        </RadioGroup>
      ),
    },
    {
      title: "搭配 Field 校验",
      description: "包进 Field 获得标签与错误提示，校验态会传导到圈描边。",
      code: `<Field label="套餐" error="请选择一个套餐" className="w-72">
  <RadioGroup defaultValue="">
    <Radio value="basic" label="基础版" />
    <Radio value="plus" label="增强版" />
  </RadioGroup>
</Field>`,
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
      name: "size=sm（密集界面）",
      render: () => (
        <RadioGroup orientation="horizontal" defaultValue="y" aria-label="sm">
          <Radio value="y" size="sm" label="至今" />
          <Radio value="n" size="sm" label="已结束" labelClassName="text-muted-foreground" />
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
