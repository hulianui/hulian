"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ThinkingBlock } from "./thinking-block";

const body =
  "用户要把首页做成 100% dogfood。先看现有 page.tsx 用了哪些组件，再核对库里有哪些可替换的排版/布局原语，最后逐块替换并补缺口。";

export const thinkingBlockShowcase: ShowcaseSpec = {
  controls: [
    { prop: "title", type: "text", defaultValue: "思考过程" },
    { prop: "thinking", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "已完成（可展开）",
      render: () => (
        <div className="w-full max-w-lg">
          <ThinkingBlock duration="思考 3s">{body}</ThinkingBlock>
        </div>
      ),
    },
    {
      name: "思考中（转圈 + 高光 + 默认展开）",
      render: () => (
        <div className="w-full max-w-lg">
          <ThinkingBlock thinking>{body}</ThinkingBlock>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-lg">
      <ThinkingBlock title={p.title as string} thinking={p.thinking as boolean}>
        {body}
      </ThinkingBlock>
    </div>
  ),
  toCode: (p) =>
    `<ThinkingBlock${p.thinking ? " thinking" : ""}>{reasoning}</ThinkingBlock>`,
};
