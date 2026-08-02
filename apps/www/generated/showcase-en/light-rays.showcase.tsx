"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LightRays } from "../../../../packages/ui/src/light-rays/light-rays";
import type { LightRaysOrigin } from "../../../../packages/ui/src/light-rays/light-rays.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 265)" }}>
      {children}
    </div>);
}
const ORIGINS: LightRaysOrigin[] = [
    "top-center",
    "top-left",
    "top-right",
    "left",
    "right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
];
export const lightRaysShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default top-center radiates downward from the top center, and the component comes with absolute inset-0 z-0.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <LightRays raysOrigin="top-center" className="opacity-90" />
  <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
    LightRays
  </div>
</div>`,
            render: () => (<Stage>
          <LightRays raysOrigin="top-center" className="opacity-90"/>
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightRays
          </div>
        </Stage>),
        },
        {
            title: "Left side shot \u00B7 Warm color",
            description: "raysOrigin changes the direction, raysColor transfers warm colors, and lightSpread adjusts the focus.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <LightRays
    raysOrigin="left"
    raysColor="oklch(0.78 0.16 70)"
    lightSpread={0.8}
    className="opacity-90"
  />
</div>`,
            render: () => (<Stage>
          <LightRays raysOrigin="left" raysColor="oklch(0.78 0.16 70)" lightSpread={0.8} className="opacity-90"/>
        </Stage>),
        },
        {
            title: "Pulsating + Noise texture",
            description: "pulsating has overall brightness breathing, noiseAmount has superimposed subtle noise.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <LightRays
    raysOrigin="top-center"
    pulsating
    noiseAmount={0.25}
    raysSpeed={1.4}
    className="opacity-90"
  />
</div>`,
            render: () => (<Stage>
          <LightRays raysOrigin="top-center" pulsating noiseAmount={0.25} raysSpeed={1.4} className="opacity-90"/>
        </Stage>),
        },
        {
            title: "Bottom up shot \u00B7 Gathering narrow beam",
            description: "bottom-center + small lightSpread gather into a narrow beam, children stacks the header (note: component root aria-hidden).",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <LightRays
    raysOrigin="bottom-center"
    lightSpread={0.4}
    rayLength={2.6}
    distortion={0.3}
    followMouse={false}
    className="opacity-90"
  >
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <p className="text-lg font-semibold text-white">Hulian Component Library</p>
      <p className="text-xs text-white/60">Volume Beam \u00B7 WebGL \u00B7 token Coloring</p>
    </div>
  </LightRays>
</div>`,
            render: () => (<Stage>
          <LightRays raysOrigin="bottom-center" lightSpread={0.4} rayLength={2.6} distortion={0.3} followMouse={false} className="opacity-90">
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <p className="text-lg font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">Volume Beam · WebGL · token Shading</p>
            </div>
          </LightRays>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "raysOrigin",
            type: "select",
            options: ORIGINS,
            defaultValue: "top-center",
            label: "Beam origin",
        },
        { prop: "raysSpeed", type: "number", defaultValue: 1, label: "Speed multiplier" },
        { prop: "lightSpread", type: "number", defaultValue: 1, label: "Diffusion angle" },
        { prop: "rayLength", type: "number", defaultValue: 2, label: "Beam length" },
        { prop: "pulsating", type: "boolean", defaultValue: false, label: "Pulse" },
        {
            prop: "followMouse",
            type: "boolean",
            defaultValue: true,
            label: "Follow the mouse",
        },
    ],
    states: [
        {
            name: "default (top center radiation)",
            render: () => (<Stage>
          <LightRays raysOrigin="top-center" className="opacity-90"/>
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightRays
          </div>
        </Stage>),
        },
        {
            name: "Left side shot \u00B7 Warm color",
            render: () => (<Stage>
          <LightRays raysOrigin="left" raysColor="oklch(0.78 0.16 70)" lightSpread={0.8} className="opacity-90"/>
        </Stage>),
        },
        {
            name: "Pulsating + Noise texture",
            render: () => (<Stage>
          <LightRays raysOrigin="top-center" pulsating noiseAmount={0.25} raysSpeed={1.4} className="opacity-90"/>
        </Stage>),
        },
        {
            name: "Bottom up shot \u00B7 Gathering narrow beam",
            render: () => (<Stage>
          <LightRays raysOrigin="bottom-center" lightSpread={0.4} rayLength={2.6} distortion={0.3} followMouse={false} className="opacity-90">
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <p className="text-lg font-semibold text-white">Hulian component library</p>
              <p className="text-xs text-white/60">Volume Beam · WebGL · token Shading</p>
            </div>
          </LightRays>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LightRays raysOrigin={p.raysOrigin as LightRaysOrigin} raysSpeed={p.raysSpeed as number} lightSpread={p.lightSpread as number} rayLength={p.rayLength as number} pulsating={p.pulsating as boolean} followMouse={p.followMouse as boolean} className="opacity-90"/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        LightRays
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
        `  <LightRays`,
        `    raysOrigin="${p.raysOrigin}"`,
        `    raysSpeed={${p.raysSpeed}}`,
        `    lightSpread={${p.lightSpread}}`,
        `    rayLength={${p.rayLength}}`,
        `    pulsating={${p.pulsating}}`,
        `    followMouse={${p.followMouse}}`,
        `    className="opacity-90"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
