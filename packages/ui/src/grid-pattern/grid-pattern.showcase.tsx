import type { ShowcaseSpec } from "../showcase/types";
import { GridPattern } from "./grid-pattern";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const gridPatternShowcase: ShowcaseSpec = {
  controls: [
    { prop: "width", type: "number", defaultValue: 40 },
    { prop: "dashed", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "default（40px 实线网格）",
      render: () => (
        <Frame>
          <GridPattern />
        </Frame>
      ),
    },
    {
      name: "密虚线 · text-muted",
      render: () => (
        <Frame>
          <GridPattern width={24} height={24} strokeDasharray="3 2" className="text-muted" />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <GridPattern
        width={p.width as number}
        height={p.width as number}
        strokeDasharray={p.dashed ? "4 2" : 0}
      />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative">\n  <GridPattern width={${p.width}}${p.dashed ? ' strokeDasharray="4 2"' : ""} />\n</div>`,
};
