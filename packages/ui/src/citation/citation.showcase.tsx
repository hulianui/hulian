"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Citation } from "./citation";

export const citationShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "外链 chip",
      description: "序号角标 + 标题 + 来源；有 href 时渲染为新标签页外链。",
      code: `<Citation index={1} title="Base UI 文档" href="https://base-ui.com" source="base-ui.com" />`,
      render: () => (
        <Citation index={1} title="Base UI 文档" href="https://base-ui.com" source="base-ui.com" />
      ),
    },
    {
      title: "正文内联多条",
      description: "在 agent 回答正文里标注信息出处，align-middle 跟随文字基线。",
      code: `<p className="text-sm leading-loose">
  瑚琏的可达性来自 Base UI
  <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com" />
  ，表格能力来自 TanStack
  <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com" />
  。
</p>`,
      render: () => (
        <p className="max-w-lg text-sm leading-loose text-foreground">
          瑚琏的可达性来自 Base UI
          <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com" />
          ，表格能力来自 TanStack
          <Citation
            index={2}
            title="TanStack Table"
            href="https://tanstack.com/table"
            source="tanstack.com"
          />
          。
        </p>
      ),
    },
    {
      title: "无链接（本地来源）",
      description: "省略 href 时渲染为非链接 span，用于内部知识库等无外链来源。",
      code: `<Citation index={3} title="内部知识库笔记" />`,
      render: () => <Citation index={3} title="内部知识库笔记" />,
    },
    {
      title: "无序号",
      description: "省略 index 时不渲染角标，仅标题 + 来源。",
      code: `<Citation title="产品需求文档 v2" source="飞书" />`,
      render: () => <Citation title="产品需求文档 v2" source="飞书" />,
    },
  ],
  controls: [
    { prop: "index", type: "number", defaultValue: 1 },
    { prop: "title", type: "text", defaultValue: "瑚琏设计系统文档" },
    { prop: "source", type: "text", defaultValue: "hulian.dev" },
  ],
  states: [
    {
      name: "外链 + 序号 + 来源",
      render: () => (
        <Citation index={1} title="Base UI 文档" href="https://base-ui.com" source="base-ui.com" />
      ),
    },
    {
      name: "正文内联多条",
      render: () => (
        <p className="max-w-lg text-sm leading-loose text-foreground">
          瑚琏的可达性来自 Base UI
          <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com" />
          ，表格能力来自 TanStack
          <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com" />
          。
        </p>
      ),
    },
    { name: "无链接（本地来源）", render: () => <Citation index={3} title="内部知识库笔记" /> },
  ],
  renderWithProps: (p) => (
    <Citation
      index={p.index as number}
      title={p.title as string}
      source={p.source as string}
      href="https://hulian.dev"
    />
  ),
  toCode: (p) =>
    `<Citation index={${p.index}} title="${p.title}" href="…" source="${p.source}" />`,
};
