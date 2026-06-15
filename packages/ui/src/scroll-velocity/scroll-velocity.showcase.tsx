"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollVelocity } from "./scroll-velocity";

/** 展示用容器：留出上下行间距、裁掉两侧出血，让滚动跑马灯有呼吸感 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface py-6">
      {children}
    </div>
  );
}

export const scrollVelocityShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单行文字跑马灯，静止时匀速漂移，随页面滚动速度加速/变向。",
      code: `<ScrollVelocity texts={["瑚琏组件库"]} velocity={80} />`,
      render: () => (
        <Stage>
          <ScrollVelocity texts={["瑚琏组件库"]} velocity={80} />
        </Stage>
      ),
    },
    {
      title: "双行交替方向",
      description: "texts 多行时偶数行向左、奇数行向右，形成视差错位。",
      code: `<ScrollVelocity
  texts={["企业级 · 高质量", "原生适配 · 主题感知"]}
  velocity={70}
/>`,
      render: () => (
        <Stage>
          <ScrollVelocity texts={["企业级 · 高质量", "原生适配 · 主题感知"]} velocity={70} />
        </Stage>
      ),
    },
    {
      title: "高亮主色 + 快速",
      description: "提高 velocity 加速漂移，className 透传到文本上色为主色。",
      code: `<ScrollVelocity
  texts={["SCROLL VELOCITY"]}
  velocity={140}
  className="text-primary"
/>`,
      render: () => (
        <Stage>
          <ScrollVelocity texts={["SCROLL VELOCITY"]} velocity={140} className="text-primary" />
        </Stage>
      ),
    },
    {
      title: "弱化字色",
      description: "用 text-muted 弱化字色、放慢速度，当作氛围背景文字。",
      code: `<ScrollVelocity
  texts={["持续滚动的氛围背景文字"]}
  velocity={50}
  className="text-muted"
/>`,
      render: () => (
        <Stage>
          <ScrollVelocity
            texts={["持续滚动的氛围背景文字"]}
            velocity={50}
            className="text-muted"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "velocity", type: "number", defaultValue: 80, label: "基础速度 px/s" },
    { prop: "damping", type: "number", defaultValue: 50, label: "弹簧阻尼" },
    { prop: "stiffness", type: "number", defaultValue: 400, label: "弹簧刚度" },
    { prop: "numCopies", type: "number", defaultValue: 6, label: "复制份数" },
  ],

  states: [
    {
      name: "default（单行匀速漂移）",
      render: () => (
        <Stage>
          <ScrollVelocity texts={["瑚琏组件库"]} velocity={80} />
        </Stage>
      ),
    },
    {
      name: "双行交替方向（视差）",
      render: () => (
        <Stage>
          <ScrollVelocity
            texts={["企业级 · 高质量", "原生适配 · 主题感知"]}
            velocity={70}
          />
        </Stage>
      ),
    },
    {
      name: "高亮主色 + 快速",
      render: () => (
        <Stage>
          <ScrollVelocity
            texts={["SCROLL VELOCITY"]}
            velocity={140}
            className="text-primary"
          />
        </Stage>
      ),
    },
    {
      name: "弱化字色（muted）",
      render: () => (
        <Stage>
          <ScrollVelocity
            texts={["持续滚动的氛围背景文字"]}
            velocity={50}
            className="text-muted"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ScrollVelocity
        texts={["瑚琏 HULIAN"]}
        velocity={p.velocity as number}
        damping={p.damping as number}
        stiffness={p.stiffness as number}
        numCopies={p.numCopies as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<ScrollVelocity`,
      `  texts={["瑚琏 HULIAN"]}`,
      `  velocity={${p.velocity}}`,
      `  damping={${p.damping}}`,
      `  stiffness={${p.stiffness}}`,
      `  numCopies={${p.numCopies}}`,
      `/>`,
    ].join("\n"),
};
