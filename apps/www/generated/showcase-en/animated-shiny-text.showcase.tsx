import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AnimatedShinyText } from "../../../../packages/ui/src/animated-shiny-text/animated-shiny-text";
export const animatedShinyTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "muted A highlight sweep across the background, often used in the \"\u2728 Introducing...\" logo.",
            code: `<div className="rounded-full border border-border bg-surface px-4 py-1.5">
  <AnimatedShinyText className="text-sm">\u2728 Introducing Hulian</AnimatedShinyText>
</div>`,
            render: () => (<div className="rounded-full border border-border bg-surface px-4 py-1.5">
          <AnimatedShinyText className="text-sm">✨ Introducing Hulian</AnimatedShinyText>
        </div>),
        },
        {
            title: "Highlight band width",
            description: "shimmerWidth Controls the swept highlight band width px (default 100), the larger it is, the softer it is.",
            code: `<AnimatedShinyText className="text-base" shimmerWidth={200}>
  Wider highlight band
</AnimatedShinyText>`,
            render: () => (<AnimatedShinyText className="text-base" shimmerWidth={200}>
          Wider highlight band
        </AnimatedShinyText>),
        },
        {
            title: "Plain text inline",
            description: "It is separated from the logo container and directly used as a line of highlight text.",
            code: `<AnimatedShinyText className="text-lg font-medium">
  Loading, please wait...
</AnimatedShinyText>`,
            render: () => (<AnimatedShinyText className="text-lg font-medium">
          Loading, please wait...
        </AnimatedShinyText>),
        },
    ],
    controls: [{ prop: "shimmerWidth", type: "number", defaultValue: 100 }],
    states: [
        {
            name: "default (logo temperament highlight)",
            render: () => (<div className="rounded-full border border-border bg-surface px-4 py-1.5">
          <AnimatedShinyText className="text-sm">✨ Introducing Hulian</AnimatedShinyText>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="rounded-full border border-border bg-surface px-4 py-1.5">
      <AnimatedShinyText className="text-sm" shimmerWidth={p.shimmerWidth as number}>
        ✨ Introducing Hulian
      </AnimatedShinyText>
    </div>),
    toCode: (p) => `<AnimatedShinyText shimmerWidth={${p.shimmerWidth}}>\u2728 Introducing</AnimatedShinyText>`,
};
