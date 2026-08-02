"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FaultyTerminal } from "../../../../packages/ui/src/faulty-terminal/faulty-terminal";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.12 0.01 255)" }}>
      {children}
    </div>);
}
export const faultyTerminalShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Faulty CRT terminal character rain background; default character coloring is --color-chart-2, light and dark adaptive.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <FaultyTerminal />
</div>`,
            render: () => (<Stage>
          <FaultyTerminal />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
            FaultyTerminal
          </div>
        </Stage>),
        },
        {
            title: "Old CRT (warm orange + barrel distortion)",
            description: "tint changes to warm orange, curvature increases spherical curvature, and scanline + dispersion restores the texture of old picture tubes.",
            code: `<FaultyTerminal
  tint="oklch(0.72 0.2 45)"
  curvature={0.45}
  scanlineIntensity={0.5}
  chromaticAberration={3}
/>`,
            render: () => (<Stage>
          <FaultyTerminal tint="oklch(0.72 0.2 45)" curvature={0.45} scanlineIntensity={0.5} chromaticAberration={3}/>
        </Stage>),
        },
        {
            title: "Signal tearing (high fault volume)",
            description: "Increase glitchAmount / chromaticAberration / flickerAmount analog signal interference and tearing.",
            code: `<FaultyTerminal
  glitchAmount={2}
  chromaticAberration={5}
  flickerAmount={1.5}
  brightness={1.2}
/>`,
            render: () => (<Stage>
          <FaultyTerminal glitchAmount={2} chromaticAberration={5} flickerAmount={1.5} brightness={1.2}/>
        </Stage>),
        },
        {
            title: "Freeze Frame",
            description: "pause advances the pause time and freezes the picture; mouseReact=false turns off the mouse response to make a purely static cover.",
            code: `<FaultyTerminal pause scale={2} mouseReact={false} />`,
            render: () => (<Stage>
          <FaultyTerminal pause scale={2} mouseReact={false}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "scale", type: "number", defaultValue: 1.5, label: "Zoom" },
        { prop: "scanlineIntensity", type: "number", defaultValue: 0.3, label: "Scan line" },
        { prop: "curvature", type: "number", defaultValue: 0.2, label: "Barrel distortion" },
        { prop: "brightness", type: "number", defaultValue: 1, label: "Brightness" },
        { prop: "mouseReact", type: "boolean", defaultValue: true, label: "Mouse response" },
    ],
    states: [
        {
            name: "default (green character rain\u00B7default parameters)",
            render: () => (<Stage>
          <FaultyTerminal />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
            FaultyTerminal
          </div>
        </Stage>),
        },
        {
            name: "Warm orange tone + strong barrel distortion (old CRT)",
            render: () => (<Stage>
          <FaultyTerminal tint="oklch(0.72 0.2 45)" curvature={0.45} scanlineIntensity={0.5} chromaticAberration={3}/>
        </Stage>),
        },
        {
            name: "Dispersion + high fault volume (signal tearing)",
            render: () => (<Stage>
          <FaultyTerminal glitchAmount={2} chromaticAberration={5} flickerAmount={1.5} brightness={1.2}/>
        </Stage>),
        },
        {
            name: "Freeze frame (pause)",
            render: () => (<Stage>
          <FaultyTerminal pause scale={2} mouseReact={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FaultyTerminal scale={p.scale as number} scanlineIntensity={p.scanlineIntensity as number} curvature={p.curvature as number} brightness={p.brightness as number} mouseReact={p.mouseReact as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.01 255)" }}>`,
        `  <FaultyTerminal`,
        `    scale={${p.scale}}`,
        `    scanlineIntensity={${p.scanlineIntensity}}`,
        `    curvature={${p.curvature}}`,
        `    brightness={${p.brightness}}`,
        `    mouseReact={${p.mouseReact}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
