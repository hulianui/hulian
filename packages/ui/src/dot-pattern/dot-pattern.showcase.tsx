import type { ShowcaseSpec } from "../showcase/types";
import { DotPattern } from "./dot-pattern";

// 背景层需放在 relative 定位容器内（absolute inset-0 铺满父）。Frame 提供舞台。
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const dotPatternShowcase: ShowcaseSpec = {
  controls: [
    { prop: "width", type: "number", defaultValue: 16 },
    { prop: "cr", type: "number", defaultValue: 1 },
  ],
  states: [
    {
      name: "default（text-border · 16px 单元）",
      render: () => (
        <Frame>
          <DotPattern />
        </Frame>
      ),
    },
    {
      name: "疏点 · text-muted",
      render: () => (
        <Frame>
          <DotPattern width={28} height={28} cr={1.4} className="text-muted" />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <DotPattern width={p.width as number} height={p.width as number} cr={p.cr as number} />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative">\n  <DotPattern width={${p.width}} cr={${p.cr}} />\n</div>`,
};
