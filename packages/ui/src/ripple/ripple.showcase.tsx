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
