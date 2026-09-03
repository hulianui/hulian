"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollArea } from "./scroll-area";

const paragraphs = Array.from({ length: 12 }, (_, i) => i + 1);

function Vertical() {
  return (
    <ScrollArea className="h-48 w-72 border border-border bg-surface p-4">
      <h4 className="mb-2 font-medium text-foreground">更新日志</h4>
      <div className="space-y-2 text-sm text-muted-foreground">
        {paragraphs.map((n) => (
          <p key={n}>第 {n} 条：瑚琏吸取式聚合组件库，从各家 React 库吸取最佳实现，统一成一套 API 与明暗 token。</p>
        ))}
      </div>
    </ScrollArea>
  );
}

function Horizontal() {
  return (
    <ScrollArea orientation="horizontal" className="w-72 border border-border bg-surface p-4">
      <div className="flex gap-3">
        {paragraphs.map((n) => (
          <div key={n} className="flex h-20 w-28 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface-hover text-sm text-muted-foreground">
            卡片 {n}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function Both() {
  return (
    <ScrollArea orientation="both" className="h-48 w-72 border border-border bg-surface p-4">
      <div className="space-y-3">
        {paragraphs.map((n) => (
          <p key={n} className="whitespace-nowrap text-sm text-muted-foreground">
            第 {n} 行：这是一段很长不会换行的文本，用来同时撑出横向与纵向滚动条与右下角 corner。
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}

// 「长则封顶滚动、短则紧凑」：两块并排对照，同一个 max-h-40，只有内容多的那块出滚动条。
function Capped() {
  return (
    <div className="flex flex-wrap gap-4">
      <ScrollArea className="max-h-40 w-56 border border-border bg-surface p-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>内容不多时不出滚动条，容器只占内容那么高。</p>
          <p>换成固定高度就会在下方留出空白。</p>
        </div>
      </ScrollArea>
      <ScrollArea className="max-h-40 w-56 border border-border bg-surface p-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          {paragraphs.map((n) => (
            <p key={n}>第 {n} 条：超过上限后在这里滚动，上限之内则紧贴内容。</p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export const scrollAreaShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "纵向滚动",
      description: "默认 orientation=vertical，内容超出容器高度时显示细滚动条。",
      code: `<ScrollArea className="h-48 w-72 border border-border p-4">
  {/* 超过容器高度的内容 */}
</ScrollArea>`,
      render: () => <Vertical />,
    },
    {
      title: "横向滚动",
      description: "orientation=horizontal，配合一行 flex 卡片做横向浏览。",
      code: `<ScrollArea orientation="horizontal" className="w-72 border border-border p-4">
  <div className="flex gap-3">{/* 卡片们 */}</div>
</ScrollArea>`,
      render: () => <Horizontal />,
    },
    {
      title: "封顶滚动",
      description: "用 max-h-* 表达「长则封顶滚动、短则紧凑」：内容不多时不出滚动条，也不会像固定高度那样在下方留白。",
      code: `<ScrollArea className="max-h-40 w-56 border border-border p-4">
  {/* 内容超过 40 才滚动，不超则容器只有内容那么高 */}
</ScrollArea>`,
      render: () => <Capped />,
    },
    {
      title: "双向滚动",
      description: "orientation=both，同时出现横纵滚动条并在右下角补 corner。",
      code: `<ScrollArea orientation="both" className="h-48 w-72 border border-border p-4">
  {/* 又宽又高的内容 */}
</ScrollArea>`,
      render: () => <Both />,
    },
  ],
  controls: [{ prop: "orientation", type: "select", options: ["vertical", "horizontal"], defaultValue: "vertical" }],
  states: [
    { name: "vertical", render: () => <Vertical /> },
    { name: "horizontal", render: () => <Horizontal /> },
  ],
  renderWithProps: (p) => (p.orientation === "horizontal" ? <Horizontal /> : <Vertical />),
  toCode: (p) =>
    `<ScrollArea${p.orientation === "horizontal" ? ' orientation="horizontal"' : ""} className="h-48 w-72">\n  {/* 内容 */}\n</ScrollArea>`,
};
