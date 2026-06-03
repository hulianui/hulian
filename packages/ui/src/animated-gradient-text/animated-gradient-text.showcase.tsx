import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedGradientText } from "./animated-gradient-text";

export const animatedGradientTextShowcase: ShowcaseSpec = {
  controls: [{ prop: "speed", type: "number", defaultValue: 1 }],
  states: [
    {
      name: "default（chart 渐变行内）",
      render: () => (
        <AnimatedGradientText className="text-2xl">🎉 全新瑚琏组件库</AnimatedGradientText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <AnimatedGradientText className="text-2xl" speed={p.speed as number}>
      🎉 全新瑚琏组件库
    </AnimatedGradientText>
  ),
  toCode: (p) => `<AnimatedGradientText speed={${p.speed}}>🎉 全新瑚琏</AnimatedGradientText>`,
};
