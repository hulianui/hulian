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
  examples: [
    {
      title: "基础用法",
      description: "在 relative 容器内放一层 DotPattern 即得点阵背景，默认 16px 单元、text-border 吃主题。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern />
</div>`,
      render: () => (
        <Frame>
          <DotPattern />
        </Frame>
      ),
    },
    {
      title: "调整密度与点径",
      description: "width/height 控制单元间距，cr 控制点半径——加大间距、加粗点即得疏朗大点阵。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern width={28} height={28} cr={1.6} />
</div>`,
      render: () => (
        <Frame>
          <DotPattern width={28} height={28} cr={1.6} />
        </Frame>
      ),
    },
    {
      title: "改色（吃主题）",
      description: "点色取 currentColor，用 text-* 工具类即可换色，明暗主题自动适配。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern className="text-primary" />
</div>`,
      render: () => (
        <Frame>
          <DotPattern className="text-primary" />
        </Frame>
      ),
    },
    {
      title: "遮罩渐隐",
      description: "叠加 mask-image 让点阵向边缘淡出，常用于 hero/卡片背景，避免硬边。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
</div>`,
      render: () => (
        <Frame>
          <DotPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
        </Frame>
      ),
    },
  ],
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
