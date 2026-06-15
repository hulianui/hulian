import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedGradientText } from "./animated-gradient-text";

export const animatedGradientTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "行内徽标级渐变流动文本，默认 chart token 吃明暗主题。",
      code: `<AnimatedGradientText className="text-2xl">🎉 全新瑚琏组件库</AnimatedGradientText>`,
      render: () => (
        <AnimatedGradientText className="text-2xl">🎉 全新瑚琏组件库</AnimatedGradientText>
      ),
    },
    {
      title: "流动速度",
      description: "speed 控制渐变平移速度倍率（默认 1）。",
      code: `<AnimatedGradientText className="text-2xl" speed={2.5}>
  限时优惠进行中
</AnimatedGradientText>`,
      render: () => (
        <AnimatedGradientText className="text-2xl" speed={2.5}>
          限时优惠进行中
        </AnimatedGradientText>
      ),
    },
    {
      title: "自定义渐变色",
      description: "colors 传入停靠色数组，渐变首尾自动衔接成无缝循环。",
      code: `<AnimatedGradientText
  className="text-2xl font-bold"
  colors={["var(--color-primary)", "var(--color-chart-3)", "var(--color-chart-5)"]}
>
  HanFlow 瑚琏
</AnimatedGradientText>`,
      render: () => (
        <AnimatedGradientText
          className="text-2xl font-bold"
          colors={["var(--color-primary)", "var(--color-chart-3)", "var(--color-chart-5)"]}
        >
          HanFlow 瑚琏
        </AnimatedGradientText>
      ),
    },
  ],
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
