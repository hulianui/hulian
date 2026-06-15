"use client";
import { useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Sparkles, Globe } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Toggle, ToggleGroup } from "./toggle";

function SingleToggle(p: Record<string, unknown>) {
  const [on, setOn] = useState(false);
  return (
    <Toggle
      pressed={on}
      onPressedChange={setOn}
      variant={(p.variant as "default" | "outline" | "pill") ?? "default"}
      disabled={p.disabled as boolean}
      aria-label="bold"
    >
      <Bold className="size-4" />
    </Toggle>
  );
}

export const toggleShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单个 Toggle 是可切换的按下态按钮，defaultPressed 设初始选中。",
      code: `<>
  <Toggle aria-label="加粗"><Bold className="size-4" /></Toggle>
  <Toggle defaultPressed aria-label="加粗"><Bold className="size-4" /></Toggle>
</>`,
      render: () => (
        <div className="flex gap-2">
          <Toggle aria-label="加粗"><Bold className="size-4" /></Toggle>
          <Toggle defaultPressed aria-label="加粗"><Bold className="size-4" /></Toggle>
        </div>
      ),
    },
    {
      title: "单选组",
      description: "ToggleGroup 默认互斥单选，适合对齐方式这类切换。",
      code: `<ToggleGroup defaultValue={["center"]}>
  <Toggle value="left" aria-label="左对齐"><AlignLeft className="size-4" /></Toggle>
  <Toggle value="center" aria-label="居中"><AlignCenter className="size-4" /></Toggle>
  <Toggle value="right" aria-label="右对齐"><AlignRight className="size-4" /></Toggle>
</ToggleGroup>`,
      render: () => (
        <ToggleGroup defaultValue={["center"]}>
          <Toggle value="left" aria-label="左对齐"><AlignLeft className="size-4" /></Toggle>
          <Toggle value="center" aria-label="居中"><AlignCenter className="size-4" /></Toggle>
          <Toggle value="right" aria-label="右对齐"><AlignRight className="size-4" /></Toggle>
        </ToggleGroup>
      ),
    },
    {
      title: "多选组",
      description: "加 multiple 让组内多项可同时按下，适合富文本样式。",
      code: `<ToggleGroup multiple defaultValue={["bold", "italic"]}>
  <Toggle value="bold" aria-label="加粗"><Bold className="size-4" /></Toggle>
  <Toggle value="italic" aria-label="斜体"><Italic className="size-4" /></Toggle>
  <Toggle value="underline" aria-label="下划线"><Underline className="size-4" /></Toggle>
</ToggleGroup>`,
      render: () => (
        <ToggleGroup multiple defaultValue={["bold", "italic"]}>
          <Toggle value="bold" aria-label="加粗"><Bold className="size-4" /></Toggle>
          <Toggle value="italic" aria-label="斜体"><Italic className="size-4" /></Toggle>
          <Toggle value="underline" aria-label="下划线"><Underline className="size-4" /></Toggle>
        </ToggleGroup>
      ),
    },
    {
      title: "变体",
      description: "default 软底 / outline 主色实心 / pill 圆角 chip（AI 工具栏开关风）。",
      code: `<>
  <Toggle defaultPressed aria-label="default"><Bold className="size-4" /></Toggle>
  <Toggle variant="outline" defaultPressed aria-label="outline"><Bold className="size-4" /></Toggle>
  <Toggle variant="pill" size="sm" defaultPressed aria-label="深度思考">
    <Sparkles className="size-3.5" /> 深度思考
  </Toggle>
</>`,
      render: () => (
        <div className="flex items-center gap-2">
          <Toggle defaultPressed aria-label="default"><Bold className="size-4" /></Toggle>
          <Toggle variant="outline" defaultPressed aria-label="outline"><Bold className="size-4" /></Toggle>
          <Toggle variant="pill" size="sm" defaultPressed aria-label="深度思考">
            <Sparkles className="size-3.5" /> 深度思考
          </Toggle>
        </div>
      ),
    },
    {
      title: "禁用",
      description: "disabled 锁定按钮，按下态也可禁用。",
      code: `<Toggle disabled defaultPressed aria-label="加粗"><Bold className="size-4" /></Toggle>`,
      render: () => (
        <Toggle disabled defaultPressed aria-label="加粗"><Bold className="size-4" /></Toggle>
      ),
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["default", "outline", "pill"], defaultValue: "default" },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "off", render: () => <Toggle aria-label="bold"><Bold className="size-4" /></Toggle> },
    { name: "on", render: () => <Toggle defaultPressed aria-label="bold"><Bold className="size-4" /></Toggle> },
    {
      name: "group-single",
      render: () => (
        <ToggleGroup defaultValue={["center"]}>
          <Toggle value="left" aria-label="左对齐"><AlignLeft className="size-4" /></Toggle>
          <Toggle value="center" aria-label="居中"><AlignCenter className="size-4" /></Toggle>
          <Toggle value="right" aria-label="右对齐"><AlignRight className="size-4" /></Toggle>
        </ToggleGroup>
      ),
    },
    {
      name: "group-multiple",
      render: () => (
        <ToggleGroup multiple defaultValue={["bold", "italic"]}>
          <Toggle value="bold" aria-label="加粗"><Bold className="size-4" /></Toggle>
          <Toggle value="italic" aria-label="斜体"><Italic className="size-4" /></Toggle>
          <Toggle value="underline" aria-label="下划线"><Underline className="size-4" /></Toggle>
        </ToggleGroup>
      ),
    },
    { name: "disabled", render: () => <Toggle disabled defaultPressed aria-label="bold"><Bold className="size-4" /></Toggle> },
    {
      name: "pill（AI 工具栏开关）",
      render: () => (
        <div className="flex gap-2">
          <Toggle variant="pill" size="sm" defaultPressed aria-label="深度思考">
            <Sparkles className="size-3.5" /> 深度思考
          </Toggle>
          <Toggle variant="pill" size="sm" aria-label="智能搜索">
            <Globe className="size-3.5" /> 智能搜索
          </Toggle>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <SingleToggle {...p} />,
  toCode: (p) =>
    `<Toggle${p.variant && p.variant !== "default" ? ` variant="${p.variant}"` : ""}${p.disabled ? " disabled" : ""}>\n  <Bold />\n</Toggle>`,
};
