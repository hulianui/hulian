"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Code } from "./code";

type Tone = "default" | "primary" | "danger";

export const codeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "行内代码",
      description: "包裹在正文中的短代码 token，整体随行流动。",
      code: `<span className="text-sm text-foreground">
  运行 <Code>pnpm install</Code> 安装依赖
</span>`,
      render: () => (
        <span className="text-sm text-foreground">
          运行 <Code>pnpm install</Code> 安装依赖
        </span>
      ),
    },
    {
      title: "色调变体",
      description: "tone 走语义 token：default / primary / danger。",
      code: `<>
  <Code>const x = 1</Code>
  <Code tone="primary">--filter=www</Code>
  <Code tone="danger">rm -rf</Code>
</>`,
      render: () => (
        <span className="inline-flex flex-wrap items-center gap-2">
          <Code>const x = 1</Code>
          <Code tone="primary">--filter=www</Code>
          <Code tone="danger">rm -rf</Code>
        </span>
      ),
    },
  ],
  controls: [{ prop: "tone", type: "select", options: ["default", "primary", "danger"], defaultValue: "default" }],
  states: [
    { name: "inline", render: () => <span className="text-sm text-foreground">运行 <Code>pnpm install</Code> 安装依赖</span> },
    { name: "primary", render: () => <Code tone="primary">--filter=www</Code> },
    { name: "danger", render: () => <Code tone="danger">rm -rf</Code> },
  ],
  renderWithProps: (p) => <Code tone={(p.tone as Tone) ?? "default"}>const x = 1</Code>,
  toCode: (p) => `<Code${p.tone && p.tone !== "default" ? ` tone="${p.tone}"` : ""}>const x = 1</Code>`,
};
