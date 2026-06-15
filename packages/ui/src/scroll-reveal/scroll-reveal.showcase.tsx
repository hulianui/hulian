"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollReveal } from "./scroll-reveal";

export const scrollRevealShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "随容器滚过视口，整段先轻微旋转回正，再逐词从模糊解析到清晰（在框内向下滚动观察）。",
      code: `<ScrollReveal className="text-xl font-semibold">
  When you scroll this block the words resolve from blur to focus one by one.
</ScrollReveal>`,
      render: () => (
        <div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40" />
          <ScrollReveal className="text-xl font-semibold">
            When you scroll this block the words resolve from blur to focus one by one.
          </ScrollReveal>
          <div className="h-40" />
        </div>
      ),
    },
    {
      title: "无模糊 · 大旋转角",
      description: "enableBlur={false} 仅做透明度与旋转，baseRotation 加大初始旋转角强化纵深。",
      code: `<ScrollReveal
  enableBlur={false}
  baseRotation={6}
  className="text-xl font-semibold"
>
  纯透明度与旋转 适合追求克制质感的标题段落
</ScrollReveal>`,
      render: () => (
        <div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40" />
          <ScrollReveal
            enableBlur={false}
            baseRotation={6}
            className="text-xl font-semibold"
          >
            纯透明度与旋转 适合追求克制质感的标题段落
          </ScrollReveal>
          <div className="h-40" />
        </div>
      ),
    },
    {
      title: "强对比解析",
      description: "baseOpacity 调低让静息更暗、blurStrength 调大让模糊更重，做更强的入场对比。",
      code: `<ScrollReveal
  baseOpacity={0.05}
  blurStrength={8}
  className="text-xl font-semibold"
>
  滚动这段文字 每个词会从深度模糊逐步解析到清晰
</ScrollReveal>`,
      render: () => (
        <div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40" />
          <ScrollReveal
            baseOpacity={0.05}
            blurStrength={8}
            className="text-xl font-semibold"
          >
            滚动这段文字 每个词会从深度模糊逐步解析到清晰
          </ScrollReveal>
          <div className="h-40" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "baseOpacity", type: "number", defaultValue: 0.12, label: "基础透明度" },
    { prop: "baseRotation", type: "number", defaultValue: 3, label: "初始旋转角 deg" },
    { prop: "enableBlur", type: "boolean", defaultValue: true, label: "模糊解析" },
    { prop: "blurStrength", type: "number", defaultValue: 4, label: "模糊半径 px" },
  ],
  states: [
    {
      name: "default（滚动逐词显影）",
      render: () => (
        <div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40" />
          <ScrollReveal className="text-xl font-semibold">
            When you scroll this block the words resolve from blur to focus one by one.
          </ScrollReveal>
          <div className="h-40" />
        </div>
      ),
    },
    {
      name: "无模糊 · 大旋转角",
      render: () => (
        <div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
          <div className="h-40" />
          <ScrollReveal
            enableBlur={false}
            baseRotation={6}
            className="text-xl font-semibold"
          >
            纯透明度与旋转 适合追求克制质感的标题段落
          </ScrollReveal>
          <div className="h-40" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="max-h-64 overflow-auto rounded-lg border border-border p-6">
      <div className="h-40" />
      <ScrollReveal
        baseOpacity={p.baseOpacity as number}
        baseRotation={p.baseRotation as number}
        enableBlur={p.enableBlur as boolean}
        blurStrength={p.blurStrength as number}
        className="text-xl font-semibold"
      >
        滚动这段文字 每个词会从模糊逐步解析到清晰的焦点状态
      </ScrollReveal>
      <div className="h-40" />
    </div>
  ),
  toCode: (p) =>
    `<ScrollReveal baseOpacity={${p.baseOpacity}} baseRotation={${p.baseRotation}} enableBlur={${p.enableBlur}} blurStrength={${p.blurStrength}}>\n  滚动逐词显影的段落\n</ScrollReveal>`,
};
