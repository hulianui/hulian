"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LaserFlow } from "../../../../packages/ui/src/laser-flow/laser-flow";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-72 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 285)" }}>
      {children}
    </div>);
}
export const laserFlowShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the dark container of relative + overflow-hidden. LaserFlow comes with absolute inset-0, and the content is stacked with z-10.",
            code: `<div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
  <LaserFlow />
  <div className="relative z-10 flex h-full items-center justify-center">
    LaserFlow
  </div>
</div>`,
            render: () => (<Stage>
          <LaserFlow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LaserFlow
          </div>
        </Stage>),
        },
        {
            title: "Custom color and fog",
            description: "color changes the laser color tone, fogIntensity adds fog, and fogScale controls the fineness of the mist.",
            code: `<LaserFlow
  color="oklch(0.72 0.2 35)"
  fogIntensity={0.6}
  fogScale={0.35}
/>`,
            render: () => (<Stage>
          <LaserFlow color="oklch(0.72 0.2 35)" fogIntensity={0.6} fogScale={0.35}/>
        </Stage>),
        },
        {
            title: "Dense Streamer\u00B7Fast Pulse",
            description: "wispDensity/wispIntensity encrypts micro-streamer, flowSpeed/flowStrength enhances pulse feeling.",
            code: `<LaserFlow
  wispDensity={1.6}
  wispIntensity={6}
  flowSpeed={0.55}
  flowStrength={0.4}
/>`,
            render: () => (<Stage>
          <LaserFlow wispDensity={1.6} wispIntensity={6} flowSpeed={0.55} flowStrength={0.4}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Volumetric Light · WebGL · Subject Awareness</p>
          </div>
        </Stage>),
        },
        {
            title: "Offset beam",
            description: "horizontalBeamOffset moves the beam laterally, verticalSizing elongates the beam.",
            code: `<LaserFlow
  horizontalBeamOffset={-0.18}
  verticalSizing={2.4}
  color="oklch(0.7 0.18 200)"
/>`,
            render: () => (<Stage>
          <LaserFlow horizontalBeamOffset={-0.18} verticalSizing={2.4} color="oklch(0.7 0.18 200)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "flowSpeed", type: "number", defaultValue: 0.35, label: "Optical flow speed" },
        { prop: "fogIntensity", type: "number", defaultValue: 0.45, label: "Fog intensity" },
        { prop: "wispIntensity", type: "number", defaultValue: 5, label: "Microstreamer intensity" },
        { prop: "horizontalBeamOffset", type: "number", defaultValue: 0, label: "Lateral offset" },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default settings)",
            render: () => (<Stage>
          <LaserFlow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LaserFlow
          </div>
        </Stage>),
        },
        {
            name: "Warm orange laser (custom color + high fog)",
            render: () => (<Stage>
          <LaserFlow color="oklch(0.72 0.2 35)" fogIntensity={0.6} fogScale={0.35}/>
        </Stage>),
        },
        {
            name: "Dense Streamer \u00B7 Fast Pulse (Wallpaper Level)",
            render: () => (<Stage>
          <LaserFlow wispDensity={1.6} wispIntensity={6} flowSpeed={0.55} flowStrength={0.4}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Volumetric Light · WebGL · Subject Awareness</p>
          </div>
        </Stage>),
        },
        {
            name: "Offset beam (lateral + long beam)",
            render: () => (<Stage>
          <LaserFlow horizontalBeamOffset={-0.18} verticalSizing={2.4} color="oklch(0.7 0.18 200)"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LaserFlow flowSpeed={p.flowSpeed as number} fogIntensity={p.fogIntensity as number} wispIntensity={p.wispIntensity as number} horizontalBeamOffset={p.horizontalBeamOffset as number}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        LaserFlow
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-72 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 285)" }}>`,
        `  <LaserFlow`,
        `    flowSpeed={${p.flowSpeed}}`,
        `    fogIntensity={${p.fogIntensity}}`,
        `    wispIntensity={${p.wispIntensity}}`,
        `    horizontalBeamOffset={${p.horizontalBeamOffset}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
