"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Meteors } from "../../../../packages/ui/src/meteors/meteors";
function Sky({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const meteorsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put Meteors into a relative + overflow-hidden container. By default, 20 meteors will fall diagonally.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors />
  <div className="grid h-full place-items-center text-sm text-muted-foreground">Meteors</div>
</div>`,
            render: () => (<Sky>
          <Meteors />
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Meteors</div>
        </Sky>),
        },
        {
            title: "Number of meteors",
            description: "Use number to control meteor density, a small amount is more restrained, a large amount is more gorgeous.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={40} />
</div>`,
            render: () => (<Sky>
          <Meteors number={40}/>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">number=40</div>
        </Sky>),
        },
        {
            title: "Fall speed and delay",
            description: "minDuration / maxDuration controls the duration of a single meteor, and minDelay / maxDelay controls the staggered appearance.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={24} minDuration={3} maxDuration={6} minDelay={0} maxDelay={2} />
</div>`,
            render: () => (<Sky>
          <Meteors number={24} minDuration={3} maxDuration={6} minDelay={0} maxDelay={2}/>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Slow and scattered</div>
        </Sky>),
        },
        {
            title: "Fall angle",
            description: "angle Adjust the meteor falling direction (degrees), 215 is the default lower left, and can be changed to vertical or reverse.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={20} angle={250} />
</div>`,
            render: () => (<Sky>
          <Meteors number={20} angle={250}/>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">angle=250</div>
        </Sky>),
        },
        {
            title: "Custom color",
            description: "The meteor head/tail uses currentColor, and the color can be changed through the text-* class of className.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <Meteors number={24} className="text-primary" />
</div>`,
            render: () => (<Sky>
          <Meteors number={24} className="text-primary"/>
          <div className="grid h-full place-items-center text-sm text-muted-foreground">text-primary</div>
        </Sky>),
        },
    ],
    controls: [{ prop: "number", type: "number", defaultValue: 20 }],
    states: [
        {
            name: "default (20 meteors)",
            render: () => (<Sky>
          <Meteors />
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Meteors</div>
        </Sky>),
        },
    ],
    renderWithProps: (p) => (<Sky>
      <Meteors number={p.number as number}/>
      <div className="grid h-full place-items-center text-sm text-muted-foreground">Meteors</div>
    </Sky>),
    toCode: (p) => `<div className="relative overflow-hidden">
  <Meteors number={${p.number}} />
</div>`,
};
