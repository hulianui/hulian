"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { WordRotate } from "./word-rotate";

const words = ["更快", "更稳", "更美", "瑚琏"];

export const wordRotateShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入词数组，AnimatePresence 逐词上下轮换（默认每词停留 2.5s）。",
      code: `<div className="text-3xl font-bold text-foreground">
  让开发 <WordRotate words={["更快", "更稳", "更美", "瑚琏"]} className="text-primary" />
</div>`,
      render: () => (
        <div className="text-3xl font-bold text-foreground">
          让开发 <WordRotate words={["更快", "更稳", "更美", "瑚琏"]} className="text-primary" />
        </div>
      ),
    },
    {
      title: "轮换间隔",
      description: "duration 控制每词停留毫秒，越小切换越快。",
      code: `<div className="text-3xl font-bold text-foreground">
  <WordRotate words={["设计", "开发", "交付"]} duration={1200} className="text-primary" />
</div>`,
      render: () => (
        <div className="text-3xl font-bold text-foreground">
          <WordRotate words={["设计", "开发", "交付"]} duration={1200} className="text-primary" />
        </div>
      ),
    },
    {
      title: "纯轮换标语",
      description: "单独成行作为 Hero 标语，混排前后缀文案。",
      code: `<div className="text-4xl font-bold text-foreground">
  专注 <WordRotate words={["效率", "体验", "美学"]} className="text-chart-2" /> 的组件库
</div>`,
      render: () => (
        <div className="text-4xl font-bold text-foreground">
          专注 <WordRotate words={["效率", "体验", "美学"]} className="text-chart-2" /> 的组件库
        </div>
      ),
    },
  ],
  controls: [{ prop: "duration", type: "number", defaultValue: 2000 }],
  states: [
    {
      name: "default（2.5s 轮换）",
      render: () => (
        <div className="text-3xl font-bold text-foreground">
          让开发 <WordRotate words={words} className="text-primary" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="text-3xl font-bold text-foreground">
      让开发 <WordRotate words={words} duration={p.duration as number} className="text-primary" />
    </div>
  ),
  toCode: (p) => `<WordRotate words={["更快","更稳","更美"]} duration={${p.duration}} />`,
};
