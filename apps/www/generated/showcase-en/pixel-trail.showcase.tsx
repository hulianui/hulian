"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PixelTrail } from "../../../../packages/ui/src/pixel-trail/pixel-trail";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/40">
        Move the mouse within this area
      </div>
    </div>);
}
export const pixelTrailShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Cover the container, the mouse moves over the pixel grid, and the trailing fades out over time.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <PixelTrail className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <PixelTrail className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Fine mesh + short afterglow",
            description: "Increase gridSize to make the pixels finer, and lower maxAge to make the trailing shorter.",
            code: `<PixelTrail
  gridSize={72}
  maxAge={200}
  color="var(--color-chart-2)"
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <PixelTrail gridSize={72} maxAge={200} color="var(--color-chart-2)" className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Coarse grain + long afterglow",
            description: "Lower gridSize, increase trailSize and maxAge, retro grain + long tail.",
            code: `<PixelTrail
  gridSize={24}
  trailSize={0.16}
  maxAge={600}
  color="var(--color-chart-4)"
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <PixelTrail gridSize={24} trailSize={0.16} maxAge={600} color="var(--color-chart-4)" className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Mucus Fusion",
            description: "gooey=true With the SVG filter enabled, adjacent pixels merge into an organic liquid clump.",
            code: `<PixelTrail
  gridSize={48}
  trailSize={0.14}
  gooey
  gooeyStrength={9}
  color="var(--color-chart-1)"
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <PixelTrail gridSize={48} trailSize={0.14} gooey gooeyStrength={9} color="var(--color-chart-1)" className="absolute inset-0"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "gridSize", type: "number", defaultValue: 40, label: "Grid density" },
        { prop: "trailSize", type: "number", defaultValue: 0.1, label: "Trailing radius 0\u20131" },
        { prop: "maxAge", type: "number", defaultValue: 320, label: "Afterglow duration ms" },
        { prop: "gooey", type: "boolean", defaultValue: false, label: "Mucus Fusion" },
    ],
    states: [
        {
            name: "default (default pixel trailing)",
            render: () => (<Stage>
          <PixelTrail className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Fine mesh + short afterglow",
            render: () => (<Stage>
          <PixelTrail gridSize={72} maxAge={200} color="var(--color-chart-2)" className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Coarse grain + long afterglow (vintage)",
            render: () => (<Stage>
          <PixelTrail gridSize={24} trailSize={0.16} maxAge={600} color="var(--color-chart-4)" className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "gooey Mucus fusion (liquid mass)",
            render: () => (<Stage>
          <PixelTrail gridSize={48} trailSize={0.14} gooey gooeyStrength={9} color="var(--color-chart-1)" className="absolute inset-0"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PixelTrail gridSize={p.gridSize as number} trailSize={p.trailSize as number} maxAge={p.maxAge as number} gooey={p.gooey as boolean} className="absolute inset-0"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <PixelTrail`,
        `    gridSize={${p.gridSize}}`,
        `    trailSize={${p.trailSize}}`,
        `    maxAge={${p.maxAge}}`,
        `    gooey={${p.gooey}}`,
        `    className="absolute inset-0"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
