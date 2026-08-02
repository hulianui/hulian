import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FlickeringGrid } from "../../../../packages/ui/src/flickering-grid/flickering-grid";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const flickeringGridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative + overflow-hidden container and fill it with absolute inset-0; the theme foreground color is used by default, and the 4px squares flash randomly.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <FlickeringGrid className="absolute inset-0" />
</div>`,
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0"/>
        </Frame>),
        },
        {
            title: "Custom color",
            description: "color supports the CSS variable, passing the highlighted color token and raising the maxOpacity to make the grid more eye-catching.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <FlickeringGrid className="absolute inset-0" color="var(--color-primary)" maxOpacity={0.5} />
</div>`,
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" color="var(--color-primary)" maxOpacity={0.5}/>
        </Frame>),
        },
        {
            title: "Square size and spacing",
            description: "squareSize / gridGap determines the grid density, increase the grid + reduce flickerChance to get a steady large grid flash.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <FlickeringGrid
    className="absolute inset-0"
    squareSize={8}
    gridGap={4}
    flickerChance={0.1}
    maxOpacity={0.4}
  />
</div>`,
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" squareSize={8} gridGap={4} flickerChance={0.1} maxOpacity={0.4}/>
        </Frame>),
        },
        {
            title: "High frequency intensive flashing",
            description: "Small square + high flickerChance simulates data flow/cyber texture.",
            code: `<div className="relative h-48 w-80 overflow-hidden rounded-xl border border-border bg-surface">
  <FlickeringGrid
    className="absolute inset-0"
    squareSize={2}
    gridGap={2}
    flickerChance={0.7}
    maxOpacity={0.25}
  />
</div>`,
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" squareSize={2} gridGap={2} flickerChance={0.7} maxOpacity={0.25}/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "squareSize", type: "number", defaultValue: 4 },
        { prop: "gridGap", type: "number", defaultValue: 6 },
        { prop: "flickerChance", type: "number", defaultValue: 0.3 },
        { prop: "maxOpacity", type: "number", defaultValue: 0.3 },
    ],
    states: [
        {
            name: "default (theme foreground color \u00B7 4px square)",
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0"/>
        </Frame>),
        },
        {
            name: "Accent color \u00B7 maxOpacity=0.5",
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" color="var(--color-primary)" maxOpacity={0.5}/>
        </Frame>),
        },
        {
            name: "Large square grid \u00B7 Low flicker frequency",
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" squareSize={8} gridGap={4} flickerChance={0.1} maxOpacity={0.4}/>
        </Frame>),
        },
        {
            name: "Dense cells \u00B7 High frequency flickering",
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" squareSize={2} gridGap={2} flickerChance={0.7} maxOpacity={0.25}/>
        </Frame>),
        },
        {
            name: "danger Hue",
            render: () => (<Frame>
          <FlickeringGrid className="absolute inset-0" color="var(--color-danger)" maxOpacity={0.35}/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <FlickeringGrid className="absolute inset-0" squareSize={p.squareSize as number} gridGap={p.gridGap as number} flickerChance={p.flickerChance as number} maxOpacity={p.maxOpacity as number}/>
    </Frame>),
    toCode: (p) => `<div className="relative h-48 w-80 overflow-hidden rounded-xl">
  <FlickeringGrid
    className="absolute inset-0"
    squareSize={${p.squareSize}}
    gridGap={${p.gridGap}}
    flickerChance={${p.flickerChance}}
    maxOpacity={${p.maxOpacity}}
  />
</div>`,
};
