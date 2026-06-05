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
