import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SafeArea } from "../../../../packages/ui/src/safe-area/safe-area";
import type { SafeAreaEdges } from "../../../../packages/ui/src/safe-area/safe-area.types";
function Demo({ edges, min }: {
    edges?: SafeAreaEdges;
    min?: number;
}): ReactNode {
    return (<div className="w-full max-w-xs overflow-hidden rounded-[var(--radius)] border border-border bg-warning/15">
      <SafeArea edges={edges} min={min}>
        <div className="rounded-[var(--radius)] border border-dashed border-primary bg-surface p-4 text-center text-sm text-foreground">
          Content area (the outer circle is the safe area left blank)
        </div>
      </SafeArea>
    </div>);
}
export const safeAreaShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Full security zone",
            description: "The default is edges=\"all\", and all four sides are max(min, env(safe-area-inset-*)). The desktop env is always 0, so use min to open the demonstration.",
            code: `<SafeArea edges="all" min={16}>
  <Content />
</SafeArea>`,
            render: () => <Demo min={16}/>,
        },
        {
            title: "Bottom only",
            description: "The edge array transfer only takes effect on the specified edge, often used at the bottom Home Indicator to leave blank.",
            code: `<SafeArea edges={["bottom"]} min={24}>
  <BottomBar />
</SafeArea>`,
            render: () => <Demo edges={["bottom"]} min={24}/>,
        },
        {
            title: "Horizontal orientation",
            description: "The semantic alias horizontal is equal to left and right (vertical is up and down).",
            code: `<SafeArea edges="horizontal" min={20}>
  <Content />
</SafeArea>`,
            render: () => <Demo edges="horizontal" min={20}/>,
        },
    ],
    controls: [],
    states: [
        { name: "Full edge (min 16)", render: () => <Demo min={16}/> },
        { name: "Bottom only (min 24)", render: () => <Demo edges={["bottom"]} min={24}/> },
        { name: "Horizontal orientation (min 20)", render: () => <Demo edges="horizontal" min={20}/> },
    ],
    renderWithProps: () => <Demo min={16}/>,
    toCode: () => `<SafeArea edges="all" min={0}>
  <Content />
</SafeArea>`,
};
