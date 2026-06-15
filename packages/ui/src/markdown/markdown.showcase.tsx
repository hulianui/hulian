import type { ShowcaseSpec } from "../showcase/types";
import { Markdown } from "./markdown";

const SAMPLE = `## 快速排序

下面是一个简洁的实现：

\`\`\`js
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const [pivot, ...rest] = arr;
  return [
    ...quickSort(rest.filter((x) => x < pivot)),
    pivot,
    ...quickSort(rest.filter((x) => x >= pivot)),
  ];
}
\`\`\`

平均复杂度 **O(n log n)**，最坏 O(n²)。要点：

- 随机选 *pivot* 规避最坏情况
- 行内 \`代码\` 与[外链](https://developer.mozilla.org)正常渲染

> 引用块也支持，整体排版吃 Prose 语义 token。`;

const TABLE_SAMPLE = `## 组件对照

| 组件 | 用途 | 可编辑 |
| --- | --- | --- |
| Markdown | 只读渲染 | 否 |
| MarkdownEditor | 富文本编辑 | 是 |

行内 \`代码\` 与 **粗体** 在表格外正常渲染。`;

export const markdownShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "把 Markdown 源文本作为 children 传入，零依赖只读渲染，排版吃 Prose 语义 token。",
      code: `<Markdown>{\`## 快速排序

平均复杂度 **O(n log n)**，要点：

- 随机选 *pivot* 规避最坏情况
- 行内 \\\`代码\\\` 与[外链](https://mdn.io)正常渲染

> 引用块也支持。\`}</Markdown>`,
      render: () => (
        <div className="max-w-2xl">
          <Markdown>{SAMPLE}</Markdown>
        </div>
      ),
    },
    {
      title: "表格",
      description: "支持 GFM 风格表格，渲染为描边容器 + 表头浅底 + 行斑马纹。",
      code: `<Markdown>{\`## 组件对照

| 组件 | 用途 | 可编辑 |
| --- | --- | --- |
| Markdown | 只读渲染 | 否 |
| MarkdownEditor | 富文本编辑 | 是 |
\`}</Markdown>`,
      render: () => (
        <div className="max-w-2xl">
          <Markdown>{TABLE_SAMPLE}</Markdown>
        </div>
      ),
    },
    {
      title: "紧凑尺寸",
      description: 'size="sm" 透传给内部 Prose，整体排版基准降到 text-sm。',
      code: `<Markdown size="sm">{markdownSource}</Markdown>`,
      render: () => (
        <div className="max-w-2xl">
          <Markdown size="sm">{SAMPLE}</Markdown>
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "size",
      type: "select",
      options: ["base", "sm"],
      defaultValue: "base",
      label: "排版尺寸",
    },
  ],
  states: [
    {
      name: "完整富文本（标题/代码块/列表/行内/引用）",
      render: () => (
        <div className="max-w-2xl">
          <Markdown>{SAMPLE}</Markdown>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="max-w-2xl">
      <Markdown size={(p.size as "base" | "sm") ?? "base"}>{SAMPLE}</Markdown>
    </div>
  ),
  toCode: (p) =>
    [
      `<Markdown size="${(p.size as string) ?? "base"}">{\``,
      `## 标题`,
      ``,
      `正文 **粗体** 与 \\\`代码\\\``,
      `\`}</Markdown>`,
    ].join("\\n"),
};
