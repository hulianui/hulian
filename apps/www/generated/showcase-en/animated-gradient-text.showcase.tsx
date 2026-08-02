import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AnimatedGradientText } from "../../../../packages/ui/src/animated-gradient-text/animated-gradient-text";
export const animatedGradientTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Inline logo-level gradient flowing text, default chart token Eat light and dark theme.",
            code: `<AnimatedGradientText className="text-2xl">\uD83C\uDF89 New Hulian component library</AnimatedGradientText>`,
            render: () => (<AnimatedGradientText className="text-2xl">🎉 New Hulian component library</AnimatedGradientText>),
        },
        {
            title: "Flow speed",
            description: "speed Controls the gradient translation speed magnification (default 1).",
            code: `<AnimatedGradientText className="text-2xl" speed={2.5}>
  Limited time offer in progress
</AnimatedGradientText>`,
            render: () => (<AnimatedGradientText className="text-2xl" speed={2.5}>
          Limited time offer in progress
        </AnimatedGradientText>),
        },
        {
            title: "Custom gradient color",
            description: "colors Pass in the dock color array, and the beginning and end of the gradient will automatically connect into a seamless loop.",
            code: `<AnimatedGradientText
  className="text-2xl font-bold"
  colors={["var(--color-primary)", "var(--color-chart-3)", "var(--color-chart-5)"]}
>
  HanFlow Hulian
</AnimatedGradientText>`,
            render: () => (<AnimatedGradientText className="text-2xl font-bold" colors={["var(--color-primary)", "var(--color-chart-3)", "var(--color-chart-5)"]}>
          HanFlow Hulian
        </AnimatedGradientText>),
        },
    ],
    controls: [{ prop: "speed", type: "number", defaultValue: 1 }],
    states: [
        {
            name: "default (chart gradient inside)",
            render: () => (<AnimatedGradientText className="text-2xl">🎉 New Hulian component library</AnimatedGradientText>),
        },
    ],
    renderWithProps: (p) => (<AnimatedGradientText className="text-2xl" speed={p.speed as number}>
      🎉 New Hulian component library
    </AnimatedGradientText>),
    toCode: (p) => `<AnimatedGradientText speed={${p.speed}}>\uD83C\uDF89 Brand new Hulian </AnimatedGradientText>`,
};
