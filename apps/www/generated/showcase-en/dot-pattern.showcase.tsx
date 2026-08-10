import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DotPattern } from "../../../../packages/ui/src/dot-pattern/dot-pattern";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const dotPatternShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Place a layer of DotPattern in the relative container to get a dot matrix background. The default is 16px unit and text-border theme.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern />
</div>`,
            render: () => (<Frame>
          <DotPattern />
        </Frame>),
        },
        {
            title: "Adjust density and point diameter",
            description: "width/height control unit spacing, cr control point radius - increase the spacing and thicken the points to obtain a sparse and large lattice.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern width={28} height={28} cr={1.6} />
</div>`,
            render: () => (<Frame>
          <DotPattern width={28} height={28} cr={1.6}/>
        </Frame>),
        },
        {
            title: "Change color (eat theme)",
            description: "Select currentColor as the color, and use the text-* tool to change the color, and the light and dark themes will be automatically adapted.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern className="text-primary" />
</div>`,
            render: () => (<Frame>
          <DotPattern className="text-primary"/>
        </Frame>),
        },
        {
            title: "Mask fade",
            description: "Overlay mask-image to make the dot matrix fade toward the edge, often used in hero/card background to avoid hard edges.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <DotPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
</div>`,
            render: () => (<Frame>
          <DotPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]"/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "width", type: "number", defaultValue: 16 },
        { prop: "cr", type: "number", defaultValue: 1 },
    ],
    states: [
        {
            name: "default (text-border \u00B7 16px unit)",
            render: () => (<Frame>
          <DotPattern />
        </Frame>),
        },
        {
            name: "Sparse points \u00B7 text-muted-foreground",
            render: () => (<Frame>
          <DotPattern width={28} height={28} cr={1.4} className="text-muted-foreground"/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <DotPattern width={p.width as number} height={p.width as number} cr={p.cr as number}/>
    </Frame>),
    toCode: (p) => `<div className="relative">
  <DotPattern width={${p.width}} cr={${p.cr}} />
</div>`,
};
