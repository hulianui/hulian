"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SparklesText } from "../../../../packages/ui/src/sparkles-text/sparkles-text";
export const sparklesTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Randomly generated small star pulses flash around the text, default primary/chart token star color.",
            code: `<SparklesText className="text-4xl font-bold text-foreground">Hulian</SparklesText>`,
            render: () => (<SparklesText className="text-4xl font-bold text-foreground">Hulian</SparklesText>),
        },
        {
            title: "Number of stars",
            description: "sparklesCount controls the number of stars that exist at the same time (default 8), the more, the more lively it is.",
            code: `<SparklesText
  className="text-4xl font-bold text-foreground"
  sparklesCount={20}
>
  Sparkle
</SparklesText>`,
            render: () => (<SparklesText className="text-4xl font-bold text-foreground" sparklesCount={20}>
          Sparkle
        </SparklesText>),
        },
        {
            title: "Customized star color",
            description: "colors Pass in the star color array, and each star randomly selects one of the colors.",
            code: `<SparklesText
  className="text-4xl font-bold text-foreground"
  colors={["var(--color-chart-2)", "var(--color-chart-4)"]}
>
  A moment to shine
</SparklesText>`,
            render: () => (<SparklesText className="text-4xl font-bold text-foreground" colors={["var(--color-chart-2)", "var(--color-chart-4)"]}>
          A moment to shine
        </SparklesText>),
        },
    ],
    controls: [{ prop: "sparklesCount", type: "number", defaultValue: 10 }],
    states: [
        {
            name: "default (primary/chart Star Flash)",
            render: () => (<SparklesText className="text-4xl font-bold text-foreground">Hulian</SparklesText>),
        },
    ],
    renderWithProps: (p) => (<SparklesText className="text-4xl font-bold text-foreground" sparklesCount={p.sparklesCount as number}>
      Hulian
    </SparklesText>),
    toCode: (p) => `<SparklesText sparklesCount={${p.sparklesCount}}>Hulian</SparklesText>`,
};
