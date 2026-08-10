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
  examples: [
    {
      title: "基础用法",
      description: "relative 容器内放一层 GridPattern 即得网格背景，默认 40px 实线、text-border 吃主题。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern />
</div>`,
      render: () => (
        <Frame>
          <GridPattern />
        </Frame>
      ),
    },
    {
      title: "虚线网格",
      description: "strokeDasharray 传 \"4 2\" 即把实线换成虚线，配合更小单元得细密蓝图感。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern width={24} height={24} strokeDasharray="3 2" />
</div>`,
      render: () => (
        <Frame>
          <GridPattern width={24} height={24} strokeDasharray="3 2" />
        </Frame>
      ),
    },
    {
      title: "改色（吃主题）",
      description: "线色取 currentColor，用 text-* 工具类换色，明暗主题自动适配。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern className="text-primary" />
</div>`,
      render: () => (
        <Frame>
          <GridPattern className="text-primary" />
        </Frame>
      ),
    },
    {
      title: "遮罩渐隐",
      description: "叠加 mask-image 让网格向边缘淡出，作 hero/区块背景更柔和。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
</div>`,
      render: () => (
        <Frame>
          <GridPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
        </Frame>
      ),
    },
  ],
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
      name: "密虚线 · text-muted-foreground",
      render: () => (
        <Frame>
          <GridPattern width={24} height={24} strokeDasharray="3 2" className="text-muted-foreground" />
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
