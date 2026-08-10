import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StripedPattern } from "../../../../packages/ui/src/striped-pattern/striped-pattern";
function Frame({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const stripedPatternShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "relative Place a layer of StripedPattern in the container to get a diagonal stripe background, the default is 45\u00B0, 10px unit, text-border.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern />
</div>`,
            render: () => (<Frame>
          <StripedPattern />
        </Frame>),
        },
        {
            title: "Angle and density",
            description: "angle controls the stripe inclination angle, size controls the stripe + spacer unit width - vertical sparse stripes, that is, angle=90, size increases.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern angle={90} size={20} />
</div>`,
            render: () => (<Frame>
          <StripedPattern angle={90} size={20}/>
        </Frame>),
        },
        {
            title: "Change color (eat theme)",
            description: "The stripe color is currentColor, use the text-* tool class to change the color, and the light and dark themes are automatically adapted.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern className="text-primary" />
</div>`,
            render: () => (<Frame>
          <StripedPattern className="text-primary"/>
        </Frame>),
        },
        {
            title: "Mask fade",
            description: "Overlay mask-image to make the stripes fade toward the edges and make the background of the block softer.",
            code: `<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-surface">
  <StripedPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]" />
</div>`,
            render: () => (<Frame>
          <StripedPattern className="[mask-image:radial-gradient(closest-side,black,transparent)]"/>
        </Frame>),
        },
    ],
    controls: [
        { prop: "angle", type: "number", defaultValue: 45 },
        { prop: "size", type: "number", defaultValue: 10 },
    ],
    states: [
        {
            name: "default (45\u00B0 \u00B7 10px)",
            render: () => (<Frame>
          <StripedPattern />
        </Frame>),
        },
        {
            name: "Vertical sparse grain \u00B7 text-muted-foreground",
            render: () => (<Frame>
          <StripedPattern angle={90} size={20} className="text-muted-foreground"/>
        </Frame>),
        },
    ],
    renderWithProps: (p) => (<Frame>
      <StripedPattern angle={p.angle as number} size={p.size as number}/>
    </Frame>),
    toCode: (p) => `<div className="relative">
  <StripedPattern angle={${p.angle}} size={${p.size}} />
</div>`,
};
