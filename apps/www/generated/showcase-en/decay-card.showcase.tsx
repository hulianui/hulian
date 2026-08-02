"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DecayCard } from "../../../../packages/ui/src/decay-card/decay-card";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-[26rem] w-full items-center justify-center overflow-hidden rounded-xl border border-border p-8" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
const DEMO_IMG = "https://picsum.photos/seed/hulian-decay/300/400?grayscale";
export const decayCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When the mouse moves quickly across the image, the image is \"melted/dissolved\" by the turbulent displacement, stops and falls back; children renders text superimposed at the bottom.",
            code: `<DecayCard image="/cover.jpg">
  Hulian
  <br />
  Dissolve card
</DecayCard>`,
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG}>
            Hulian
            <br />
            Dissolve card
          </DecayCard>
        </Stage>),
        },
        {
            title: "Fine particles dissolve",
            description: "Improved baseFrequency and numOctaves, the noise is denser and the dissolved particles are finer.",
            code: `<DecayCard
  image="/cover.jpg"
  baseFrequency={0.04}
  numOctaves={6}
  seed={11}
>
  Fine noise
</DecayCard>`,
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG} baseFrequency={0.04} numOctaves={6} seed={11}>
            Fine noise
          </DecayCard>
        </Stage>),
        },
        {
            title: "Rough chunks",
            description: "Reduce baseFrequency, increase maxDisplacement, and dissolve it into a thick, silky texture.",
            code: `<DecayCard
  image="/cover.jpg"
  baseFrequency={0.008}
  maxDisplacement={600}
  seed={2}
>
  Coarse block
</DecayCard>`,
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG} baseFrequency={0.008} maxDisplacement={600} seed={2}>
            Coarse block
          </DecayCard>
        </Stage>),
        },
        {
            title: "Size and translation boundaries",
            description: "width / height controls the card size, and movementBound adjusts the soft border feel that follows the mouse translation.",
            code: `<DecayCard
  image="/cover.jpg"
  width={220}
  height={300}
  movementBound={90}
>
  Mini
</DecayCard>`,
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG} width={220} height={300} movementBound={90}>
            Mini
          </DecayCard>
        </Stage>),
        },
    ],
    controls: [
        { prop: "width", type: "number", defaultValue: 300, label: "Width px" },
        { prop: "height", type: "number", defaultValue: 400, label: "Height px" },
        { prop: "baseFrequency", type: "number", defaultValue: 0.015, label: "Turbulence frequency" },
        { prop: "numOctaves", type: "number", defaultValue: 5, label: "Number of frequency doubling layers" },
        { prop: "maxDisplacement", type: "number", defaultValue: 400, label: "Upper limit of displacement" },
        { prop: "movementBound", type: "number", defaultValue: 50, label: "Translation soft boundary" },
    ],
    states: [
        {
            name: "default (Default parameters \u00B7 Dissolve when the mouse is moved quickly)",
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG}>
            Hulian
            <br />
            Dissolve card
          </DecayCard>
        </Stage>),
        },
        {
            name: "Fine particle dissolution (high frequency + multi-frequency)",
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG} baseFrequency={0.04} numOctaves={6} seed={11}>
            Fine noise
          </DecayCard>
        </Stage>),
        },
        {
            name: "Rough and chunky (low frequency + large displacement)",
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG} baseFrequency={0.008} maxDisplacement={600} seed={2}>
            Coarse block
          </DecayCard>
        </Stage>),
        },
        {
            name: "Small size \u00B7 Strong translation boundaries",
            render: () => (<Stage>
          <DecayCard image={DEMO_IMG} width={220} height={300} movementBound={90}>
            Mini
          </DecayCard>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <DecayCard image={DEMO_IMG} width={p.width as number} height={p.height as number} baseFrequency={p.baseFrequency as number} numOctaves={p.numOctaves as number} maxDisplacement={p.maxDisplacement as number} movementBound={p.movementBound as number}>
        Hulian
      </DecayCard>
    </Stage>),
    toCode: (p) => [
        `<DecayCard`,
        `  image="/cover.jpg"`,
        `  width={${p.width}}`,
        `  height={${p.height}}`,
        `  baseFrequency={${p.baseFrequency}}`,
        `  numOctaves={${p.numOctaves}}`,
        `  maxDisplacement={${p.maxDisplacement}}`,
        `  movementBound={${p.movementBound}}`,
        `>`,
        `  Hulian`,
        `</DecayCard>`,
    ].join("\n"),
};
