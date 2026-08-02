"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PlasmaWave } from "../../../../packages/ui/src/plasma-wave/plasma-wave";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 280)" }}>
      {children}
    </div>);
}
export const plasmaWaveShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative overflow-hidden container and fill it with className=\"absolute inset-0\"; the two-color default is chart token with adaptive light and dark.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PlasmaWave className="absolute inset-0" />
  <div className="absolute inset-0 flex items-center justify-center text-white/80">
    PlasmaWave
  </div>
</div>`,
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0"/>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PlasmaWave
          </div>
        </Stage>),
        },
        {
            title: "Oblique rotation + strong focus",
            description: "rotationDeg The overall rotating wave belt creates oblique tension; focalLength The larger the corrugations are, the more concentrated they are and the deeper they are.",
            code: `<PlasmaWave className="absolute inset-0" rotationDeg={28} focalLength={1.3} />`,
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0" rotationDeg={28} focalLength={1.3}/>
        </Stage>),
        },
        {
            title: "Hedging flow direction \u00B7 Warm color",
            description: "colors Custom two-color; dir2={-1} Let the second ribbon flow in the opposite direction to create a sense of interweaving with the first one.",
            code: `<PlasmaWave
  className="absolute inset-0"
  colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]}
  dir2={-1}
  speed1={0.1}
  speed2={0.08}
  bend1={1.4}
/>`,
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0" colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]} dir2={-1} speed1={0.1} speed2={0.08} bend1={1.4}/>
        </Stage>),
        },
        {
            title: "Wallpaper-level slow bending",
            description: "Low speed + large bend makes the ripples slowly rise and fall, as the background of the title area is superimposed under the text.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PlasmaWave
    className="absolute inset-0"
    speed1={0.03}
    speed2={0.03}
    bend1={1.6}
    bend2={1.2}
    focalLength={0.6}
  />
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Plasma Wave \u00B7 WebGL \u00B7 Subject Perception</p>
  </div>
</div>`,
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0" speed1={0.03} speed2={0.03} bend1={1.6} bend2={1.2} focalLength={0.6}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Plasma Wave · WebGL · Subject Perception</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "rotationDeg", type: "number", defaultValue: 0, label: "Rotation angle \u00B0" },
        { prop: "focalLength", type: "number", defaultValue: 0.8, label: "Focal length" },
        { prop: "speed1", type: "number", defaultValue: 0.05, label: "Ribbon 1 flow rate" },
        { prop: "speed2", type: "number", defaultValue: 0.05, label: "Ribbon 2 Flow rate" },
        { prop: "bend1", type: "number", defaultValue: 1, label: "Ribbon 1 Bend" },
        { prop: "bend2", type: "number", defaultValue: 0.5, label: "Ribbon 2 Bend" },
    ],
    states: [
        {
            name: "default (chart token two-color)",
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0"/>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PlasmaWave
          </div>
        </Stage>),
        },
        {
            name: "Oblique rotation + strong focus",
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0" rotationDeg={28} focalLength={1.3}/>
        </Stage>),
        },
        {
            name: "Hedging flow direction (dir2 reverse) + warm color",
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0" colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]} dir2={-1} speed1={0.1} speed2={0.08} bend1={1.4}/>
        </Stage>),
        },
        {
            name: "Wallpaper level (slow big bend)",
            render: () => (<Stage>
          <PlasmaWave className="absolute inset-0" speed1={0.03} speed2={0.03} bend1={1.6} bend2={1.2} focalLength={0.6}/>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Plasma Wave · WebGL · Subject Perception</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PlasmaWave className="absolute inset-0" rotationDeg={p.rotationDeg as number} focalLength={p.focalLength as number} speed1={p.speed1 as number} speed2={p.speed2 as number} bend1={p.bend1 as number} bend2={p.bend2 as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
        `  <PlasmaWave`,
        `    className="absolute inset-0"`,
        `    rotationDeg={${p.rotationDeg}}`,
        `    focalLength={${p.focalLength}}`,
        `    speed1={${p.speed1}}`,
        `    speed2={${p.speed2}}`,
        `    bend1={${p.bend1}}`,
        `    bend2={${p.bend2}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
