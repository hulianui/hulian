"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Antigravity } from "../../../../packages/ui/src/antigravity/antigravity";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
      <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-white/40">
        Move the mouse to absorb particles
      </span>
    </div>);
}
export const antigravityShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "By default, short stick particles fill the container. Moving the mouse will suck nearby particles into the orbit around the cursor.",
            code: `<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <Antigravity className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <Antigravity className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Shape and Color",
            description: "shape Optional bar / dot / square; color Accepts any CSS color or theme token.",
            code: `<Antigravity
  className="absolute inset-0"
  shape="dot"
  color="oklch(0.72 0.22 30)"
  count={320}
/>`,
            render: () => (<Stage>
          <Antigravity className="absolute inset-0" shape="dot" color="oklch(0.72 0.22 30)" count={320}/>
        </Stage>),
        },
        {
            title: "Automatic patrol",
            description: "autoAnimate Make the cursor stationary 2s and then the particles will cruise on their own, suitable for unattended large-screen display.",
            code: `<Antigravity
  className="absolute inset-0"
  autoAnimate
  rotationSpeed={0.4}
  shape="square"
  color="var(--color-chart-2)"
/>`,
            render: () => (<Stage>
          <Antigravity className="absolute inset-0" autoAnimate rotationSpeed={0.4} shape="square" color="var(--color-chart-2)"/>
        </Stage>),
        },
        {
            title: "Large magnetic field \u00B7 Large ring",
            description: "Turn up the magnetRadius / ringRadius / waveAmplitude for a more stretched, organic track.",
            code: `<Antigravity
  className="absolute inset-0"
  magnetRadius={200}
  ringRadius={90}
  waveAmplitude={18}
  color="var(--color-chart-4)"
/>`,
            render: () => (<Stage>
          <Antigravity className="absolute inset-0" magnetRadius={200} ringRadius={90} waveAmplitude={18} color="var(--color-chart-4)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "count", type: "number", defaultValue: 240, label: "Number of particles" },
        { prop: "magnetRadius", type: "number", defaultValue: 130, label: "Magnetic radius px" },
        { prop: "ringRadius", type: "number", defaultValue: 56, label: "Ring radius px" },
        { prop: "particleSize", type: "number", defaultValue: 4, label: "Particle size px" },
        {
            prop: "shape",
            type: "select",
            options: ["bar", "dot", "square"],
            defaultValue: "bar",
            label: "Shape",
        },
        { prop: "autoAnimate", type: "boolean", defaultValue: false, label: "Automatic patrol" },
    ],
    states: [
        {
            name: "default (short stick\u00B7default parameters)",
            render: () => (<Stage>
          <Antigravity className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Dot \u00B7 Warm Orange",
            render: () => (<Stage>
          <Antigravity className="absolute inset-0" shape="dot" color="oklch(0.72 0.22 30)" count={320}/>
        </Stage>),
        },
        {
            name: "Automatic patrol (moves even without human operation)",
            render: () => (<Stage>
          <Antigravity className="absolute inset-0" autoAnimate rotationSpeed={0.4} shape="square" color="var(--color-chart-2)"/>
        </Stage>),
        },
        {
            name: "Large magnetic field \u00B7 Large ring",
            render: () => (<Stage>
          <Antigravity className="absolute inset-0" magnetRadius={200} ringRadius={90} waveAmplitude={18} color="var(--color-chart-4)"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Antigravity className="absolute inset-0" count={p.count as number} magnetRadius={p.magnetRadius as number} ringRadius={p.ringRadius as number} particleSize={p.particleSize as number} shape={p.shape as "bar" | "dot" | "square"} autoAnimate={p.autoAnimate as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Antigravity`,
        `    className="absolute inset-0"`,
        `    count={${p.count}}`,
        `    magnetRadius={${p.magnetRadius}}`,
        `    ringRadius={${p.ringRadius}}`,
        `    particleSize={${p.particleSize}}`,
        `    shape="${p.shape}"`,
        `    autoAnimate={${p.autoAnimate}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
