"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LightPillar } from "../../../../packages/ui/src/light-pillar/light-pillar";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.12 0.02 270)" }}>
      {children}
    </div>);
}
export const lightPillarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default top/bottom color is chart token, and the component comes with absolute inset-0 z-0.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar />
  <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
    LightPillar
  </div>
</div>`,
            render: () => (<Stage>
          <LightPillar />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightPillar
          </div>
        </Stage>),
        },
        {
            title: "Customized two-color (original purple\u2192pink)",
            description: "topColor / bottomColor Gradient blending along the y axis creates color depth.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.1} />
</div>`,
            render: () => (<Stage>
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.1}/>
        </Stage>),
        },
        {
            title: "Fine laser (narrow column\u00B7no particles)",
            description: "pillarWidth fine tune + glowAmount brighten, noiseIntensity=0 remove grain.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
</div>`,
            render: () => (<Stage>
          <LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2}/>
        </Stage>),
        },
        {
            title: "Tilt light beam (slow rotation)",
            description: "pillarRotation makes the light beam slant, and rotationSpeed slows down the rotation.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 270)" }}>
  <LightPillar pillarRotation={30} rotationSpeed={0.15} pillarWidth={2.4} />
</div>`,
            render: () => (<Stage>
          <LightPillar pillarRotation={30} rotationSpeed={0.15} pillarWidth={2.4}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "intensity", type: "number", defaultValue: 1, label: "Brightness coefficient" },
        { prop: "rotationSpeed", type: "number", defaultValue: 0.3, label: "Rotation speed" },
        { prop: "pillarWidth", type: "number", defaultValue: 3, label: "Light beam thickness" },
        { prop: "noiseIntensity", type: "number", defaultValue: 0.5, label: "Particle strength" },
    ],
    states: [
        {
            name: "default (token two-color\u00B7default parameters)",
            render: () => (<Stage>
          <LightPillar />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LightPillar
          </div>
        </Stage>),
        },
        {
            name: "Customized two-color (purple \u2192 pink, original color)",
            render: () => (<Stage>
          <LightPillar topColor="#5227FF" bottomColor="#FF9FFC" intensity={1.1}/>
        </Stage>),
        },
        {
            name: "Fine laser (narrow column, high brightness, no particles)",
            render: () => (<Stage>
          <LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2}/>
        </Stage>),
        },
        {
            name: "Inclined light beam (30\u00B0\u00B7slow rotation)",
            render: () => (<Stage>
          <LightPillar pillarRotation={30} rotationSpeed={0.15} pillarWidth={2.4}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LightPillar intensity={p.intensity as number} rotationSpeed={p.rotationSpeed as number} pillarWidth={p.pillarWidth as number} noiseIntensity={p.noiseIntensity as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.02 270)" }}>`,
        `  <LightPillar`,
        `    intensity={${p.intensity}}`,
        `    rotationSpeed={${p.rotationSpeed}}`,
        `    pillarWidth={${p.pillarWidth}}`,
        `    noiseIntensity={${p.noiseIntensity}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
