"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ThinkingBlock } from "./thinking-block";

const body =
  "用户要把首页做成 100% dogfood。先看现有 page.tsx 用了哪些组件，再核对库里有哪些可替换的排版/布局原语，最后逐块替换并补缺口。";

export const thinkingBlockShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "已完成的推理：点击头部展开/收起思维链。",
      code: `<ThinkingBlock duration="思考 3s">
  {reasoning}
</ThinkingBlock>`,
      render: () => (
        <div className="w-full max-w-lg">
          <ThinkingBlock duration="思考 3s">{body}</ThinkingBlock>
        </div>
      ),
    },
    {
      title: "思考中",
      description: "thinking 时标题转圈 + 高光流动，并默认展开。",
      code: `<ThinkingBlock thinking>
  {reasoning}
</ThinkingBlock>`,
      render: () => (
        <div className="w-full max-w-lg">
          <ThinkingBlock thinking>{body}</ThinkingBlock>
        </div>
      ),
    },
    {
      title: "自定义标题",
      description: "title 覆盖默认「思考过程」，duration 标记耗时。",
      code: `<ThinkingBlock title="规划任务拆解" duration="2.4s">
  {reasoning}
</ThinkingBlock>`,
      render: () => (
        <div className="w-full max-w-lg">
          <ThinkingBlock title="规划任务拆解" duration="2.4s">
            {body}
          </ThinkingBlock>
        </div>
      ),
    },
    {
      title: "默认展开",
      description: "defaultOpen 让已完成的块也默认摊开正文。",
      code: `<ThinkingBlock defaultOpen duration="思考 1s">
  {reasoning}
</ThinkingBlock>`,
      render: () => (
        <div className="w-full max-w-lg">
          <ThinkingBlock defaultOpen duration="思考 1s">
            {body}
          </ThinkingBlock>
        </div>
      ),
    },
  ],
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
