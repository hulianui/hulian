"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Progress } from "../progress";
import { Segmented } from "../segmented";
import { Switch } from "../switch";
import { Tag } from "../tag";
import { AccentScope } from "./accent-scope";

const HUES = [
  { value: "258", label: "瑚琏蓝" },
  { value: "165", label: "青玉" },
  { value: "300", label: "紫檀" },
  { value: "25", label: "珊瑚" },
  { value: "70", label: "琥珀" },
];

function Sample() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>主操作</Button>
      <Button variant="soft">次操作</Button>
      <Tag tone="brand">标签</Tag>
      <Switch defaultChecked aria-label="开关" />
      <Progress value={64} className="w-32" aria-label="进度" />
    </div>
  );
}

function HuePicker() {
  const [hue, setHue] = useState("165");
  return (
    <AccentScope hue={Number(hue)} transition={600} className="space-y-4">
      <Segmented items={HUES} value={hue} onValueChange={setHue} aria-label="色相" />
      <Sample />
    </AccentScope>
  );
}

export const accentScopeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "局部换色相",
      description: "子树里的主色、hover、浅底、浅边、焦点环与图表色板一起换色相，明度彩度沿用品牌梯子。",
      code: `<AccentScope hue={165}>
  <Button>主操作</Button>
  <Tag tone="brand">标签</Tag>
</AccentScope>`,
      render: () => (
        <AccentScope hue={165}>
          <Sample />
        </AccentScope>
      ),
    },
    {
      title: "过渡换色",
      description: "transition 给色相变量挂过渡，整棵子树同步渐变；色相由状态驱动。",
      code: `const [hue, setHue] = useState(165);

<AccentScope hue={hue} transition={600}>
  …
</AccentScope>`,
      render: () => <HuePicker />,
    },
  ],
  controls: [{ prop: "hue", type: "number", defaultValue: 300, label: "色相" }],
  states: [
    { name: "品牌原色（258）", render: () => <AccentScope hue={258}><Sample /></AccentScope> },
    { name: "青玉（165）", render: () => <AccentScope hue={165}><Sample /></AccentScope> },
    { name: "珊瑚（25）", render: () => <AccentScope hue={25}><Sample /></AccentScope> },
  ],
  renderWithProps: (p) => (
    <AccentScope hue={p.hue as number}>
      <Sample />
    </AccentScope>
  ),
  toCode: (p) => `<AccentScope hue={${p.hue}}>
  <Button>主操作</Button>
</AccentScope>`,
};
