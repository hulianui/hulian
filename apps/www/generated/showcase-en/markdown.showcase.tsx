import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Markdown } from "../../../../packages/ui/src/markdown/markdown";
const SAMPLE = `## Quick sort

Here is a concise implementation:

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

Average complexity **O(n log n)**, worst O(n\u00B2). Key points:

- Randomly select *pivot* to avoid the worst case scenario
- Inline \`code\` and [external link](https://developer.mozilla.org) render normally

> Reference blocks are also supported, and the overall typesetting is Prose semantics token.`;
const TABLE_SAMPLE = `## Component comparison

| Component | Purpose | Editable |
| --- | --- | --- |
| Markdown | Read-only rendering | No |
| MarkdownEditor | Rich text editing | Yes |

Inline \`code\` and **bold** render normally outside the table.`;
export const markdownShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in the Markdown source text as children, zero-dependency read-only rendering, and typesetting Prose semantics token.",
            code: `<Markdown>{\`## Quick sort

Average complexity **O(n log n)**, key points:

- Randomly select *pivot* to avoid the worst case scenario
- Inline \\\`code\\\` and [external link](https://mdn.io) render normally

> Quote blocks are also supported. \`}</Markdown>`,
            render: () => (<div className="max-w-2xl">
          <Markdown>{SAMPLE}</Markdown>
        </div>),
        },
        {
            title: "Form",
            description: "Supports the GFM style table, which is rendered as a stroke container + shallow bottom table header + row zebra pattern.",
            code: `<Markdown>{\`## Component comparison

| Component | Purpose | Editable |
| --- | --- | --- |
| Markdown | Read-only rendering | No |
| MarkdownEditor | Rich text editing | Yes |
\`}</Markdown>`,
            render: () => (<div className="max-w-2xl">
          <Markdown>{TABLE_SAMPLE}</Markdown>
        </div>),
        },
        {
            title: "Compact size",
            description: "size=\"sm\" is transparently transmitted to internal Prose, and the overall typesetting benchmark is reduced to text-sm.",
            code: `<Markdown size="sm">{markdownSource}</Markdown>`,
            render: () => (<div className="max-w-2xl">
          <Markdown size="sm">{SAMPLE}</Markdown>
        </div>),
        },
    ],
    controls: [
        {
            prop: "size",
            type: "select",
            options: ["base", "sm"],
            defaultValue: "base",
            label: "Layout size",
        },
    ],
    states: [
        {
            name: "Full rich text (title/block/list/inline/quote)",
            render: () => (<div className="max-w-2xl">
          <Markdown>{SAMPLE}</Markdown>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="max-w-2xl">
      <Markdown size={(p.size as "base" | "sm") ?? "base"}>{SAMPLE}</Markdown>
    </div>),
    toCode: (p) => [
        `<Markdown size="${(p.size as string) ?? "base"}">{\``,
        `## Title`,
        ``,
        `Text **Bold** and \\\`Code\\\``,
        `\`}</Markdown>`,
    ].join("\\n"),
};
