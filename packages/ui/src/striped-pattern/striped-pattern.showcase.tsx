import type { ShowcaseSpec } from "../showcase/types";
import { StripedPattern } from "./striped-pattern";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const stripedPatternShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "relative 容器内放一层 StripedPattern 即得斜条纹背景，默认 45°、10px 单元、text-border。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern />
</div>`,
      render: () => (
        <Frame>
          <StripedPattern />
        </Frame>
      ),
    },
    {
      title: "角度与疏密",
      description: "angle 控制条纹倾角，size 控制条纹+间隔单元宽——竖向疏纹即 angle=90、size 加大。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern angle={90} size={20} />
</div>`,
      render: () => (
        <Frame>
          <StripedPattern angle={90} size={20} />
        </Frame>
      ),
    },
    {
      title: "改色（吃主题）",
      description: "条纹色取 currentColor，用 text-* 工具类换色，明暗主题自动适配。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern className="text-primary" />
</div>`,
      render: () => (
        <Frame>
          <StripedPattern className="text-primary" />
        </Frame>
      ),
    },
    {
      title: "遮罩渐隐",
      description: "叠加 mask-image 让条纹向边缘淡出，作区块背景更柔和。",
      code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
</div>`,
      render: () => (
        <Frame>
          <StripedPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
        </Frame>
      ),
    },
  ],
  controls: [
    { prop: "angle", type: "number", defaultValue: 45 },
    { prop: "size", type: "number", defaultValue: 10 },
  ],
  states: [
    {
      name: "default（45° · 10px）",
      render: () => (
        <Frame>
          <StripedPattern />
        </Frame>
      ),
    },
    {
      name: "竖向疏纹 · text-muted",
      render: () => (
        <Frame>
          <StripedPattern angle={90} size={20} className="text-muted" />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <StripedPattern angle={p.angle as number} size={p.size as number} />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative">\n  <StripedPattern angle={${p.angle}} size={${p.size}} />\n</div>`,
};
