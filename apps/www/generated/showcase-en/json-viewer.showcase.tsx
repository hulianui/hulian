"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { JsonViewer } from "../../../../packages/ui/src/json-viewer/json-viewer";
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
                        function: { name: "get_weather", arguments: "{\"city\":\"Hangzhou\"}" },
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
            title: "Basic usage",
            description: "Pass data to render the foldable JSON tree, and expand the first layer by default.",
            code: `<JsonViewer data={response} />`,
            render: () => (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE}/>
        </div>),
        },
        {
            title: "Control initial expansion depth",
            description: "defaultExpandedDepth controls the initial expansion level (root direct child node depth=1).",
            code: `<JsonViewer data={response.usage} defaultExpandedDepth={3} />`,
            render: () => (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE.usage} defaultExpandedDepth={3}/>
        </div>),
        },
        {
            title: "Copy node path",
            description: "onCopyPath Returns the node JSON path when copying on hover; rootName determines the path prefix (e.g. $.response.usage).",
            code: `<JsonViewer
  data={response}
  rootName="response"
  onCopyPath={(path) => console.log(path)}
/>`,
            render: () => (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE} rootName="response"/>
        </div>),
        },
    ],
    controls: [
        { prop: "defaultExpandedDepth", type: "number", defaultValue: 1, label: "Initial expansion depth" },
    ],
    states: [
        {
            name: "chat completion Response",
            render: () => (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE}/>
        </div>),
        },
        {
            name: "Full Expand",
            render: () => (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
          <JsonViewer data={SAMPLE.usage} defaultExpandedDepth={3}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-3">
      <JsonViewer data={SAMPLE} defaultExpandedDepth={Number(p.defaultExpandedDepth) || 1}/>
    </div>),
    toCode: (p) => `<JsonViewer data={response} defaultExpandedDepth={${Number(p.defaultExpandedDepth) || 1}} />`,
};
