"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Heading } from "./heading";
import type { HeadingLevel, HeadingWeight } from "./heading.types";

export const headingShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "level",
      type: "select",
      options: ["1", "2", "3", "4", "5", "6"],
      defaultValue: "2",
      label: "级别",
    },
    {
      prop: "weight",
      type: "select",
      options: ["normal", "medium", "semibold", "bold"],
      defaultValue: "semibold",
      label: "字重",
    },
  ],
  states: [
    {
      name: "六级标题（语义标签 + 默认尺寸）",
      render: () => (
        <div className="flex flex-col gap-2">
          <Heading level={1}>Heading 一级 · h1</Heading>
          <Heading level={2}>Heading 二级 · h2</Heading>
          <Heading level={3}>Heading 三级 · h3</Heading>
          <Heading level={4}>Heading 四级 · h4</Heading>
          <Heading level={5}>Heading 五级 · h5</Heading>
          <Heading level={6}>Heading 六级 · h6</Heading>
        </div>
      ),
    },
    {
      name: "字重对比",
      render: () => (
        <div className="flex flex-col gap-2">
          <Heading level={3} weight="normal">
            常规 normal
          </Heading>
          <Heading level={3} weight="medium">
            中等 medium
          </Heading>
          <Heading level={3} weight="semibold">
            半粗 semibold
          </Heading>
          <Heading level={3} weight="bold">
            粗体 bold
          </Heading>
        </div>
      ),
    },
    {
      name: "视觉/语义解耦（h2 标签，渲染成 h4 尺寸）",
      render: () => (
        <Heading level={2} size="lg">
          语义是 h2，视觉是 lg
        </Heading>
      ),
    },
    {
      name: "as 覆盖标签（div 承载大标题样式）",
      render: () => (
        <Heading level={1} as="div" balance>
          用 div 渲染、启用 balance 平衡换行的大号视觉标题
        </Heading>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Heading level={Number(p.level) as HeadingLevel} weight={p.weight as HeadingWeight}>
      瑚琏 Heading 标题
    </Heading>
  ),
  toCode: (p) =>
    `<Heading level={${p.level}}${p.weight === "semibold" ? "" : ` weight="${p.weight}"`}>瑚琏 Heading 标题</Heading>`,
};
