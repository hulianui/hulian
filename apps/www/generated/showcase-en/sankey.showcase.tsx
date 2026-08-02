import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Sankey } from "../../../../packages/ui/src/sankey/sankey";
import type { SankeyLink, SankeyNode } from "../../../../packages/ui/src/sankey/sankey.types";
const dispatchNodes: SankeyNode[] = [
    { id: "text", label: "Text generation", tone: "var(--color-chart-1)" },
    { id: "code", label: "Code Task", tone: "var(--color-chart-2)" },
    { id: "image", label: "Image Task", tone: "var(--color-chart-3)" },
    { id: "router", label: "Smart Router", tone: "var(--color-primary)" },
    { id: "haiku", label: "Haiku Pool", tone: "var(--color-chart-4)" },
    { id: "sonnet", label: "Sonnet pool", tone: "var(--color-chart-5)" },
    { id: "opus", label: "Opus pool", tone: "var(--color-chart-1)" },
];
const dispatchLinks: SankeyLink[] = [
    { source: "text", target: "router", value: 42 },
    { source: "code", target: "router", value: 28 },
    { source: "image", target: "router", value: 16 },
    { source: "router", target: "haiku", value: 38 },
    { source: "router", target: "sonnet", value: 30 },
    { source: "router", target: "opus", value: 18 },
];
const budgetNodes: SankeyNode[] = [
    { id: "budget", label: "Monthly Budget", tone: "var(--color-primary)" },
    { id: "infer", label: "Reasoning", tone: "var(--color-chart-2)" },
    { id: "embed", label: "Vector search", tone: "var(--color-chart-3)" },
    { id: "tool", label: "Tool call", tone: "var(--color-chart-4)" },
    { id: "anthropic", label: "Anthropic", tone: "var(--color-chart-1)" },
    { id: "deepseek", label: "DeepSeek", tone: "var(--color-chart-5)" },
];
const budgetLinks: SankeyLink[] = [
    { source: "budget", target: "infer", value: 60 },
    { source: "budget", target: "embed", value: 25 },
    { source: "budget", target: "tool", value: 15 },
    { source: "infer", target: "anthropic", value: 40 },
    { source: "infer", target: "deepseek", value: 20 },
    { source: "embed", target: "deepseek", value: 25 },
    { source: "tool", target: "anthropic", value: 15 },
];
function Frame({ children }: {
    children: ReactNode;
}) {
    return (<div className="w-full rounded-[calc(var(--radius)+0.25rem)] border border-border bg-surface p-4">
      {children}
    </div>);
}
export const sankeyShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "nodes/links is controlled; when layer is not given, the topology is automatically layered according to links (source layer < target layer), and the flow width is based on value proportion. per-node tone eats the token variable.",
            code: `<Sankey
  nodes={[
    { id: "text", label: "Text generation", tone: "var(--color-chart-1)" },
    { id: "code", label: "Code Task", tone: "var(--color-chart-2)" },
    { id: "router", label: "Smart Router", tone: "var(--color-primary)" },
    { id: "haiku", label: "Haiku Pool", tone: "var(--color-chart-4)" },
    { id: "sonnet", label: "Sonnet pool", tone: "var(--color-chart-5)" },
  ]}
  links={[
    { source: "text", target: "router", value: 42 },
    { source: "code", target: "router", value: 28 },
    { source: "router", target: "haiku", value: 38 },
    { source: "router", target: "sonnet", value: 30 },
  ]}
  height={300}
/>`,
            render: () => (<Frame>
          <Sankey nodes={dispatchNodes} links={dispatchLinks} height={300}/>
        </Frame>),
        },
        {
            title: "Item by item tooltip",
            description: "renderTooltip distinguishes two types of hover targets: node / link. Follow the pointer to display details.",
            code: `<Sankey
  nodes={nodes}
  links={links}
  height={300}
  renderTooltip={(item) =>
    item.type === "node" ? (
      <span>{item.node.label}</span>
    ) : (
      <span>{item.link.source} \u2192 {item.link.target}: {item.link.value}</span>
    )
  }
/>`,
            render: () => (<Frame>
          <Sankey nodes={dispatchNodes} links={dispatchLinks} height={300} renderTooltip={(item) => item.type === "node" ? (<span>{item.node.label}</span>) : (<span>
                  {item.link.source} → {item.link.target}:{item.link.value}
                </span>)}/>
        </Frame>),
        },
        {
            title: "Bold node strips + flow adjustment with transparency",
            description: "nodeWidth enlarges the width of the node rectangle, linkOpacity adjusts the transparency of the flow band stroke.",
            code: `<Sankey
  nodes={nodes}
  links={links}
  height={300}
  nodeWidth={24}
  linkOpacity={0.5}
/>`,
            render: () => (<Frame>
          <Sankey nodes={budgetNodes} links={budgetLinks} height={300} nodeWidth={24} linkOpacity={0.5}/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "nodeWidth", type: "number", defaultValue: 16, label: "Node width" },
        { prop: "linkOpacity", type: "number", defaultValue: 0.35, label: "Flow band transparency" },
    ],
    states: [
        {
            name: "Scheduling flow direction (task type \u2192 router \u2192 executor pool \u00B7 three layers)",
            render: () => (<Frame>
          <Sankey nodes={dispatchNodes} links={dispatchLinks} height={300} renderTooltip={(item) => item.type === "node" ? (<span>{item.node.label}</span>) : (<span>
                  {item.link.source} → {item.link.target}:{item.link.value}
                </span>)}/>
        </Frame>),
        },
        {
            name: "Budget Allocation (Budget \u2192 Capability Area \u2192 Supplier)",
            render: () => (<Frame>
          <Sankey nodes={budgetNodes} links={budgetLinks} height={300}/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <Sankey nodes={dispatchNodes} links={dispatchLinks} height={300} nodeWidth={p.nodeWidth as number} linkOpacity={p.linkOpacity as number}/>
    </Frame>),
    toCode: (p) => `<Sankey
  nodes={[
    { id: "text", label: "Text generation", tone: "var(--color-chart-1)" },
    { id: "router", label: "Smart Router", tone: "var(--color-primary)" },
    { id: "haiku", label: "Haiku Pool", tone: "var(--color-chart-4)" },
  ]}
  links={[
    { source: "text", target: "router", value: 42 },
    { source: "router", target: "haiku", value: 38 },
  ]}
  height={300}
  nodeWidth={${p.nodeWidth}}
  linkOpacity={${p.linkOpacity}}
/>`,
};
