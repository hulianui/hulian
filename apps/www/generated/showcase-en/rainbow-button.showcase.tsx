import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RainbowButton } from "../../../../packages/ui/src/rainbow-button/rainbow-button";
export const rainbowButtonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The background color is a flowing rainbow gradient (take chart-1..4 token, switch with the light and dark theme), with a blurred halo at the bottom.",
            code: `<RainbowButton>Get Started</RainbowButton>`,
            render: () => <RainbowButton>Get Started</RainbowButton>,
        },
        {
            title: "Flow speed",
            description: "speed Controls the duration of one round of rainbow translation. The smaller it is, the faster it flows.",
            code: `<RainbowButton speed="2s">Rapid</RainbowButton>
<RainbowButton speed="5s">Soothing</RainbowButton>`,
            render: () => (<>
          <RainbowButton speed="2s">Rapid</RainbowButton>
          <RainbowButton speed="5s">Soothing</RainbowButton>
        </>),
        },
    ],
    controls: [{ prop: "speed", type: "select", options: ["2s", "3s", "5s"], defaultValue: "3s" }],
    states: [{ name: "default (chart Rainbow Flow + Halo)", render: () => <RainbowButton>Get Started</RainbowButton> }],
    renderWithProps: (p) => <RainbowButton speed={p.speed as string}>Get Started</RainbowButton>,
    toCode: (p) => `<RainbowButton speed="${p.speed}">Get Started</RainbowButton>`,
};
