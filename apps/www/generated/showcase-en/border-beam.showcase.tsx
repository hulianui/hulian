"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BorderBeam } from "../../../../packages/ui/src/border-beam/border-beam";
function Card({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-40 w-72 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const borderBeamShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "BorderBeam is the overlay of absolute inset-0. When placed in the relative + rounded + overflow-hidden container, a beam of light will be routed along the border. Default primary\u2192chart-2 gradient.",
            code: `<div className="relative h-40 w-72 overflow-hidden rounded-xl border border-border bg-surface">
  <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
  <BorderBeam />
</div>`,
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
          <BorderBeam />
        </Card>),
        },
        {
            title: "Reverse \u00B7 Slow down",
            description: "reverse makes the beam go around in the reverse direction, duration adjusts the seconds of one revolution, and size adjusts the length of the beam square.",
            code: `<BorderBeam reverse duration={10} size={80} />`,
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted">Reverse</div>
          <BorderBeam reverse duration={10} size={80}/>
        </Card>),
        },
        {
            title: "Custom color",
            description: "colorFrom / colorTo can be replaced with any CSS color or token, showing the brand color beam.",
            code: `<BorderBeam colorFrom="var(--color-chart-3)" colorTo="var(--color-chart-5)" borderWidth={2} />`,
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted">Custom Color</div>
          <BorderBeam colorFrom="var(--color-chart-3)" colorTo="var(--color-chart-5)" borderWidth={2}/>
        </Card>),
        },
    ],
    controls: [
        { prop: "duration", type: "number", defaultValue: 6 },
        { prop: "size", type: "number", defaultValue: 60 },
    ],
    states: [
        {
            name: "default (primary\u2192chart beam wrapping)",
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
          <BorderBeam />
        </Card>),
        },
        {
            name: "Reverse \u00B7 Slow",
            render: () => (<Card>
          <div className="grid h-full place-items-center text-sm text-muted">Reverse</div>
          <BorderBeam reverse duration={10} size={80}/>
        </Card>),
        },
    ],
    renderWithProps: (p) => (<Card>
      <div className="grid h-full place-items-center text-sm text-muted">Border Beam</div>
      <BorderBeam duration={p.duration as number} size={p.size as number}/>
    </Card>),
    toCode: (p) => `<div className="relative">
  ...content
  <BorderBeam duration={${p.duration}} size={${p.size}} />
</div>`,
};
