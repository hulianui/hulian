"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Ferrofluid } from "../../../../packages/ui/src/ferrofluid/ferrofluid";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 265)" }}>
      {children}
    </div>);
}
export const ferrofluidShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Liquid metal ferrofluid background; the default ribbon is chart token, and the liquid level is concave at the mouse point.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Ferrofluid />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Ferrofluid
  </div>
</div>`,
            render: () => (<Stage>
          <Ferrofluid />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Ferrofluid
          </div>
        </Stage>),
        },
        {
            title: "Custom ribbon + flow direction",
            description: "The colors array maps color bands according to height gradients, and flowDirection controls the overall drift direction of the peak ridge.",
            code: `<Ferrofluid
  colors={[
    "var(--color-chart-3)",
    "var(--color-chart-1)",
    "oklch(0.78 0.2 50)",
  ]}
  flowDirection="up"
  glow={2.6}
/>`,
            render: () => (<Stage>
          <Ferrofluid colors={[
                    "var(--color-chart-3)",
                    "var(--color-chart-1)",
                    "oklch(0.78 0.2 50)",
                ]} flowDirection="up" glow={2.6}/>
        </Stage>),
        },
        {
            title: "High turbulence \u00B7 Sharp ridges",
            description: "Increase turbulence, decrease fluidity, and increase sharpness to get sharper and clearer metal peaks and ridges.",
            code: `<Ferrofluid turbulence={2.2} fluidity={0.04} sharpness={3.5} speed={0.8} />`,
            render: () => (<Stage>
          <Ferrofluid turbulence={2.2} fluidity={0.04} sharpness={3.5} speed={0.8}/>
        </Stage>),
        },
        {
            title: "Wallpaper level (slow speed and large scale)",
            description: "Slow + Large scale + Turn off mouse interaction, suitable for silent hero background overlay copywriting.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Liquid Metal \u00B7 WebGL \u00B7 Theme Adaptive</p>
  </div>
</div>`,
            render: () => (<Stage>
          <Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false}/>
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Liquid Metal · WebGL · Theme adaptive</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.5, label: "Speed" },
        { prop: "scale", type: "number", defaultValue: 1.6, label: "Zoom" },
        { prop: "glow", type: "number", defaultValue: 2, label: "Glow" },
        {
            prop: "flowDirection",
            type: "select",
            options: ["up", "down", "left", "right"],
            defaultValue: "down",
            label: "Flow direction",
        },
        {
            prop: "mouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse interaction",
        },
    ],
    states: [
        {
            name: "default (dark bottom\u00B7chart token default color)",
            render: () => (<Stage>
          <Ferrofluid />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Ferrofluid
          </div>
        </Stage>),
        },
        {
            name: "Warm colors \u00B7 Upward flow",
            render: () => (<Stage>
          <Ferrofluid colors={[
                    "var(--color-chart-3)",
                    "var(--color-chart-1)",
                    "oklch(0.78 0.2 50)",
                ]} flowDirection="up" glow={2.6}/>
        </Stage>),
        },
        {
            name: "High turbulence \u00B7 Low flow (sharp ridges)",
            render: () => (<Stage>
          <Ferrofluid turbulence={2.2} fluidity={0.04} sharpness={3.5} speed={0.8}/>
        </Stage>),
        },
        {
            name: "Wallpaper level \u00B7 Slow and large scale (no mouse interaction)",
            render: () => (<Stage>
          <Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false}/>
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Liquid Metal · WebGL · Theme adaptive</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Ferrofluid speed={p.speed as number} scale={p.scale as number} glow={p.glow as number} flowDirection={p.flowDirection as "up" | "down" | "left" | "right"} mouseInteraction={p.mouseInteraction as boolean}/>
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Ferrofluid
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
        `  <Ferrofluid`,
        `    speed={${p.speed}}`,
        `    scale={${p.scale}}`,
        `    glow={${p.glow}}`,
        `    flowDirection="${p.flowDirection}"`,
        `    mouseInteraction={${p.mouseInteraction}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
