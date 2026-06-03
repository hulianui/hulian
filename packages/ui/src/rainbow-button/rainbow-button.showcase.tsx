import type { ShowcaseSpec } from "../showcase/types";
import { RainbowButton } from "./rainbow-button";

export const rainbowButtonShowcase: ShowcaseSpec = {
  controls: [{ prop: "speed", type: "select", options: ["2s", "3s", "5s"], defaultValue: "3s" }],
  states: [{ name: "default（chart 彩虹流动 + 光晕）", render: () => <RainbowButton>Get Started</RainbowButton> }],
  renderWithProps: (p) => <RainbowButton speed={p.speed as string}>Get Started</RainbowButton>,
  toCode: (p) => `<RainbowButton speed="${p.speed}">Get Started</RainbowButton>`,
};
