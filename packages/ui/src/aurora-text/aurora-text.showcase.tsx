import type { ShowcaseSpec } from "../showcase/types";
import { AuroraText } from "./aurora-text";

export const auroraTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认吃瑚琏 chart token 渐变，自动适配明暗主题。",
      code: `<AuroraText className="text-4xl font-bold">瑚琏 Hulian</AuroraText>`,
      render: () => <AuroraText className="text-4xl font-bold">瑚琏 Hulian</AuroraText>,
    },
    {
      title: "流动速度",
      description: "speed 控制流光速度倍率，越大越快（默认 1）。",
      code: `<AuroraText className="text-4xl font-bold" speed={3}>
  Aurora
</AuroraText>`,
      render: () => (
        <AuroraText className="text-4xl font-bold" speed={3}>
          Aurora
        </AuroraText>
      ),
    },
    {
      title: "自定义渐变色",
      description: "colors 传入任意停靠色数组（建议用 token 以吃明暗）。",
      code: `<AuroraText
  className="text-4xl font-bold"
  colors={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-primary)"]}
>
  Spectrum
</AuroraText>`,
      render: () => (
        <AuroraText
          className="text-4xl font-bold"
          colors={["var(--color-chart-2)", "var(--color-chart-4)", "var(--color-primary)"]}
        >
          Spectrum
        </AuroraText>
      ),
    },
    {
      title: "标题级排版",
      description: "作为大标题点缀，混排普通文本仅高亮关键词。",
      code: `<h2 className="text-3xl font-bold text-foreground">
  全新 <AuroraText>瑚琏</AuroraText> 设计系统
</h2>`,
      render: () => (
        <h2 className="text-3xl font-bold text-foreground">
          全新 <AuroraText>瑚琏</AuroraText> 设计系统
        </h2>
      ),
    },
  ],
  controls: [{ prop: "speed", type: "number", defaultValue: 1 }],
  states: [
    {
      name: "default（chart token 流光）",
      render: () => (
        <AuroraText className="text-4xl font-bold">瑚琏 Hulian</AuroraText>
      ),
    },
    {
      name: "快速",
      render: () => (
        <AuroraText className="text-4xl font-bold" speed={2}>
          Aurora
        </AuroraText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <AuroraText className="text-4xl font-bold" speed={p.speed as number}>
      瑚琏 Hulian
    </AuroraText>
  ),
  toCode: (p) => `<AuroraText speed={${p.speed}}>瑚琏 Hulian</AuroraText>`,
};
