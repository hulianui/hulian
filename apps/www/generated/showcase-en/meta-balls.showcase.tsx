"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MetaBalls } from "../../../../packages/ui/src/meta-balls/meta-balls";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const metaBallsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The dark container is covered with absolute inset-0, and a group of slime balls swim around and merge with the pointer.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <MetaBalls className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Intensive group gathering",
            description: "Increase ballCount and tighten clumpFactor to make the balls denser and closer.",
            code: `<MetaBalls
  className="absolute inset-0"
  ballCount={28}
  clumpFactor={0.7}
  speed={0.5}
/>`,
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0" ballCount={28} clumpFactor={0.7} speed={0.5}/>
        </Stage>),
        },
        {
            title: "Custom color matching",
            description: "color and cursorBallColor are mixed with chart and token with the prefix --color-.",
            code: `<MetaBalls
  className="absolute inset-0"
  color="var(--color-chart-3)"
  cursorBallColor="var(--color-chart-5)"
  animationSize={40}
/>`,
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0" color="var(--color-chart-3)" cursorBallColor="var(--color-chart-5)" animationSize={40}/>
        </Stage>),
        },
        {
            title: "Turn off mouse interaction",
            description: "When enableMouseInteraction=false, the cursor ball automatically performs an elliptical tour.",
            code: `<MetaBalls
  className="absolute inset-0"
  enableMouseInteraction={false}
  speed={0.25}
/>`,
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0" enableMouseInteraction={false} speed={0.25}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.3, label: "Speed multiplier" },
        { prop: "ballCount", type: "number", defaultValue: 15, label: "Number of balls" },
        { prop: "animationSize", type: "number", defaultValue: 30, label: "Observation scale" },
        { prop: "clumpFactor", type: "number", defaultValue: 1, label: "Clustering factor" },
        {
            prop: "enableMouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse interaction",
        },
    ],
    states: [
        {
            name: "default (dark background \u00B7 default settings)",
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Dense grouping (multiple balls + small gathering factor)",
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0" ballCount={28} clumpFactor={0.7} speed={0.5}/>
        </Stage>),
        },
        {
            name: "Warm color mix (chart-3 + chart-5)",
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0" color="var(--color-chart-3)" cursorBallColor="var(--color-chart-5)" animationSize={40}/>
        </Stage>),
        },
        {
            name: "Automatic tour (turn off mouse interaction)",
            render: () => (<Stage>
          <MetaBalls className="absolute inset-0" enableMouseInteraction={false} speed={0.25}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <MetaBalls className="absolute inset-0" speed={p.speed as number} ballCount={p.ballCount as number} animationSize={p.animationSize as number} clumpFactor={p.clumpFactor as number} enableMouseInteraction={p.enableMouseInteraction as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <MetaBalls`,
        `    className="absolute inset-0"`,
        `    speed={${p.speed}}`,
        `    ballCount={${p.ballCount}}`,
        `    animationSize={${p.animationSize}}`,
        `    clumpFactor={${p.clumpFactor}}`,
        `    enableMouseInteraction={${p.enableMouseInteraction}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
