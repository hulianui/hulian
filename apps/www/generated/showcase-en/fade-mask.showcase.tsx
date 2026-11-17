import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DotPattern } from "../../../../packages/ui/src/dot-pattern";
import { FadeMask } from "../../../../packages/ui/src/fade-mask/fade-mask";
import type { FadeMaskProps } from "../../../../packages/ui/src/fade-mask/fade-mask.types";
function Tiles() {
    return (<div className="grid grid-cols-4 gap-2 p-3">
      {Array.from({ length: 16 }, (_, i) => (<div key={i} className="h-10 rounded-md bg-primary/15"/>))}
    </div>);
}
export const fadeMaskShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Fade out the bottom",
            description: "For a bleeding showcase wall or a truncated long list: the bottom fades to transparency and works on any background.",
            code: `<FadeMask direction="bottom" start="60%">
  \u2026
</FadeMask>`,
            render: () => (<FadeMask className="w-72 rounded-xl border border-border">
          <Tiles />
        </FadeMask>),
        },
        {
            title: "Spotlight a texture center",
            description: "direction=\"radial\" fades outward from at: a dot or grid background that is bright at the center and recedes toward the edges.",
            code: `<FadeMask direction="radial" at="30% 20%" size="50% 60%" className="absolute inset-0">
  <DotPattern />
</FadeMask>`,
            render: () => (<div className="relative h-48 w-full overflow-hidden rounded-xl border border-border bg-bg">
          <FadeMask direction="radial" at="30% 20%" size="50% 60%" className="absolute inset-0">
            <DotPattern className="text-muted-foreground"/>
          </FadeMask>
        </div>),
        },
    ],
    controls: [
        {
            prop: "direction",
            type: "select",
            options: ["top", "bottom", "left", "right", "radial"],
            defaultValue: "bottom",
        },
    ],
    states: [
        {
            name: "Fade out the bottom",
            render: () => (<FadeMask className="w-72">
          <Tiles />
        </FadeMask>),
        },
        {
            name: "Fade out the right",
            render: () => (<FadeMask direction="right" className="w-72">
          <Tiles />
        </FadeMask>),
        },
    ],
    renderWithProps: (p) => (<FadeMask direction={p.direction as FadeMaskProps["direction"]} className="w-72">
      <Tiles />
    </FadeMask>),
    toCode: (p) => `<FadeMask direction="${p.direction}">
  \u2026
</FadeMask>`,
};
