"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BlurText } from "./blur-text";

export const blurTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "逐词从模糊 + 位移分两步解析到清晰，成波浪推进。",
      code: `<BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground" />`,
      render: () => (
        <BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground" />
      ),
    },
    {
      title: "逐字 · 中文 · 从下浮入",
      description: "splitType=\"char\" 逐字解析，direction=\"bottom\" 从下方浮入。",
      code: `<BlurText
  text="清晰浮现的瑚琏标题"
  splitType="char"
  direction="bottom"
  className="text-3xl font-bold text-primary"
/>`,
      render: () => (
        <BlurText
          text="清晰浮现的瑚琏标题"
          splitType="char"
          direction="bottom"
          className="text-3xl font-bold text-primary"
        />
      ),
    },
    {
      title: "起始模糊与错峰",
      description: "blur 调起始模糊像素、delay 调相邻段错峰毫秒，做更强的 hero 级解析感。",
      code: `<BlurText
  text="企业级组件 · 高质量 · 原生适配"
  splitType="char"
  delay={90}
  blur={12}
  className="text-2xl font-semibold text-muted-foreground"
/>`,
      render: () => (
        <BlurText
          text="企业级组件 · 高质量 · 原生适配"
          splitType="char"
          delay={90}
          blur={12}
          className="text-2xl font-semibold text-muted-foreground"
        />
      ),
    },
  ],
  controls: [
    { prop: "splitType", type: "select", options: ["word", "char"], defaultValue: "word", label: "切分粒度" },
    { prop: "direction", type: "select", options: ["top", "bottom"], defaultValue: "top", label: "进场方向" },
    { prop: "blur", type: "number", defaultValue: 8, label: "起始模糊 px" },
    { prop: "delay", type: "number", defaultValue: 120, label: "错峰毫秒" },
  ],
  states: [
    {
      name: "default（逐词模糊解析）",
      render: () => (
        <BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground" />
      ),
    },
    {
      name: "char（逐字 · 中文 · 从下浮入）",
      render: () => (
        <BlurText
          text="清晰浮现的瑚琏标题"
          splitType="char"
          direction="bottom"
          className="text-3xl font-bold text-primary"
        />
      ),
    },
    {
      name: "大字号慢错峰（hero 级）",
      render: () => (
        <BlurText
          text="企业级组件 · 高质量 · 原生适配"
          splitType="char"
          delay={90}
          blur={12}
          className="text-2xl font-semibold text-muted-foreground"
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <BlurText
      key={`${p.splitType}-${p.direction}-${p.blur}-${p.delay}`}
      text="模糊解析的标题文本 Blur Text"
      splitType={p.splitType as "word" | "char"}
      direction={p.direction as "top" | "bottom"}
      blur={p.blur as number}
      delay={p.delay as number}
      className="text-3xl font-bold text-foreground"
    />
  ),
  toCode: (p) =>
    `<BlurText text="模糊解析的标题文本" splitType="${p.splitType}" direction="${p.direction}" blur={${p.blur}} delay={${p.delay}} />`,
};
