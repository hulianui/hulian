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
