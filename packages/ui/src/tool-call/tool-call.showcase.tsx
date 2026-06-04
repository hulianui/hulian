"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ToolCall } from "./tool-call";
import { CodeBlock } from "../code-block";

export const toolCallShowcase: ShowcaseSpec = {
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
      name: "完成（展开看参数/结果）",
      render: () => (
        <div className="w-full max-w-lg">
          <ToolCall
            name="search_web"
            status="success"
            defaultOpen
            input={<CodeBlock lang="json" code={'{ "query": "瑚琏 设计系统" }'} />}
            output="找到 3 条相关结果，已综合。"
          />
        </div>
      ),
    },
    {
      name: "运行中",
      render: () => (
        <div className="w-full max-w-lg">
          <ToolCall name="run_code" status="running" />
        </div>
      ),
    },
    {
      name: "失败",
      render: () => (
        <div className="w-full max-w-lg">
          <ToolCall name="fetch_url" status="error" defaultOpen output="超时：30s 无响应。" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-lg">
      <ToolCall
        name={p.name as string}
        status={p.status as "pending" | "running" | "success" | "error"}
        defaultOpen
        input={'{ "q": 1 }'}
        output="ok"
      />
    </div>
  ),
  toCode: (p) =>
    `<ToolCall name="${p.name}" status="${p.status}" input={…} output={…} />`,
};
