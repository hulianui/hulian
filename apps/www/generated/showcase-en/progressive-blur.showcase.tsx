"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ProgressiveBlur } from "../../../../packages/ui/src/progressive-blur/progressive-blur";
type Side = "top" | "bottom" | "left" | "right";
function Demo({ side = "bottom" }: {
    side?: Side;
}) {
    return (<div className="relative h-56 w-80 overflow-hidden rounded-[var(--radius)] border border-border">
      <div className="grid h-full grid-cols-6 gap-1 p-2">
        {Array.from({ length: 36 }).map((_, i) => (<span key={i} className="rounded-sm bg-gradient-to-br from-primary/40 to-chart-2/40"/>))}
      </div>
      <ProgressiveBlur side={side}/>
      <span className="absolute bottom-3 left-3 text-sm font-medium text-foreground">Progressive Blur · {side}</span>
    </div>);
}
export const progressiveBlurShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Bottom gradually blurred",
            description: "Absolutely covers the content, the closer to the bottom, the blurrier it becomes. It is often used to fade out/mask the copy area of the content.",
            code: `<div className="relative overflow-hidden rounded-[var(--radius)] border border-border">
  {/* content */}
  <ProgressiveBlur side="bottom" />
</div>`,
            render: () => <Demo side="bottom"/>,
        },
        {
            title: "Top progressive blur",
            description: "side Switches the blur enhancement direction. The top is the most blurry, which is suitable for the top bar adsorption scene.",
            code: `<ProgressiveBlur side="top" />`,
            render: () => <Demo side="top"/>,
        },
        {
            title: "Horizontal \u00B7 The right side is blurred",
            description: "left / right does horizontal progressive blur, often used for edge hints in horizontal sliding lists.",
            code: `<ProgressiveBlur side="right" />`,
            render: () => <Demo side="right"/>,
        },
        {
            title: "Stronger layering",
            description: "layers increases the number of layers to make the transition smoother, and blur increases the basic blur amount.",
            code: `<ProgressiveBlur side="bottom" layers={8} blur={2} />`,
            render: () => (<div className="relative h-56 w-80 overflow-hidden rounded-[var(--radius)] border border-border">
          <div className="grid h-full grid-cols-6 gap-1 p-2">
            {Array.from({ length: 36 }).map((_, i) => (<span key={i} className="rounded-sm bg-gradient-to-br from-primary/40 to-chart-2/40"/>))}
          </div>
          <ProgressiveBlur side="bottom" layers={8} blur={2}/>
          <span className="absolute bottom-3 left-3 text-sm font-medium text-foreground">layers=8 · blur=2</span>
        </div>),
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "bottom" },
    ],
    states: [
        { name: "bottom", render: () => <Demo side="bottom"/> },
        { name: "top", render: () => <Demo side="top"/> },
    ],
    renderWithProps: (p) => <Demo side={(p.side as Side) ?? "bottom"}/>,
    toCode: (p) => `<div className="relative overflow-hidden">
  {/* content */}
  <ProgressiveBlur side="${(p.side as string) ?? "bottom"}" />
</div>`,
};
