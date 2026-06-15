"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SparklesText } from "./sparkles-text";

export const sparklesTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "文本周围随机生成小星脉冲闪烁，默认 primary/chart token 星色。",
      code: `<SparklesText className="text-4xl font-bold text-foreground">瑚琏 Hulian</SparklesText>`,
      render: () => (
        <SparklesText className="text-4xl font-bold text-foreground">瑚琏 Hulian</SparklesText>
      ),
    },
    {
      title: "星星数量",
      description: "sparklesCount 控制同时存在的星星数（默认 8），越多越热闹。",
      code: `<SparklesText
  className="text-4xl font-bold text-foreground"
  sparklesCount={20}
>
  Sparkle
</SparklesText>`,
      render: () => (
        <SparklesText className="text-4xl font-bold text-foreground" sparklesCount={20}>
          Sparkle
        </SparklesText>
      ),
    },
    {
      title: "自定义星色",
      description: "colors 传入星色数组，每颗星随机取其中一色。",
      code: `<SparklesText
  className="text-4xl font-bold text-foreground"
  colors={["var(--color-chart-2)", "var(--color-chart-4)"]}
>
  闪耀时刻
</SparklesText>`,
      render: () => (
        <SparklesText
          className="text-4xl font-bold text-foreground"
          colors={["var(--color-chart-2)", "var(--color-chart-4)"]}
        >
          闪耀时刻
        </SparklesText>
      ),
    },
  ],
  controls: [{ prop: "sparklesCount", type: "number", defaultValue: 10 }],
  states: [
    {
      name: "default（primary/chart 星闪）",
      render: () => (
        <SparklesText className="text-4xl font-bold text-foreground">瑚琏 Hulian</SparklesText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <SparklesText className="text-4xl font-bold text-foreground" sparklesCount={p.sparklesCount as number}>
      瑚琏 Hulian
    </SparklesText>
  ),
  toCode: (p) => `<SparklesText sparklesCount={${p.sparklesCount}}>瑚琏 Hulian</SparklesText>`,
};
