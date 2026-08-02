"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RippleButton } from "../../../../packages/ui/src/ripple-button/ripple-button";
export const rippleButtonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "After clicking, Material Feng Shui ripples will spread in a circle from the landing point, and will be automatically removed when the animation ends.",
            code: `<RippleButton>Click here to see the ripples</RippleButton>`,
            render: () => <RippleButton>Click here to see the ripples</RippleButton>,
        },
        {
            title: "Ripple speed",
            description: "duration Controls the duration of a single ripple diffusion.",
            code: `<RippleButton duration="400ms">Fast</RippleButton>
<RippleButton duration="900ms">Slow</RippleButton>`,
            render: () => (<>
          <RippleButton duration="400ms">Fast</RippleButton>
          <RippleButton duration="900ms">Slow</RippleButton>
        </>),
        },
        {
            title: "Customized ripple color",
            description: "rippleColor specifies the ripple color, the default is primary-foreground.",
            code: `<RippleButton rippleColor="rgba(255,255,255,0.7)">High contrast ripple</RippleButton>`,
            render: () => <RippleButton rippleColor="rgba(255,255,255,0.7)">High contrast ripple</RippleButton>,
        },
    ],
    controls: [{ prop: "duration", type: "select", options: ["400ms", "600ms", "900ms"], defaultValue: "600ms" }],
    states: [{ name: "default (click the drop point to diffuse ripples)", render: () => <RippleButton>Click here to see the ripples</RippleButton> }],
    renderWithProps: (p) => <RippleButton duration={p.duration as string}>Click here to see the ripples</RippleButton>,
    toCode: (p) => `<RippleButton duration="${p.duration}">Click here to see the ripples</RippleButton>`,
};
