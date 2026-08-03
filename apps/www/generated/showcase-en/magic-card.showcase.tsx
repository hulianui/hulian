"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MagicCard } from "../../../../packages/ui/src/magic-card/magic-card";
export const magicCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When the mouse moves into the card, the radial highlight follows the cursor position.",
            code: `<MagicCard className="h-44 w-72">
  <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
    <span className="text-lg font-semibold text-foreground">Magic Card</span>
    <span className="text-sm text-muted">Move the mouse up to see the highlight</span>
  </div>
</MagicCard>`,
            render: () => (<MagicCard className="h-44 w-72">
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
            <span className="text-lg font-semibold text-foreground">Magic Card</span>
            <span className="text-sm text-muted">Move the mouse up to see the highlights</span>
          </div>
        </MagicCard>),
        },
        {
            title: "Highlight radius and intensity",
            description: "gradientSize controls the highlight diameter, gradientOpacity controls the intensity of hover.",
            code: `<MagicCard className="h-44 w-72" gradientSize={320} gradientOpacity={0.3}>
  <div className="flex h-full items-center justify-center p-6">
    <span className="text-sm text-muted">Bigger and brighter highlights</span>
  </div>
</MagicCard>`,
            render: () => (<MagicCard className="h-44 w-72" gradientSize={320} gradientOpacity={0.3}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="text-sm text-muted">Bigger and brighter highlights</span>
          </div>
        </MagicCard>),
        },
        {
            title: "Custom highlight color",
            description: "gradientColor can be changed to any CSS color (the default is var (--color-primary) with the theme).",
            code: `<MagicCard className="h-44 w-72" gradientColor="var(--color-chart-3)">
  <div className="flex h-full items-center justify-center p-6">
    <span className="text-sm text-muted">Change to a highlight color</span>
  </div>
</MagicCard>`,
            render: () => (<MagicCard className="h-44 w-72" gradientColor="var(--color-chart-3)">
          <div className="flex h-full items-center justify-center p-6">
            <span className="text-sm text-muted">Change to a highlight color</span>
          </div>
        </MagicCard>),
        },
    ],
    controls: [
        { prop: "gradientSize", type: "number", defaultValue: 200 },
        { prop: "gradientOpacity", type: "number", defaultValue: 0.15 },
    ],
    states: [
        {
            name: "default (hover highlight follow mouse)",
            render: () => (<MagicCard className="h-44 w-72">
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
            <span className="text-lg font-semibold text-foreground">Magic Card</span>
            <span className="text-sm text-muted">Move the mouse up to see the highlights</span>
          </div>
        </MagicCard>),
        },
    ],
    renderWithProps: (p) => (<MagicCard className="h-44 w-72" gradientSize={p.gradientSize as number} gradientOpacity={p.gradientOpacity as number}>
      <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
        <span className="text-lg font-semibold text-foreground">Magic Card</span>
        <span className="text-sm text-muted">Move the mouse up to see the highlights</span>
      </div>
    </MagicCard>),
    toCode: (p) => `<MagicCard gradientSize={${p.gradientSize}} gradientOpacity={${p.gradientOpacity}}>...</MagicCard>`,
};
