"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LiquidEther } from "../../../../packages/ui/src/liquid-ether/liquid-ether";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 270)" }}>
      {children}
    </div>);
}
export const liquidEtherShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just put it into the relative container. The component comes with absolute inset-0; the default is to automatically patrol and stir the liquid level, and the color is chart token with adaptive light and dark.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <LiquidEther />
  <div className="relative z-10 flex h-full items-center justify-center text-white/85">
    LiquidEther
  </div>
</div>`,
            render: () => (<Stage>
          <LiquidEther />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            LiquidEther
          </div>
        </Stage>),
        },
        {
            title: "Custom Palette \u00B7 Large Blob",
            description: "colors Connect to any CSS color (hex / oklch / var token); scale The larger the chromophore, the more macroscopic it is, and speed controls the tumbling speed.",
            code: `<LiquidEther
  colors={[
    "var(--color-chart-3)",
    "oklch(0.72 0.22 30)",
    "var(--color-chart-1)",
  ]}
  scale={1.6}
  speed={0.7}
/>`,
            render: () => (<Stage>
          <LiquidEther colors={[
                    "var(--color-chart-3)",
                    "oklch(0.72 0.22 30)",
                    "var(--color-chart-1)",
                ]} scale={1.6} speed={0.7}/>
        </Stage>),
        },
        {
            title: "Still waiting for interaction",
            description: "autoDemo={false} Turn off the automatic tour, the screen remains still and wait for the real pointer; mouseForce turns it up to make the stirring more convenient.",
            code: `<LiquidEther autoDemo={false} mouseForce={1.5} />`,
            render: () => (<Stage>
          <LiquidEther autoDemo={false} mouseForce={1.5}/>
        </Stage>),
        },
        {
            title: "Wallpaper-level overlay",
            description: "Slow + Translucent (opacity) reduces the visual weight and serves as the title area background to overlap below the text.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Liquid color gamut \u00B7 Mouse driver</p>
  </div>
</div>`,
            render: () => (<Stage>
          <LiquidEther speed={0.3} scale={1.2} opacity={0.7}/>
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Liquid color gamut · Mouse driver</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.5, label: "Flow speed" },
        { prop: "scale", type: "number", defaultValue: 1, label: "Clump size" },
        { prop: "mouseForce", type: "number", defaultValue: 1, label: "Pointer disturbance" },
        { prop: "autoDemo", type: "boolean", defaultValue: true, label: "Automatic demonstration" },
        { prop: "opacity", type: "number", defaultValue: 1, label: "Opacity" },
    ],
    states: [
        {
            name: "default (default parameters\u00B7automatic tour)",
            render: () => (<Stage>
          <LiquidEther />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            LiquidEther
          </div>
        </Stage>),
        },
        {
            name: "Warm orange \u00B7 Large lump",
            render: () => (<Stage>
          <LiquidEther colors={[
                    "var(--color-chart-3)",
                    "oklch(0.72 0.22 30)",
                    "var(--color-chart-1)",
                ]} scale={1.6} speed={0.7}/>
        </Stage>),
        },
        {
            name: "Still waiting for interaction (turn off automatic demonstration\u00B7move the mouse to stir)",
            render: () => (<Stage>
          <LiquidEther autoDemo={false} mouseForce={1.5}/>
        </Stage>),
        },
        {
            name: "Wallpaper level (slow speed\u00B7translucent overlay)",
            render: () => (<Stage>
          <LiquidEther speed={0.3} scale={1.2} opacity={0.7}/>
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Liquid color gamut · Mouse driver</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LiquidEther speed={p.speed as number} scale={p.scale as number} mouseForce={p.mouseForce as number} autoDemo={p.autoDemo as boolean} opacity={p.opacity as number}/>
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        LiquidEther
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 270)" }}>`,
        `  <LiquidEther`,
        `    speed={${p.speed}}`,
        `    scale={${p.scale}}`,
        `    mouseForce={${p.mouseForce}}`,
        `    autoDemo={${p.autoDemo}}`,
        `    opacity={${p.opacity}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
