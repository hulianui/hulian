"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GlitchText } from "./glitch-text";

export const glitchTextShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 2.5 },
    { prop: "enableOnHover", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "default（常驻故障）",
      render: () => (
        <GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>
      ),
    },
    {
      name: "enableOnHover（悬停触发）",
      render: () => (
        <GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
          GLITCH
        </GlitchText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <GlitchText
      speed={p.speed as number}
      enableOnHover={p.enableOnHover as boolean}
      className="text-4xl font-extrabold tracking-tight"
    >
      SYSTEM
    </GlitchText>
  ),
  toCode: (p) =>
    `<GlitchText speed={${p.speed}} enableOnHover={${p.enableOnHover}}>SYSTEM</GlitchText>`,
};
