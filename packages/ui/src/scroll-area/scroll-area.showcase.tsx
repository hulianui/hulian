"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollArea } from "./scroll-area";

const paragraphs = Array.from({ length: 12 }, (_, i) => i + 1);

function Vertical() {
  return (
    <ScrollArea className="h-48 w-72 border border-border bg-surface p-4">
      <h4 className="mb-2 font-medium text-foreground">更新日志</h4>
      <div className="space-y-2 text-sm text-muted">
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
          <div key={n} className="flex h-20 w-28 shrink-0 items-center justify-center rounded-[var(--radius)] bg-surface-hover text-sm text-muted">
            卡片 {n}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export const scrollAreaShowcase: ShowcaseSpec = {
  controls: [{ prop: "orientation", type: "select", options: ["vertical", "horizontal"], defaultValue: "vertical" }],
  states: [
    { name: "vertical", render: () => <Vertical /> },
    { name: "horizontal", render: () => <Horizontal /> },
  ],
  renderWithProps: (p) => (p.orientation === "horizontal" ? <Horizontal /> : <Vertical />),
  toCode: (p) =>
    `<ScrollArea${p.orientation === "horizontal" ? ' orientation="horizontal"' : ""} className="h-48 w-72">\n  {/* 内容 */}\n</ScrollArea>`,
};
