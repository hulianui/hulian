"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DarkVeil } from "../../../../packages/ui/src/dark-veil/dark-veil";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.12 0.02 280)" }}>
      {children}
    </div>);
}
export const darkVeilShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default cool dark color curtain can be placed in the relative container to cover it.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 280)" }}>
  <DarkVeil />
</div>`,
            render: () => (<Stage>
          <DarkVeil />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            DarkVeil
          </div>
        </Stage>),
        },
        {
            title: "Hue Shift + Distortion",
            description: "hueShift Rotating keynote, warpAmount gives the curtain a sense of wave refraction.",
            code: `<DarkVeil hueShift={120} warpAmount={0.08} speed={0.6} />`,
            render: () => (<Stage>
          <DarkVeil hueShift={120} warpAmount={0.08} speed={0.6}/>
        </Stage>),
        },
        {
            title: "Retro Monitor",
            description: "scanline + noise overlay CRT scan lines and film grain texture.",
            code: `<DarkVeil
  hueShift={200}
  scanlineIntensity={0.35}
  scanlineFrequency={1.6}
  noiseIntensity={0.04}
  speed={0.4}
/>`,
            render: () => (<Stage>
          <DarkVeil hueShift={200} scanlineIntensity={0.35} scanlineFrequency={1.6} noiseIntensity={0.04} speed={0.4}/>
        </Stage>),
        },
        {
            title: "Wallpaper level (power saving)",
            description: "Slow + resolutionScale Downsampling saves power and serves as content support background.",
            code: `<DarkVeil hueShift={60} speed={0.25} resolutionScale={0.6} />`,
            render: () => (<Stage>
          <DarkVeil hueShift={60} speed={0.25} resolutionScale={0.6}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Profound · Restraint · Native Adaptation</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "hueShift", type: "number", defaultValue: 0, label: "Hue Shift \u00B0" },
        { prop: "speed", type: "number", defaultValue: 0.5, label: "Flow speed" },
        { prop: "warpAmount", type: "number", defaultValue: 0, label: "Space distortion" },
        {
            prop: "scanlineIntensity",
            type: "number",
            defaultValue: 0,
            label: "Scan line intensity",
        },
        {
            prop: "scanlineFrequency",
            type: "number",
            defaultValue: 0,
            label: "Scan line frequency",
        },
        {
            prop: "noiseIntensity",
            type: "number",
            defaultValue: 0,
            label: "Grainy noise",
        },
    ],
    states: [
        {
            name: "default (default cold curtain)",
            render: () => (<Stage>
          <DarkVeil />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            DarkVeil
          </div>
        </Stage>),
        },
        {
            name: "Hue Shift + Distortion (warm purple fluctuation)",
            render: () => (<Stage>
          <DarkVeil hueShift={120} warpAmount={0.08} speed={0.6}/>
        </Stage>),
        },
        {
            name: "Retro monitor (scanline + grain)",
            render: () => (<Stage>
          <DarkVeil hueShift={200} scanlineIntensity={0.35} scanlineFrequency={1.6} noiseIntensity={0.04} speed={0.4}/>
        </Stage>),
        },
        {
            name: "Wallpaper level (slow speed \u00B7 half resolution power saving)",
            render: () => (<Stage>
          <DarkVeil hueShift={60} speed={0.25} resolutionScale={0.6}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Profound · Restraint · Native Adaptation</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <DarkVeil hueShift={p.hueShift as number} speed={p.speed as number} warpAmount={p.warpAmount as number} scanlineIntensity={p.scanlineIntensity as number} scanlineFrequency={p.scanlineFrequency as number} noiseIntensity={p.noiseIntensity as number}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        DarkVeil
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.02 280)" }}>`,
        `  <DarkVeil`,
        `    hueShift={${p.hueShift}}`,
        `    speed={${p.speed}}`,
        `    warpAmount={${p.warpAmount}}`,
        `    scanlineIntensity={${p.scanlineIntensity}}`,
        `    scanlineFrequency={${p.scanlineFrequency}}`,
        `    noiseIntensity={${p.noiseIntensity}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
