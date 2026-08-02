"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GlitchText } from "../../../../packages/ui/src/glitch-text/glitch-text";
export const glitchTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Two layers of pseudo elements RGB dislocation + clip-path slicing, a sense of resident digital glitch.",
            code: `<GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>`,
            render: () => (<GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>),
        },
        {
            title: "Hover trigger",
            description: "enableOnHover is normal text when resting, and fails when hovering.",
            code: `<GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
  GLITCH
</GlitchText>`,
            render: () => (<GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
          GLITCH
        </GlitchText>),
        },
        {
            title: "Tear frequency",
            description: "speed is the tearing cycle in seconds. The smaller the jitter, the more violent it is.",
            code: `<GlitchText speed={0.8} className="text-4xl font-extrabold tracking-tight">
  SYSTEM
</GlitchText>`,
            render: () => (<GlitchText speed={0.8} className="text-4xl font-extrabold tracking-tight">
          SYSTEM
        </GlitchText>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 2.5 },
        { prop: "enableOnHover", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "default (resident fault)",
            render: () => (<GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>),
        },
        {
            name: "enableOnHover (hover trigger)",
            render: () => (<GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
          GLITCH
        </GlitchText>),
        },
    ],
    renderWithProps: (p) => (<GlitchText speed={p.speed as number} enableOnHover={p.enableOnHover as boolean} className="text-4xl font-extrabold tracking-tight">
      SYSTEM
    </GlitchText>),
    toCode: (p) => `<GlitchText speed={${p.speed}} enableOnHover={${p.enableOnHover}}>SYSTEM</GlitchText>`,
};
