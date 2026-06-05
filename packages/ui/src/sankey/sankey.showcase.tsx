import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Sankey } from "./sankey";
import type { SankeyLink, SankeyNode } from "./sankey.types";

// 调度流向：任务类型 → 路由器 → 执行器池（三层）。
const dispatchNodes: SankeyNode[] = [
  { id: "text", label: "文本生成", tone: "var(--chart-1)" },
  { id: "code", label: "代码任务", tone: "var(--chart-2)" },
  { id: "image", label: "图像任务", tone: "var(--chart-3)" },
  { id: "router", label: "智能路由器", tone: "var(--primary)" },
  { id: "haiku", label: "Haiku 池", tone: "var(--chart-4)" },
  { id: "sonnet", label: "Sonnet 池", tone: "var(--chart-5)" },
  { id: "opus", label: "Opus 池", tone: "var(--chart-1)" },
];

const dispatchLinks: SankeyLink[] = [
  { source: "text", target: "router", value: 42 },
  { source: "code", target: "router", value: 28 },
  { source: "image", target: "router", value: 16 },
  { source: "router", target: "haiku", value: 38 },
  { source: "router", target: "sonnet", value: 30 },
  { source: "router", target: "opus", value: 18 },
];

// 预算分配：总预算 → 各能力域 → 模型供应商。
const budgetNodes: SankeyNode[] = [
  { id: "budget", label: "月度预算", tone: "var(--primary)" },
  { id: "infer", label: "推理", tone: "var(--chart-2)" },
  { id: "embed", label: "向量检索", tone: "var(--chart-3)" },
  { id: "tool", label: "工具调用", tone: "var(--chart-4)" },
  { id: "anthropic", label: "Anthropic", tone: "var(--chart-1)" },
  { id: "deepseek", label: "DeepSeek", tone: "var(--chart-5)" },
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

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-[calc(var(--radius)+0.25rem)] border border-border bg-surface p-4">
      {children}
    </div>
  );
}

export const sankeyShowcase: ShowcaseSpec = {
  controls: [
    { prop: "nodeWidth", type: "number", defaultValue: 16, label: "节点宽" },
    { prop: "linkOpacity", type: "number", defaultValue: 0.35, label: "流带透明度" },
  ],
  states: [
    {
      name: "调度流向（任务类型 → 路由器 → 执行器池 · 三层）",
      render: () => (
        <Frame>
          <Sankey
            nodes={dispatchNodes}
            links={dispatchLinks}
            height={300}
            renderTooltip={(item) =>
              item.type === "node" ? (
                <span>{item.node.label}</span>
              ) : (
                <span>
                  {item.link.source} → {item.link.target}：{item.link.value}
                </span>
              )
            }
          />
        </Frame>
      ),
    },
    {
      name: "预算分配（预算 → 能力域 → 供应商）",
      render: () => (
        <Frame>
          <Sankey nodes={budgetNodes} links={budgetLinks} height={300} />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <Sankey
        nodes={dispatchNodes}
        links={dispatchLinks}
        height={300}
        nodeWidth={p.nodeWidth as number}
        linkOpacity={p.linkOpacity as number}
      />
    </Frame>
  ),
  toCode: (p) => `<Sankey
  nodes={[
    { id: "text", label: "文本生成", tone: "var(--chart-1)" },
    { id: "router", label: "智能路由器", tone: "var(--primary)" },
    { id: "haiku", label: "Haiku 池", tone: "var(--chart-4)" },
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
