import type { ShowcaseSpec } from "../showcase/types";
import { Ripple } from "./ripple";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-xl border border-border bg-surface">
      {children}
      <span className="z-10 text-sm font-medium text-foreground">Ripple</span>
    </div>
  );
}

export const rippleShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "relative + place-items-center 容器内放一层 Ripple 即得同心脉冲圆环，常作 hero/空状态背景。",
      code: `<div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-xl border border-border bg-surface">
  <Ripple />
  <span className="z-10 text-sm font-medium">Ripple</span>
</div>`,
      render: () => (
        <Frame>
          <Ripple mainCircleSize={160} />
        </Frame>
      ),
    },
    {
      title: "圈数与起始尺寸",
      description: "numCircles 控制圈数，mainCircleSize 控制最内圈直径——少圈更聚焦。",
      code: `<div className="relative grid place-items-center ...">
  <Ripple mainCircleSize={140} numCircles={5} />
</div>`,
      render: () => (
        <Frame>
          <Ripple mainCircleSize={140} numCircles={5} />
        </Frame>
      ),
    },
    {
      title: "改色与不透明度",
      description: "边框取 currentColor，用 text-* 换色；mainCircleOpacity 调整最内圈起始不透明度。",
      code: `<div className="relative grid place-items-center ...">
  <Ripple mainCircleSize={150} className="text-primary" mainCircleOpacity={0.35} />
</div>`,
      render: () => (
        <Frame>
          <Ripple mainCircleSize={150} className="text-primary" mainCircleOpacity={0.35} />
        </Frame>
      ),
    },
  ],
  controls: [
    { prop: "mainCircleSize", type: "number", defaultValue: 180 },
    { prop: "numCircles", type: "number", defaultValue: 8 },
    { prop: "mainCircleOpacity", type: "number", defaultValue: 0.24 },
  ],
  states: [
    {
      name: "default（8 圈脉冲）",
      render: () => (
        <Frame>
          <Ripple mainCircleSize={160} />
        </Frame>
      ),
    },
    {
      name: "少圈 · text-primary",
      render: () => (
        <Frame>
          <Ripple mainCircleSize={140} numCircles={5} className="text-primary" />
        </Frame>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Frame>
      <Ripple
        mainCircleSize={p.mainCircleSize as number}
        numCircles={p.numCircles as number}
        mainCircleOpacity={p.mainCircleOpacity as number}
      />
    </Frame>
  ),
  toCode: (p) =>
    `<div className="relative grid place-items-center">\n  <Ripple mainCircleSize={${p.mainCircleSize}} numCircles={${p.numCircles}} />\n</div>`,
};
