import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ShimmerButton } from "../../../../packages/ui/src/shimmer-button/shimmer-button";
export const shimmerButtonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default primary background color, with a circle of high-gloss sparkles on the edge, is suitable for the first screen owner CTA.",
            code: `<ShimmerButton>Start using Hulian</ShimmerButton>`,
            render: () => <ShimmerButton>Start using Hulian</ShimmerButton>,
        },
        {
            title: "Customized background color",
            description: "background can be changed to any color (including token), and the spark color defaults to primary-foreground.",
            code: `<ShimmerButton background="var(--color-danger)">Delete account</ShimmerButton>`,
            render: () => <ShimmerButton background="var(--color-danger)">Delete account</ShimmerButton>,
        },
        {
            title: "Spark Speed",
            description: "shimmerDuration Controls the duration of a round of spark wandering, the smaller it is, the faster it is.",
            code: `<ShimmerButton shimmerDuration="2s">Rapid</ShimmerButton>
<ShimmerButton shimmerDuration="5s">Soothing</ShimmerButton>`,
            render: () => (<>
          <ShimmerButton shimmerDuration="2s">Rapid</ShimmerButton>
          <ShimmerButton shimmerDuration="5s">Soothing</ShimmerButton>
        </>),
        },
    ],
    controls: [{ prop: "shimmerDuration", type: "select", options: ["2s", "3s", "5s"], defaultValue: "3s" }],
    states: [
        {
            name: "default (primary bottom + spark wander)",
            render: () => <ShimmerButton>Start using Hulian</ShimmerButton>,
        },
        {
            name: "danger Bottom",
            render: () => <ShimmerButton background="var(--color-danger)">Delete</ShimmerButton>,
        },
    ],
    renderWithProps: (p) => (<ShimmerButton shimmerDuration={p.shimmerDuration as string}>Start using Hulian</ShimmerButton>),
    toCode: (p) => `<ShimmerButton shimmerDuration="${p.shimmerDuration}">Get started</ShimmerButton>`,
};
