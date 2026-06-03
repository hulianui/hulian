"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MagicCard } from "./magic-card";

export const magicCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "gradientSize", type: "number", defaultValue: 200 },
    { prop: "gradientOpacity", type: "number", defaultValue: 0.15 },
  ],
  states: [
    {
      name: "default（hover 高光跟随鼠标）",
      render: () => (
        <MagicCard className="h-44 w-72">
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
            <span className="text-lg font-semibold text-foreground">Magic Card</span>
            <span className="text-sm text-muted">把鼠标移上来看高光</span>
          </div>
        </MagicCard>
      ),
    },
  ],
  renderWithProps: (p) => (
    <MagicCard
      className="h-44 w-72"
      gradientSize={p.gradientSize as number}
      gradientOpacity={p.gradientOpacity as number}
    >
      <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
        <span className="text-lg font-semibold text-foreground">Magic Card</span>
        <span className="text-sm text-muted">把鼠标移上来看高光</span>
      </div>
    </MagicCard>
  ),
  toCode: (p) =>
    `<MagicCard gradientSize={${p.gradientSize}} gradientOpacity={${p.gradientOpacity}}>...</MagicCard>`,
};
