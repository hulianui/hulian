"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ToolCall } from "../../../../packages/ui/src/tool-call/tool-call";
import { CodeBlock } from "../../../../packages/ui/src/code-block";
export const toolCallShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Tool name + status point, expand to see parameters and results.",
            code: `<ToolCall
  name="search_web"
  status="success"
  defaultOpen
  input={<CodeBlock lang="json" code={'{ "query": "Hulian Design System" }'} />}
  output="3 related results found, consolidated."
/>`,
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="search_web" status="success" defaultOpen input={<CodeBlock lang="json" code={"{ \"query\": \"Hulian Design System\" }"}/>} output="Found 3 related results, summarized."/>
        </div>),
        },
        {
            title: "Running",
            description: "running is displayed, the status will display Spinner.",
            code: `<ToolCall name="run_code" status="running" />`,
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="run_code" status="running"/>
        </div>),
        },
        {
            title: "Failure status",
            description: "error The status point turns red, expand to see the error details.",
            code: `<ToolCall
  name="fetch_url"
  status="error"
  defaultOpen
  output="Timeout: 30s No response."
/>`,
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="fetch_url" status="error" defaultOpen output="Timeout: 30s No response."/>
        </div>),
        },
        {
            title: "Waiting",
            description: "pending means it has been queued but not yet executed.",
            code: `<ToolCall name="send_email" status="pending" />`,
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="send_email" status="pending"/>
        </div>),
        },
    ],
    controls: [
        { prop: "name", type: "text", defaultValue: "search_web" },
        {
            prop: "status",
            type: "select",
            options: ["pending", "running", "success", "error"],
            defaultValue: "success",
        },
    ],
    states: [
        {
            name: "Completed (expand to see parameters/results)",
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="search_web" status="success" defaultOpen input={<CodeBlock lang="json" code={"{ \"query\": \"Hulian Design System\" }"}/>} output="Found 3 related results, summarized."/>
        </div>),
        },
        {
            name: "Running",
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="run_code" status="running"/>
        </div>),
        },
        {
            name: "failed",
            render: () => (<div className="w-full max-w-lg">
          <ToolCall name="fetch_url" status="error" defaultOpen output="Timeout: 30s No response."/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-lg">
      <ToolCall name={p.name as string} status={p.status as "pending" | "running" | "success" | "error"} defaultOpen input={"{ \"q\": 1 }"} output="ok"/>
    </div>),
    toCode: (p) => `<ToolCall name="${p.name}" status="${p.status}" input={\u2026} output={\u2026} />`,
};
