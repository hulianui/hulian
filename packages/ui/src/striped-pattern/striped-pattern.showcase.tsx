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
