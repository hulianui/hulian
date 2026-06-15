"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { JsonViewer } from "./json-viewer";

const SAMPLE = {
  id: "chatcmpl-9hk2f7",
  object: "chat.completion",
  model: "claude-opus-4-7",
  created: 1749100800,
  choices: [
    {
      index: 0,
      finish_reason: "tool_calls",
      message: {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_a1",
            type: "function",
            function: { name: "get_weather", arguments: '{"city":"杭州"}' },
          },
        ],
      },
    },
  ],
  usage: { prompt_tokens: 128, completion_tokens: 42, total_tokens: 170, cost_usd: 0.00169 },
};

export const jsonViewerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传 data 即渲染可折叠 JSON 树，默认展开第一层。",
      code: `<JsonViewer data={response} />`,
      render: () => (
        <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE} />
        </div>
      ),
    },
    {
      title: "控制初始展开深度",
      description: "defaultExpandedDepth 控制初始展开层级（根直接子节点 depth=1）。",
      code: `<JsonViewer data={response.usage} defaultExpandedDepth={3} />`,
      render: () => (
        <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE.usage} defaultExpandedDepth={3} />
        </div>
      ),
    },
    {
      title: "复制节点路径",
      description: "onCopyPath 在悬停复制时回传节点 JSON path；rootName 决定 path 前缀（如 $.response.usage）。",
      code: `<JsonViewer
  data={response}
  rootName="response"
  onCopyPath={(path) => console.log(path)}
/>`,
      render: () => (
        <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE} rootName="response" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "defaultExpandedDepth", type: "number", defaultValue: 1, label: "初始展开深度" },
  ],
  states: [
    {
      name: "chat completion 响应",
      render: () => (
        <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE} />
        </div>
      ),
    },
    {
      name: "全展开",
      render: () => (
        <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE.usage} defaultExpandedDepth={3} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
      <JsonViewer data={SAMPLE} defaultExpandedDepth={Number(p.defaultExpandedDepth) || 1} />
    </div>
  ),
  toCode: (p) =>
    `<JsonViewer data={response} defaultExpandedDepth={${Number(p.defaultExpandedDepth) || 1}} />`,
};
