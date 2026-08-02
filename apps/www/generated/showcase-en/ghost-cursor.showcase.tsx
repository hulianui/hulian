"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GhostCursor } from "../../../../packages/ui/src/ghost-cursor/ghost-cursor";
function Stage({ children, hint = "Move the pointer within this area", }: {
    children: React.ReactNode;
    hint?: string;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 285)" }}>
      {children}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-white/40">{hint}</span>
      </div>
    </div>);
}
export const ghostCursorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "GhostCursor is the decorative covering layer of absolute inset-0, just put it into a dark container of relative + overflow-hidden.",
            code: `<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 285)" }}
>
  <GhostCursor />
</div>`,
            render: () => (<Stage>
          <GhostCursor />
        </Stage>),
        },
        {
            title: "Custom color and long tail",
            description: "color changes the main color, trailLength lengthens the tail, and inertia becomes larger and floats more after stopping.",
            code: `<GhostCursor
  color="oklch(0.72 0.2 50)"
  trailLength={48}
  inertia={0.78}
/>`,
            render: () => (<Stage hint="The tail is longer and more floaty">
          <GhostCursor color="oklch(0.72 0.2 50)" trailLength={48} inertia={0.78}/>
        </Stage>),
        },
        {
            title: "Gather small smoke balls",
            description: "scale The larger the smoke group, the more it gathers. brightness brightens and turns off the particles to be cleaner.",
            code: `<GhostCursor
  scale={1.6}
  grainIntensity={0}
  brightness={1.5}
  trailLength={20}
/>`,
            render: () => (<Stage hint="The smoke balls are gathering more">
          <GhostCursor scale={1.6} grainIntensity={0} brightness={1.5} trailLength={20}/>
        </Stage>),
        },
        {
            title: "Diffuse soft light",
            description: "scale The smaller the smoke ball, the more diffuse it is, and the soft ambient light is obtained with the main color of green.",
            code: `<GhostCursor
  color="oklch(0.78 0.16 175)"
  scale={0.7}
  inertia={0.6}
  brightness={1.3}
/>`,
            render: () => (<Stage hint="Diffuse soft light">
          <GhostCursor color="oklch(0.78 0.16 175)" scale={0.7} inertia={0.6} brightness={1.3}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "trailLength", type: "number", defaultValue: 32, label: "Trailing length" },
        { prop: "inertia", type: "number", defaultValue: 0.5, label: "Inertia coefficient 0-1" },
        { prop: "brightness", type: "number", defaultValue: 1.2, label: "Brightness gain" },
        { prop: "grainIntensity", type: "number", defaultValue: 0.05, label: "Particle strength" },
        { prop: "scale", type: "number", defaultValue: 1, label: "Smoke mass size" },
    ],
    states: [
        {
            name: "default (default blue and purple smoke)",
            render: () => (<Stage>
          <GhostCursor />
        </Stage>),
        },
        {
            name: "Warm orange long tail (high inertia)",
            render: () => (<Stage hint="The tail is longer and more floaty">
          <GhostCursor color="oklch(0.72 0.2 50)" trailLength={48} inertia={0.78}/>
        </Stage>),
        },
        {
            name: "Gather small smoke groups (low scale\u00B7no particles)",
            render: () => (<Stage hint="The smoke balls are gathering more">
          <GhostCursor scale={1.6} grainIntensity={0} brightness={1.5} trailLength={20}/>
        </Stage>),
        },
        {
            name: "Green diffuse (large smoke ball)",
            render: () => (<Stage hint="Diffuse soft light">
          <GhostCursor color="oklch(0.78 0.16 175)" scale={0.7} inertia={0.6} brightness={1.3}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GhostCursor trailLength={p.trailLength as number} inertia={p.inertia as number} brightness={p.brightness as number} grainIntensity={p.grainIntensity as number} scale={p.scale as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 285)" }}>`,
        `  <GhostCursor`,
        `    trailLength={${p.trailLength}}`,
        `    inertia={${p.inertia}}`,
        `    brightness={${p.brightness}}`,
        `    grainIntensity={${p.grainIntensity}}`,
        `    scale={${p.scale}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
