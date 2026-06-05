"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SplitText } from "./split-text";

// 每次 remount key 让进场重放，便于文档里反复观察
export const splitTextShowcase: ShowcaseSpec = {
  controls: [
    { prop: "splitType", type: "select", options: ["char", "word"], defaultValue: "char" },
    {
      prop: "from",
      type: "select",
      options: ["bottom", "top", "left", "right"],
      defaultValue: "bottom",
    },
    { prop: "delay", type: "number", defaultValue: 40 },
  ],
  states: [
    {
      name: "default（逐字底部淡入）",
      render: () => (
        <SplitText
          text="让开发更快更稳更美"
          className="text-3xl font-bold text-foreground"
        />
      ),
    },
    {
      name: "word（逐词 · 英文）",
      render: () => (
        <SplitText
          text="Build faster with 瑚琏"
          splitType="word"
          from="left"
          className="text-3xl font-bold text-primary"
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <SplitText
      key={`${p.splitType}-${p.from}-${p.delay}`}
      text="逐段错峰进场的标题"
      splitType={p.splitType as "char" | "word"}
      from={p.from as "bottom"}
      delay={p.delay as number}
      className="text-3xl font-bold text-foreground"
    />
  ),
  toCode: (p) =>
    `<SplitText text="逐段错峰进场的标题" splitType="${p.splitType}" from="${p.from}" delay={${p.delay}} />`,
};
