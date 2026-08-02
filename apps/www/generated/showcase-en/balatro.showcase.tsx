"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Balatro } from "../../../../packages/ui/src/balatro/balatro";
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{ background: dark ? "oklch(0.12 0.02 270)" : "oklch(0.96 0.005 270)" }}>
      {children}
    </div>);
}
export const balatroShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative container and it will be filled. The three colors will be chart token adaptive light and dark by default.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <Balatro />
  <div className="relative z-10">Content</div>
</div>`,
            render: () => (<Stage>
          <Balatro />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Balatro</p>
            <p className="text-sm text-white/50">Spiral oil paint WebGL background</p>
          </div>
        </Stage>),
        },
        {
            title: "Continuous rotation",
            description: "isRotate lets the vortex continue to rotate over time, and spinSpeed controls the turbulence speed.",
            code: `<Balatro isRotate spinSpeed={4} />`,
            render: () => (<Stage>
          <Balatro isRotate spinSpeed={4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">isRotate</p>
          </div>
        </Stage>),
        },
        {
            title: "Retro Mosaic",
            description: "Turn down pixelFilter to make the pixel blocks larger, creating a low-resolution mosaic texture.",
            code: `<Balatro pixelFilter={120} contrast={4} />`,
            render: () => (<Stage>
          <Balatro pixelFilter={120} contrast={4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">pixelFilter = 120</p>
          </div>
        </Stage>),
        },
        {
            title: "Custom color matching",
            description: "color1/2/3 can transfer any CSS color to create exclusive oil paint vortex.",
            code: `<Balatro
  color1="oklch(0.72 0.2 40)"
  color2="oklch(0.6 0.18 25)"
  color3="oklch(0.18 0.04 30)"
  spinSpeed={5}
  lighting={0.6}
/>`,
            render: () => (<Stage>
          <Balatro color1="oklch(0.72 0.2 40)" color2="oklch(0.6 0.18 25)" color3="oklch(0.18 0.04 30)" spinSpeed={5} lighting={0.6}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">Warm orange oil paint</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "spinSpeed", type: "number", defaultValue: 7, label: "Flow speed" },
        { prop: "contrast", type: "number", defaultValue: 3.5, label: "Contrast" },
        { prop: "lighting", type: "number", defaultValue: 0.4, label: "High light intensity" },
        { prop: "pixelFilter", type: "number", defaultValue: 745, label: "Pixel fineness" },
        { prop: "spinAmount", type: "number", defaultValue: 0.25, label: "Rotation attenuation" },
        { prop: "isRotate", type: "boolean", defaultValue: false, label: "Continuous rotation" },
        { prop: "mouseInteraction", type: "boolean", defaultValue: true, label: "Mouse interaction" },
    ],
    states: [
        {
            name: "default (dark bottom\u00B7chart token three colors)",
            render: () => (<Stage>
          <Balatro />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">Balatro</p>
            <p className="text-sm text-white/50">Spiral oil paint WebGL background</p>
          </div>
        </Stage>),
        },
        {
            name: "Continuous rotation (isRotate)",
            render: () => (<Stage>
          <Balatro isRotate spinSpeed={4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">isRotate</p>
          </div>
        </Stage>),
        },
        {
            name: "Retro mosaic (pixelFilter=120)",
            render: () => (<Stage>
          <Balatro pixelFilter={120} contrast={4}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">pixelFilter = 120</p>
          </div>
        </Stage>),
        },
        {
            name: "Custom warm orange swirl",
            render: () => (<Stage>
          <Balatro color1="oklch(0.72 0.2 40)" color2="oklch(0.6 0.18 25)" color3="oklch(0.18 0.04 30)" spinSpeed={5} lighting={0.6}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">Warm orange oil paint</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Balatro spinSpeed={p.spinSpeed as number} contrast={p.contrast as number} lighting={p.lighting as number} pixelFilter={p.pixelFilter as number} spinAmount={p.spinAmount as number} isRotate={p.isRotate as boolean} mouseInteraction={p.mouseInteraction as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">Balatro · Spiral oil paint background</p>
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.02 270)" }}>`,
        `  <Balatro`,
        `    spinSpeed={${p.spinSpeed}}`,
        `    contrast={${p.contrast}}`,
        `    lighting={${p.lighting}}`,
        `    pixelFilter={${p.pixelFilter}}`,
        `    spinAmount={${p.spinAmount}}`,
        `    isRotate={${p.isRotate}}`,
        `    mouseInteraction={${p.mouseInteraction}}`,
        `  />`,
        `  <div className="relative z-10">Content</div>`,
        `</div>`,
    ].join("\n"),
};
