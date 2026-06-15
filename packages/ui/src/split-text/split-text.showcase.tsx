"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SplitText } from "./split-text";

// 每次 remount key 让进场重放，便于文档里反复观察
export const splitTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "逐字从底部错峰淡入，中文友好（按码点切分）。",
      code: `<SplitText text="让开发更快更稳更美" className="text-3xl font-bold text-foreground" />`,
      render: () => (
        <SplitText text="让开发更快更稳更美" className="text-3xl font-bold text-foreground" />
      ),
    },
    {
      title: "逐词切分",
      description: "splitType=\"word\" 按空白逐词进场，适合英文标语。",
      code: `<SplitText
  text="Build faster with 瑚琏"
  splitType="word"
  from="left"
  className="text-3xl font-bold text-primary"
/>`,
      render: () => (
        <SplitText
          text="Build faster with 瑚琏"
          splitType="word"
          from="left"
          className="text-3xl font-bold text-primary"
        />
      ),
    },
    {
      title: "进场方向",
      description: "from 控制每段位移入场方向：top / bottom / left / right。",
      code: `<SplitText
  text="自上而下落入的标题"
  from="top"
  className="text-3xl font-bold text-foreground"
/>`,
      render: () => (
        <SplitText
          text="自上而下落入的标题"
          from="top"
          className="text-3xl font-bold text-foreground"
        />
      ),
    },
    {
      title: "错峰节奏与时长",
      description: "delay 调相邻段错峰毫秒、duration 调单段时长，做更慢更舒展的 hero 进场。",
      code: `<SplitText
  text="慢节奏舒展进场"
  delay={90}
  duration={0.8}
  className="text-3xl font-bold text-primary"
/>`,
      render: () => (
        <SplitText
          text="慢节奏舒展进场"
          delay={90}
          duration={0.8}
          className="text-3xl font-bold text-primary"
        />
      ),
    },
  ],
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
