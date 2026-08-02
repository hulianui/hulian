"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Beams } from "../../../../packages/ui/src/beams/beams";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const beamsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative container and fill it up. The default oblique beam is chart token.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Beams />
</div>`,
            render: () => (<Stage>
          <Beams />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Beams
          </div>
        </Stage>),
        },
        {
            title: "Intensive vertical light curtain",
            description: "rotation=0 vertical, raise beamNumber, narrow beamWidth to form a dense light curtain.",
            code: `<Beams beamNumber={20} beamWidth={1.4} rotation={0} speed={3} />`,
            render: () => (<Stage>
          <Beams beamNumber={20} beamWidth={1.4} rotation={0} speed={3}/>
        </Stage>),
        },
        {
            title: "Customized light color",
            description: "lightColor passes any CSS color, beamWidth widens to create a warm orange wide beam.",
            code: `<Beams
  lightColor="oklch(0.78 0.18 55)"
  beamNumber={8}
  beamWidth={3}
  rotation={20}
  scale={0.3}
/>`,
            render: () => (<Stage>
          <Beams lightColor="oklch(0.78 0.18 55)" beamNumber={8} beamWidth={3} rotation={20} scale={0.3}/>
        </Stage>),
        },
        {
            title: "Pure and particle-free (wallpaper grade)",
            description: "noiseIntensity=0 Remove grain, slow down, and serve as a supporting background for the content.",
            code: `<Beams noiseIntensity={0} speed={1} beamNumber={14} rotation={35} />`,
            render: () => (<Stage>
          <Beams noiseIntensity={0} speed={1} beamNumber={14} rotation={35}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "beamNumber", type: "number", defaultValue: 12, label: "Number of beams" },
        { prop: "beamWidth", type: "number", defaultValue: 2, label: "Beam width" },
        { prop: "speed", type: "number", defaultValue: 2, label: "Flow speed" },
        { prop: "scale", type: "number", defaultValue: 0.2, label: "Noise Scaling" },
        { prop: "rotation", type: "number", defaultValue: 30, label: "Rotation angle\u00B0" },
        { prop: "noiseIntensity", type: "number", defaultValue: 1.75, label: "Particle strength" },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default settings)",
            render: () => (<Stage>
          <Beams />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Beams
          </div>
        </Stage>),
        },
        {
            name: "Dense vertical light curtain (rotation=0)",
            render: () => (<Stage>
          <Beams beamNumber={20} beamWidth={1.4} rotation={0} speed={3}/>
        </Stage>),
        },
        {
            name: "Warm orange wide beam (customized lightColor)",
            render: () => (<Stage>
          <Beams lightColor="oklch(0.78 0.18 55)" beamNumber={8} beamWidth={3} rotation={20} scale={0.3}/>
        </Stage>),
        },
        {
            name: "Pure and particle-free slow speed (wallpaper level)",
            render: () => (<Stage>
          <Beams noiseIntensity={0} speed={1} beamNumber={14} rotation={35}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Enterprise-grade · High quality · Native-ready</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Beams beamNumber={p.beamNumber as number} beamWidth={p.beamWidth as number} speed={p.speed as number} scale={p.scale as number} rotation={p.rotation as number} noiseIntensity={p.noiseIntensity as number}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Beams
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Beams`,
        `    beamNumber={${p.beamNumber}}`,
        `    beamWidth={${p.beamWidth}}`,
        `    speed={${p.speed}}`,
        `    scale={${p.scale}}`,
        `    rotation={${p.rotation}}`,
        `    noiseIntensity={${p.noiseIntensity}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
