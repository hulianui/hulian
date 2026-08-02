import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GlareHover } from "../../../../packages/ui/src/glare-hover/glare-hover";
export const glareHoverShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap any content and a diagonal reflection will sweep from left to right when hovering.",
            code: `<GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
  <span className="text-lg font-semibold text-foreground">Hover to see the reflection</span>
</GlareHover>`,
            render: () => (<GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">Hover to see the reflection</span>
        </GlareHover>),
        },
        {
            title: "Scanning time",
            description: "Use duration to control the speed of reflective sweeping. Slow sweeping will show a more advanced texture.",
            code: `<GlareHover
  duration="1000ms"
  className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
>
  <span className="text-lg font-semibold text-foreground">Slow sweep 1s</span>
</GlareHover>`,
            render: () => (<GlareHover duration="1000ms" className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">Slow sweep 1s</span>
        </GlareHover>),
        },
        {
            title: "Custom reflective color",
            description: "glareColor Covers a default translucent white that can be dyed to a brand-hued gloss.",
            code: `<GlareHover
  glareColor="rgba(124,58,237,0.5)"
  className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface"
>
  <span className="text-lg font-semibold text-foreground">Purple gloss</span>
</GlareHover>`,
            render: () => (<GlareHover glareColor="rgba(124,58,237,0.5)" className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">Purple gloss</span>
        </GlareHover>),
        },
        {
            title: "Set on picture card",
            description: "Also effective for pictures/covers, the reflection makes the card more interactive.",
            code: `<GlareHover className="h-40 w-72 overflow-hidden rounded-xl border border-border">
  <div className="flex h-full w-full items-end bg-gradient-to-br from-primary/60 to-chart-2/60 p-4">
    <span className="text-lg font-semibold text-white">Selected works</span>
  </div>
</GlareHover>`,
            render: () => (<GlareHover className="h-40 w-72 overflow-hidden rounded-xl border border-border">
          <div className="flex h-full w-full items-end bg-gradient-to-br from-primary/60 to-chart-2/60 p-4">
            <span className="text-lg font-semibold text-white">Selected Works</span>
          </div>
        </GlareHover>),
        },
    ],
    controls: [{ prop: "duration", type: "select", options: ["450ms", "650ms", "1000ms"], defaultValue: "650ms" }],
    states: [
        {
            name: "default (hover reflective oblique scan)",
            render: () => (<GlareHover className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
          <span className="text-lg font-semibold text-foreground">Hover to see the reflection</span>
        </GlareHover>),
        },
    ],
    renderWithProps: (p) => (<GlareHover duration={p.duration as string} className="grid h-40 w-72 place-items-center rounded-xl border border-border bg-surface">
      <span className="text-lg font-semibold text-foreground">Hover to see the reflection</span>
    </GlareHover>),
    toCode: (p) => `<GlareHover duration="${p.duration}">...</GlareHover>`,
};
