"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Code } from "../../../../packages/ui/src/code/code";
type Tone = "default" | "primary" | "danger";
export const codeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Inline code",
            description: "The short code token wrapped in the text flows as a whole.",
            code: `<span className="text-sm text-foreground">
  Run <Code>pnpm install</Code> to install dependencies
</span>`,
            render: () => (<span className="text-sm text-foreground">
          Run <Code>pnpm install</Code> Install dependencies
        </span>),
        },
        {
            title: "Shade Variants",
            description: "tone uses semantics token: default / primary / danger.",
            code: `<>
  <Code>const x = 1</Code>
  <Code tone="primary">--filter=www</Code>
  <Code tone="danger">rm -rf</Code>
</>`,
            render: () => (<span className="inline-flex flex-wrap items-center gap-2">
          <Code>const x = 1</Code>
          <Code tone="primary">--filter=www</Code>
          <Code tone="danger">rm -rf</Code>
        </span>),
        },
    ],
    controls: [{ prop: "tone", type: "select", options: ["default", "primary", "danger"], defaultValue: "default" }],
    states: [
        { name: "inline", render: () => <span className="text-sm text-foreground">Run <Code>pnpm install</Code> Install dependencies</span> },
        { name: "primary", render: () => <Code tone="primary">--filter=www</Code> },
        { name: "danger", render: () => <Code tone="danger">rm -rf</Code> },
    ],
    renderWithProps: (p) => <Code tone={(p.tone as Tone) ?? "default"}>const x = 1</Code>,
    toCode: (p) => `<Code${p.tone && p.tone !== "default" ? ` tone="${p.tone}"` : ""}>const x = 1</Code>`,
};
