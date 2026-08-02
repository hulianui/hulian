import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Ripple } from "../../../../packages/ui/src/ripple/ripple";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-xl border border-border bg-surface">
      {children}
      <span className="z-10 text-sm font-medium text-foreground">Ripple</span>
    </div>);
}
export const rippleShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "relative + place-items-center Place a layer of Ripple in the container to obtain concentric pulse rings, often used as hero/empty state background.",
            code: `<div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-xl border border-border bg-surface">
  <Ripple />
  <span className="z-10 text-sm font-medium">Ripple</span>
</div>`,
            render: () => (<Frame>
          <Ripple mainCircleSize={160}/>
        </Frame>),
        },
        {
            title: "Number of turns and starting size",
            description: "numCircles controls the number of turns, mainCircleSize controls the diameter of the innermost circle - fewer turns are more focused.",
            code: `<div className="relative grid place-items-center ...">
  <Ripple mainCircleSize={140} numCircles={5} />
</div>`,
            render: () => (<Frame>
          <Ripple mainCircleSize={140} numCircles={5}/>
        </Frame>),
        },
        {
            title: "Change color and opacity",
            description: "Take currentColor for the border and use text-* to change the color; mainCircleOpacity adjusts the starting opacity of the innermost circle.",
            code: `<div className="relative grid place-items-center ...">
  <Ripple mainCircleSize={150} className="text-primary" mainCircleOpacity={0.35} />
</div>`,
            render: () => (<Frame>
          <Ripple mainCircleSize={150} className="text-primary" mainCircleOpacity={0.35}/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "mainCircleSize", type: "number", defaultValue: 180 },
        { prop: "numCircles", type: "number", defaultValue: 8 },
        { prop: "mainCircleOpacity", type: "number", defaultValue: 0.24 },
    ],
    states: [
        {
            name: "default (8 pulses)",
            render: () => (<Frame>
          <Ripple mainCircleSize={160}/>
        </Frame>),
        },
        {
            name: "Less circle \u00B7 text-primary",
            render: () => (<Frame>
          <Ripple mainCircleSize={140} numCircles={5} className="text-primary"/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <Ripple mainCircleSize={p.mainCircleSize as number} numCircles={p.numCircles as number} mainCircleOpacity={p.mainCircleOpacity as number}/>
    </Frame>),
    toCode: (p) => `<div className="relative grid place-items-center">
  <Ripple mainCircleSize={${p.mainCircleSize}} numCircles={${p.numCircles}} />
</div>`,
};
