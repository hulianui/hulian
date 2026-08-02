"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Grainient } from "../../../../packages/ui/src/grainient/grainient";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-neutral-950">
      {children}
    </div>);
}
export const grainientShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Eats chart token three colors by default, comes with absolute inset-0 z-0; put it into the relative container and it will be filled.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Grainient />
  <div className="relative z-10 flex h-full items-center justify-center text-white/85">
    Content layer
  </div>
</div>`,
            render: () => (<Stage>
          <Grainient />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            Content layer
          </div>
        </Stage>),
        },
        {
            title: "Pure gradient (no particles)",
            description: "grainAmount={0} Turns off film grain for a clean, gamut-distorted color field.",
            code: `<Grainient grainAmount={0} timeSpeed={0.18} />`,
            render: () => (<Stage>
          <Grainient grainAmount={0} timeSpeed={0.18}/>
        </Stage>),
        },
        {
            title: "Heavy grain film feel",
            description: "grainAmount Turn up + grainAnimated to make grain flicker over time, creating film noise.",
            code: `<Grainient grainAmount={0.22} grainAnimated contrast={1.7} />`,
            render: () => (<Stage>
          <Grainient grainAmount={0.22} grainAnimated contrast={1.7}/>
        </Stage>),
        },
        {
            title: "Customized three colors + zoom view",
            description: "color1/2/3 Pass any CSS color. The smaller the zoom, the larger the color field range you can see.",
            code: `<Grainient
  color1="oklch(0.82 0.16 70)"
  color2="oklch(0.62 0.2 30)"
  color3="oklch(0.32 0.06 300)"
  zoom={1.3}
  timeSpeed={0.35}
/>`,
            render: () => (<Stage>
          <Grainient color1="oklch(0.82 0.16 70)" color2="oklch(0.62 0.2 30)" color3="oklch(0.32 0.06 300)" zoom={1.3} timeSpeed={0.35}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "timeSpeed", type: "number", defaultValue: 0.25, label: "Time flow rate" },
        { prop: "grainAmount", type: "number", defaultValue: 0.1, label: "Particle strength" },
        { prop: "zoom", type: "number", defaultValue: 0.9, label: "Zoom" },
        { prop: "contrast", type: "number", defaultValue: 1.5, label: "Contrast" },
        { prop: "grainAnimated", type: "boolean", defaultValue: false, label: "Particle flashing" },
    ],
    states: [
        {
            name: "default (default parameters \u00B7 chart token three colors)",
            render: () => (<Stage>
          <Grainient />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            Grainient
          </div>
        </Stage>),
        },
        {
            name: "Pure gradient (grainAmount=0)",
            render: () => (<Stage>
          <Grainient grainAmount={0} timeSpeed={0.18}/>
        </Stage>),
        },
        {
            name: "Heavy grain film feel (grain flash)",
            render: () => (<Stage>
          <Grainient grainAmount={0.22} grainAnimated contrast={1.7}/>
        </Stage>),
        },
        {
            name: "Custom warm orange tone (custom three colors + zoom view)",
            render: () => (<Stage>
          <Grainient color1="oklch(0.82 0.16 70)" color2="oklch(0.62 0.2 30)" color3="oklch(0.32 0.06 300)" zoom={1.3} timeSpeed={0.35}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/70">Domain Distortion Gradient · Film Grain</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Grainient timeSpeed={p.timeSpeed as number} grainAmount={p.grainAmount as number} zoom={p.zoom as number} contrast={p.contrast as number} grainAnimated={p.grainAnimated as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/75">
        Grainient
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">`,
        `  <Grainient`,
        `    timeSpeed={${p.timeSpeed}}`,
        `    grainAmount={${p.grainAmount}}`,
        `    zoom={${p.zoom}}`,
        `    contrast={${p.contrast}}`,
        `    grainAnimated={${p.grainAnimated}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
