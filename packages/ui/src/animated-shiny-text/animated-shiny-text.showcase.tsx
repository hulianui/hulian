import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedShinyText } from "./animated-shiny-text";

export const animatedShinyTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "muted 底色上一道高光横扫，常用于「✨ Introducing…」徽标。",
      code: `<div className="rounded-full border border-border bg-surface px-4 py-1.5">
  <AnimatedShinyText className="text-sm">✨ Introducing 瑚琏 Hulian</AnimatedShinyText>
</div>`,
      render: () => (
        <div className="rounded-full border border-border bg-surface px-4 py-1.5">
          <AnimatedShinyText className="text-sm">✨ Introducing 瑚琏 Hulian</AnimatedShinyText>
        </div>
      ),
    },
    {
      title: "高光带宽度",
      description: "shimmerWidth 控制扫过的高光带宽度 px（默认 100），越大越柔和。",
      code: `<AnimatedShinyText className="text-base" shimmerWidth={200}>
  更宽的高光带
</AnimatedShinyText>`,
      render: () => (
        <AnimatedShinyText className="text-base" shimmerWidth={200}>
          更宽的高光带
        </AnimatedShinyText>
      ),
    },
    {
      title: "纯文本行内",
      description: "脱离徽标容器，直接作为一行高光提示文字。",
      code: `<AnimatedShinyText className="text-lg font-medium">
  正在加载，请稍候…
</AnimatedShinyText>`,
      render: () => (
        <AnimatedShinyText className="text-lg font-medium">
          正在加载，请稍候…
        </AnimatedShinyText>
      ),
    },
  ],
  controls: [{ prop: "shimmerWidth", type: "number", defaultValue: 100 }],
  states: [
    {
      name: "default（徽标气质高光）",
      render: () => (
        <div className="rounded-full border border-border bg-surface px-4 py-1.5">
          <AnimatedShinyText className="text-sm">✨ Introducing 瑚琏 Hulian</AnimatedShinyText>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="rounded-full border border-border bg-surface px-4 py-1.5">
      <AnimatedShinyText className="text-sm" shimmerWidth={p.shimmerWidth as number}>
        ✨ Introducing 瑚琏 Hulian
      </AnimatedShinyText>
    </div>
  ),
  toCode: (p) =>
    `<AnimatedShinyText shimmerWidth={${p.shimmerWidth}}>✨ Introducing</AnimatedShinyText>`,
};
