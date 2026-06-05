import type { ShowcaseSpec } from "../showcase/types";
import { FlickeringGrid } from "./flickering-grid";

// 背景层需放在 relative/absolute 定位父容器内，组件自身 h-full w-full 铺满。
// 示例：用固定高宽容器展示，overflow-hidden 剪裁溢出。
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const flickeringGridShowcase: ShowcaseSpec = {
  controls: [
    { prop: "squareSize", type: "number", defaultValue: 4 },
    { prop: "gridGap", type: "number", defaultValue: 6 },
    { prop: "flickerChance", type: "number", defaultValue: 0.3 },
    { prop: "maxOpacity", type: "number", defaultValue: 0.3 },
  ],
  states: [
    {
      name: "default（主题前景色 · 4px 方格）",
      render: () => (
        <Frame>
          <FlickeringGrid className="absolute inset-0" />
        </Frame>
      ),
    },
    {
      name: "强调色 · maxOpacity=0.5",
      render: () => (
        <Frame>
          <FlickeringGrid
            className="absolute inset-0"
            color="var(--color-primary)"
            maxOpacity={0.5}
          />
        </Frame>
      ),
    },
    {
      name: "大方格 · 低闪烁频率",
      render: () => (
        <Frame>
          <FlickeringGrid
            className="absolute inset-0"
            squareSize={8}
            gridGap={4}
            flickerChance={0.1}
            maxOpacity={0.4}
          />
        </Frame>
      ),
    },
    {
      name: "密集小格 · 高频闪烁",
      render: () => (
        <Frame>
          <FlickeringGrid
            className="absolute inset-0"
            squareSize={2}
            gridGap={2}
            flickerChance={0.7}
            maxOpacity={0.25}
          />
        </Frame>
      ),
    },
    {
      name: "danger 色调",
      render: () => (
        <Frame>
          <FlickeringGrid
            className="absolute inset-0"
            color="var(--color-danger)"
            maxOpacity={0.35}
          />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <FlickeringGrid
        className="absolute inset-0"
        squareSize={p.squareSize as number}
        gridGap={p.gridGap as number}
        flickerChance={p.flickerChance as number}
        maxOpacity={p.maxOpacity as number}
      />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative h-48 w-80 overflow-hidden rounded-xl">\n  <FlickeringGrid\n    className="absolute inset-0"\n    squareSize={${p.squareSize}}\n    gridGap={${p.gridGap}}\n    flickerChance={${p.flickerChance}}\n    maxOpacity={${p.maxOpacity}}\n  />\n</div>`,
};
