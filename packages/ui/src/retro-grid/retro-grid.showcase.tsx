import type { ShowcaseSpec } from "../showcase/types";
import { RetroGrid } from "./retro-grid";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const retroGridShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "relative 容器内放一层 RetroGrid 即得透视滚动网格，默认 65° 倾角、12s 一轮、text-border。",
      code: `<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <RetroGrid />
</div>`,
      render: () => (
        <Frame>
          <RetroGrid />
        </Frame>
      ),
    },
    {
      title: "密格 · 慢速",
      description: "cellSize 调网格疏密，duration 调滚动周期（越大越慢）。",
      code: `<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <RetroGrid cellSize={36} duration={24} />
</div>`,
      render: () => (
        <Frame>
          <RetroGrid cellSize={36} duration={24} />
        </Frame>
      ),
    },
    {
      title: "改色与透明度",
      description: "线色取 currentColor，用 text-* 换色；opacity 调整整体淡入程度。",
      code: `<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <RetroGrid className="text-primary" opacity={0.7} />
</div>`,
      render: () => (
        <Frame>
          <RetroGrid className="text-primary" opacity={0.7} />
        </Frame>
      ),
    },
  ],
  controls: [
    { prop: "cellSize", type: "number", defaultValue: 60 },
    { prop: "duration", type: "number", defaultValue: 12 },
    { prop: "opacity", type: "number", defaultValue: 0.5 },
  ],
  states: [
    {
      name: "default（65° · 滚动）",
      render: () => (
        <Frame>
          <RetroGrid />
        </Frame>
      ),
    },
    {
      name: "密格 · 慢速 · text-primary",
      render: () => (
        <Frame>
          <RetroGrid cellSize={36} duration={24} className="text-primary" />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <RetroGrid
        cellSize={p.cellSize as number}
        duration={p.duration as number}
        opacity={p.opacity as number}
      />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative">\n  <RetroGrid cellSize={${p.cellSize}} duration={${p.duration}} opacity={${p.opacity}} />\n</div>`,
};
