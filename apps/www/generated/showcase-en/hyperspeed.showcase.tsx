"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Hyperspeed } from "../../../../packages/ui/src/hyperspeed/hyperspeed";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-black">
      {children}
    </div>);
}
export const hyperspeedShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative black bottom container. The component comes with block h-full w-full. The size is controlled by the container.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <Hyperspeed className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Overlay title",
            description: "The light strip layer is aria-hidden, and the copywriting is placed on the upper layer pointer-events-none in the center.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed className="absolute inset-0" />
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
    Hyperspeed
  </div>
</div>`,
            render: () => (<Stage>
          <Hyperspeed className="absolute inset-0"/>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            Hyperspeed
          </div>
        </Stage>),
        },
        {
            title: "Full throttle (high-speed intensive)",
            description: "speed increases the volume + density increases the density to create a sense of hyperspace jump acceleration.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed speed={3} density={90} className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <Hyperspeed speed={3} density={90} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Straight tunnel (no twisting)",
            description: "distortion=0 The road turbulence swings off, and the light band rushes straight towards it.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed distortion={0} density={56} className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <Hyperspeed distortion={0} density={56} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Customized car light color",
            description: "leftColor / rightColor Pass any CSS color, overwriting the default chart token.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed
    leftColor="oklch(0.72 0.2 40)"
    rightColor="oklch(0.7 0.16 200)"
    speed={1.5}
    className="absolute inset-0"
  />
</div>`,
            render: () => (<Stage>
          <Hyperspeed leftColor="oklch(0.72 0.2 40)" rightColor="oklch(0.7 0.16 200)" speed={1.5} className="absolute inset-0"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 1, label: "Propulsion speed" },
        { prop: "density", type: "number", defaultValue: 40, label: "Light strip density" },
        { prop: "distortion", type: "number", defaultValue: 1, label: "Torsional strength" },
        { prop: "fade", type: "number", defaultValue: 0.4, label: "Fog fade out" },
    ],
    states: [
        {
            name: "default (default chart two-color car light)",
            render: () => (<Stage>
          <Hyperspeed className="absolute inset-0"/>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            Hyperspeed
          </div>
        </Stage>),
        },
        {
            name: "High speed and intensive (full throttle)",
            render: () => (<Stage>
          <Hyperspeed speed={3} density={90} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Straight tunnel (no twisting)",
            render: () => (<Stage>
          <Hyperspeed distortion={0} density={56} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Customized car light color (warm orange/green)",
            render: () => (<Stage>
          <Hyperspeed leftColor="oklch(0.72 0.2 40)" rightColor="oklch(0.7 0.16 200)" speed={1.5} className="absolute inset-0"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Hyperspeed speed={p.speed as number} density={p.density as number} distortion={p.distortion as number} fade={p.fade as number} className="absolute inset-0"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl bg-black">`,
        `  <Hyperspeed`,
        `    speed={${p.speed}}`,
        `    density={${p.density}}`,
        `    distortion={${p.distortion}}`,
        `    fade={${p.fade}}`,
        `    className="absolute inset-0"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
