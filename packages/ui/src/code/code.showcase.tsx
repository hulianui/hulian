"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Code } from "./code";

type Tone = "default" | "primary" | "danger";

export const codeShowcase: ShowcaseSpec = {
  controls: [{ prop: "tone", type: "select", options: ["default", "primary", "danger"], defaultValue: "default" }],
  states: [
    { name: "inline", render: () => <span className="text-sm text-foreground">运行 <Code>pnpm install</Code> 安装依赖</span> },
    { name: "primary", render: () => <Code tone="primary">--filter=www</Code> },
    { name: "danger", render: () => <Code tone="danger">rm -rf</Code> },
  ],
  renderWithProps: (p) => <Code tone={(p.tone as Tone) ?? "default"}>const x = 1</Code>,
  toCode: (p) => `<Code${p.tone && p.tone !== "default" ? ` tone="${p.tone}"` : ""}>const x = 1</Code>`,
};
