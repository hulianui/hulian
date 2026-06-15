import type { ShowcaseSpec } from "../showcase/types";
import { RainbowButton } from "./rainbow-button";

export const rainbowButtonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "底色为流动的彩虹渐变（取 chart-1..4 token，随明暗主题切换），底部带模糊光晕。",
      code: `<RainbowButton>Get Started</RainbowButton>`,
      render: () => <RainbowButton>Get Started</RainbowButton>,
    },
    {
      title: "流动速度",
      description: "speed 控制彩虹一轮平移的时长，越小流动越快。",
      code: `<RainbowButton speed="2s">急速</RainbowButton>
<RainbowButton speed="5s">舒缓</RainbowButton>`,
      render: () => (
        <>
          <RainbowButton speed="2s">急速</RainbowButton>
          <RainbowButton speed="5s">舒缓</RainbowButton>
        </>
      ),
    },
  ],
  controls: [{ prop: "speed", type: "select", options: ["2s", "3s", "5s"], defaultValue: "3s" }],
  states: [{ name: "default（chart 彩虹流动 + 光晕）", render: () => <RainbowButton>Get Started</RainbowButton> }],
  renderWithProps: (p) => <RainbowButton speed={p.speed as string}>Get Started</RainbowButton>,
  toCode: (p) => `<RainbowButton speed="${p.speed}">Get Started</RainbowButton>`,
};
