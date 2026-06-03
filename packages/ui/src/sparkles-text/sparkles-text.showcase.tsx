"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SparklesText } from "./sparkles-text";

export const sparklesTextShowcase: ShowcaseSpec = {
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
