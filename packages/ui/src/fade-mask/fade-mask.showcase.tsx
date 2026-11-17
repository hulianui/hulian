import type { ShowcaseSpec } from "../showcase/types";
import { DotPattern } from "../dot-pattern";
import { FadeMask } from "./fade-mask";
import type { FadeMaskProps } from "./fade-mask.types";

function Tiles() {
  return (
    <div className="grid grid-cols-4 gap-2 p-3">
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} className="h-10 rounded-md bg-primary/15" />
      ))}
    </div>
  );
}

export const fadeMaskShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "底部淡出",
      description: "出血裁切的展示墙、截断的长列表：底部渐隐到透明，放在任何底色上都对。",
      code: `<FadeMask direction="bottom" start="60%">
  …
</FadeMask>`,
      render: () => (
        <FadeMask className="w-72 rounded-xl border border-border">
          <Tiles />
        </FadeMask>
      ),
    },
    {
      title: "纹理中心聚光",
      description: "direction=\"radial\" 从 at 处向四周渐隐：点阵 / 网格背景「中心亮、四周退」。",
      code: `<FadeMask direction="radial" at="30% 20%" size="50% 60%" className="absolute inset-0">
  <DotPattern />
</FadeMask>`,
      render: () => (
        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-bg">
          <FadeMask direction="radial" at="30% 20%" size="50% 60%" className="absolute inset-0">
            <DotPattern className="text-muted-foreground" />
          </FadeMask>
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "direction",
      type: "select",
      options: ["top", "bottom", "left", "right", "radial"],
      defaultValue: "bottom",
    },
  ],
  states: [
    {
      name: "底部淡出",
      render: () => (
        <FadeMask className="w-72">
          <Tiles />
        </FadeMask>
      ),
    },
    {
      name: "右侧淡出",
      render: () => (
        <FadeMask direction="right" className="w-72">
          <Tiles />
        </FadeMask>
      ),
    },
  ],
  renderWithProps: (p) => (
    <FadeMask direction={p.direction as FadeMaskProps["direction"]} className="w-72">
      <Tiles />
    </FadeMask>
  ),
  toCode: (p) => `<FadeMask direction="${p.direction}">
  …
</FadeMask>`,
};
