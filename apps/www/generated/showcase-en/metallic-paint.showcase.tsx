"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MetallicPaint } from "../../../../packages/ui/src/metallic-paint/metallic-paint";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.12 0.01 255)" }}>
      {children}
    </div>);
}
export const metallicPaintShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A liquid metal paint background covered with dark containers, which can be superimposed with centered text.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.01 255)" }}>
  <MetallicPaint className="opacity-95" />
  <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
    Metallic Paint
  </div>
</div>`,
            render: () => (<Stage>
          <MetallicPaint className="opacity-95"/>
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/70">
            Metallic Paint
          </div>
        </Stage>),
        },
        {
            title: "High liquid flow",
            description: "Turn up liquid and speed, the metal surface looks like flowing mercury.",
            code: `<MetallicPaint liquid={1} speed={1.4} className="opacity-95" />`,
            render: () => (<Stage>
          <MetallicPaint liquid={1} speed={1.4} className="opacity-95"/>
        </Stage>),
        },
        {
            title: "Strong refractive iridescence",
            description: "Improve refraction and strengthen RGB three-channel dislocation, with chart color to achieve iridescent color dispersion.",
            code: `<MetallicPaint
  refraction={1.8}
  lightColor="var(--color-chart-2)"
  className="opacity-95"
/>`,
            render: () => (<Stage>
          <MetallicPaint refraction={1.8} lightColor="var(--color-chart-2)" className="opacity-95"/>
        </Stage>),
        },
        {
            title: "Static mirror",
            description: "Lower liquid/refraction/speed and raise blur to get a flat mirror metal.",
            code: `<MetallicPaint
  liquid={0.1}
  refraction={0.5}
  speed={0.4}
  blur={1}
  className="opacity-95"
/>`,
            render: () => (<Stage>
          <MetallicPaint liquid={0.1} refraction={0.5} speed={0.4} blur={1} className="opacity-95"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 1, label: "Flow speed" },
        { prop: "scale", type: "number", defaultValue: 1, label: "Texture Scaling" },
        { prop: "refraction", type: "number", defaultValue: 1, label: "Refraction intensity" },
        { prop: "liquid", type: "number", defaultValue: 0.6, label: "Liquid Disturbance" },
        { prop: "blur", type: "number", defaultValue: 0.6, label: "Blurred edges" },
        { prop: "angle", type: "number", defaultValue: -45, label: "Light angle" },
    ],
    states: [
        {
            name: "default (chart-1 Highlight \u00B7 Default parameters)",
            render: () => (<Stage>
          <MetallicPaint className="opacity-95"/>
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/70">
            Metallic Paint
          </div>
        </Stage>),
        },
        {
            name: "High liquid state (mercury flow)",
            render: () => (<Stage>
          <MetallicPaint liquid={1} speed={1.4} className="opacity-95"/>
        </Stage>),
        },
        {
            name: "Strong refraction (iridescent dispersion)",
            render: () => (<Stage>
          <MetallicPaint refraction={1.8} lightColor="var(--color-chart-2)" className="opacity-95"/>
        </Stage>),
        },
        {
            name: "Static mirror (low liquid low refraction)",
            render: () => (<Stage>
          <MetallicPaint liquid={0.1} refraction={0.5} speed={0.4} blur={1} className="opacity-95"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <MetallicPaint speed={p.speed as number} scale={p.scale as number} refraction={p.refraction as number} liquid={p.liquid as number} blur={p.blur as number} angle={p.angle as number} className="opacity-95"/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/60">
        Metallic Paint
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.01 255)" }}>`,
        `  <MetallicPaint`,
        `    speed={${p.speed}}`,
        `    scale={${p.scale}}`,
        `    refraction={${p.refraction}}`,
        `    liquid={${p.liquid}}`,
        `    blur={${p.blur}}`,
        `    angle={${p.angle}}`,
        `    className="opacity-95"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
