import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GridPattern } from "../../../../packages/ui/src/grid-pattern/grid-pattern";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const gridPatternShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put a layer of GridPattern in the relative container to get the grid background. The default is 40px solid line and text-border eating theme.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern />
</div>`,
            render: () => (<Frame>
          <GridPattern />
        </Frame>),
        },
        {
            title: "Dashed grid",
            description: "strokeDasharray Pass \"4 2\", which means replacing the solid lines with dotted lines, to create a detailed blueprint feel with smaller units.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern width={24} height={24} strokeDasharray="3 2" />
</div>`,
            render: () => (<Frame>
          <GridPattern width={24} height={24} strokeDasharray="3 2"/>
        </Frame>),
        },
        {
            title: "Change color (eat theme)",
            description: "Set the thread color to currentColor, use the text-* tool class to change the color, and automatically adapt the light and dark themes.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern className="text-primary" />
</div>`,
            render: () => (<Frame>
          <GridPattern className="text-primary"/>
        </Frame>),
        },
        {
            title: "Mask fade",
            description: "Overlay mask-image to make the grid fade toward the edges, making the hero/block background softer.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <GridPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
</div>`,
            render: () => (<Frame>
          <GridPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]"/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "width", type: "number", defaultValue: 40 },
        { prop: "dashed", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "default (40px solid grid)",
            render: () => (<Frame>
          <GridPattern />
        </Frame>),
        },
        {
            name: "Dense dotted line \u00B7 text-muted",
            render: () => (<Frame>
          <GridPattern width={24} height={24} strokeDasharray="3 2" className="text-muted"/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <GridPattern width={p.width as number} height={p.width as number} strokeDasharray={p.dashed ? "4 2" : 0}/>
    </Frame>),
    toCode: (p) => `<div className="relative">
  <GridPattern width={${p.width}}${p.dashed ? " strokeDasharray=\"4 2\"" : ""} />
</div>`,
};
