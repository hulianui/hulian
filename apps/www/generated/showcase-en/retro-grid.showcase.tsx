import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RetroGrid } from "../../../../packages/ui/src/retro-grid/retro-grid";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const retroGridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "relative Place a layer of RetroGrid in the container to get a perspective scrolling grid, with a default tilt angle of 65\u00B0, 12s round, and text-border.",
            code: `<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <RetroGrid />
</div>`,
            render: () => (<Frame>
          <RetroGrid />
        </Frame>),
        },
        {
            title: "Mig \u00B7 Slow",
            description: "cellSize adjusts the grid density, and duration adjusts the rolling period (the larger it is, the slower it is).",
            code: `<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <RetroGrid cellSize={36} duration={24} />
</div>`,
            render: () => (<Frame>
          <RetroGrid cellSize={36} duration={24}/>
        </Frame>),
        },
        {
            title: "Color change and transparency",
            description: "Set the thread color to currentColor, use text-* to change the color; opacity adjusts the overall fade-in level.",
            code: `<div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <RetroGrid className="text-primary" opacity={0.7} />
</div>`,
            render: () => (<Frame>
          <RetroGrid className="text-primary" opacity={0.7}/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "cellSize", type: "number", defaultValue: 60 },
        { prop: "duration", type: "number", defaultValue: 12 },
        { prop: "opacity", type: "number", defaultValue: 0.5 },
    ],
    states: [
        {
            name: "default (65\u00B0 \u00B7 Rolling)",
            render: () => (<Frame>
          <RetroGrid />
        </Frame>),
        },
        {
            name: "Mig \u00B7 Slow \u00B7 text-primary",
            render: () => (<Frame>
          <RetroGrid cellSize={36} duration={24} className="text-primary"/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <RetroGrid cellSize={p.cellSize as number} duration={p.duration as number} opacity={p.opacity as number}/>
    </Frame>),
    toCode: (p) => `<div className="relative">
  <RetroGrid cellSize={${p.cellSize}} duration={${p.duration}} opacity={${p.opacity}} />
</div>`,
};
