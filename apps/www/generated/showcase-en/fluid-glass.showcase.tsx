"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FluidGlass } from "../../../../packages/ui/src/fluid-glass/fluid-glass";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border">
      {children}
    </div>);
}
export const fluidGlassShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative container, the component comes with absolute inset-0; move the pointer to see the glass lens to follow the refraction.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <FluidGlass className="absolute inset-0">
    <div className="flex h-full items-center justify-center text-lg font-semibold text-white drop-shadow">
      Fluid Glass
    </div>
  </FluidGlass>
</div>`,
            render: () => (<Stage>
          <FluidGlass className="absolute inset-0">
            <div className="flex h-full items-center justify-center text-lg font-semibold text-white drop-shadow">
              Fluid Glass
            </div>
          </FluidGlass>
        </Stage>),
        },
        {
            title: "Strong refraction + strong dispersion",
            description: "Turn up size/refraction/dispersion to simulate thicker glass with more obvious colored edges.",
            code: `<FluidGlass
  size={0.32}
  refraction={0.85}
  dispersion={0.7}
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <FluidGlass size={0.32} refraction={0.85} dispersion={0.7} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Pointer not followed",
            description: "When followPointer={false}, the lens stops at the center and slowly self-drifts.",
            code: `<FluidGlass
  followPointer={false}
  size={0.24}
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <FluidGlass followPointer={false} size={0.24} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Custom color matching",
            description: "colors Pass any three colors to cover the flowing basemap of the default chart token.",
            code: `<FluidGlass
  colors={[
    "oklch(0.72 0.2 30)",
    "oklch(0.78 0.16 70)",
    "var(--color-chart-3)",
  ]}
  refraction={0.6}
  className="absolute inset-0"
>
  <div className="flex h-full flex-col items-center justify-center gap-1">
    <p className="text-base font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/70">Fluid glass \u00B7 real-time refraction</p>
  </div>
</FluidGlass>`,
            render: () => (<Stage>
          <FluidGlass colors={[
                    "oklch(0.72 0.2 30)",
                    "oklch(0.78 0.16 70)",
                    "var(--color-chart-3)",
                ]} refraction={0.6} className="absolute inset-0">
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <p className="text-base font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/70">Fluid Glass · Real-time Refraction</p>
            </div>
          </FluidGlass>
        </Stage>),
        },
    ],
    controls: [
        { prop: "size", type: "number", defaultValue: 0.26, label: "Lens size" },
        { prop: "refraction", type: "number", defaultValue: 0.5, label: "Refraction intensity" },
        { prop: "dispersion", type: "number", defaultValue: 0.3, label: "Dispersion" },
        { prop: "speed", type: "number", defaultValue: 1, label: "Flow speed" },
        {
            prop: "followPointer",
            type: "boolean",
            defaultValue: true,
            label: "Follow the pointer",
        },
    ],
    states: [
        {
            name: "default (Move the pointer to see the lens follow)",
            render: () => (<Stage>
          <FluidGlass className="absolute inset-0">
            <div className="flex h-full items-center justify-center text-lg font-semibold text-white drop-shadow">
              Fluid Glass
            </div>
          </FluidGlass>
        </Stage>),
        },
        {
            name: "Strong refraction + strong dispersion (thick glass)",
            render: () => (<Stage>
          <FluidGlass size={0.32} refraction={0.85} dispersion={0.7} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Not following the pointer (lens self-drift)",
            render: () => (<Stage>
          <FluidGlass followPointer={false} size={0.24} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Custom warm color",
            render: () => (<Stage>
          <FluidGlass colors={[
                    "oklch(0.72 0.2 30)",
                    "oklch(0.78 0.16 70)",
                    "var(--color-chart-3)",
                ]} refraction={0.6} className="absolute inset-0">
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <p className="text-base font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/70">Fluid Glass · Real-time Refraction</p>
            </div>
          </FluidGlass>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FluidGlass size={p.size as number} refraction={p.refraction as number} dispersion={p.dispersion as number} speed={p.speed as number} followPointer={p.followPointer as boolean} className="absolute inset-0">
        <div className="flex h-full items-center justify-center text-sm text-white/80">
          Fluid Glass
        </div>
      </FluidGlass>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl">`,
        `  <FluidGlass`,
        `    size={${p.size}}`,
        `    refraction={${p.refraction}}`,
        `    dispersion={${p.dispersion}}`,
        `    speed={${p.speed}}`,
        `    followPointer={${p.followPointer}}`,
        `    className="absolute inset-0"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
