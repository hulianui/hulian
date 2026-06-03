"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TypingAnimation } from "./typing-animation";

export const typingAnimationShowcase: ShowcaseSpec = {
  controls: [
    { prop: "duration", type: "number", defaultValue: 80 },
    { prop: "showCursor", type: "boolean", defaultValue: true },
  ],
  states: [
    {
      name: "default（进入视口逐字打字 + 闪烁光标）",
      render: () => (
        <TypingAnimation
          text="瑚琏 Hulian — 吸取式聚合设计系统"
          className="text-2xl font-semibold text-foreground"
          startOnView={false}
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <TypingAnimation
      text="瑚琏 Hulian — 吸取式聚合设计系统"
      className="text-2xl font-semibold text-foreground"
      duration={p.duration as number}
      showCursor={p.showCursor as boolean}
      startOnView={false}
    />
  ),
  toCode: (p) => `<TypingAnimation text="瑚琏 Hulian" duration={${p.duration}} showCursor={${p.showCursor}} />`,
};
