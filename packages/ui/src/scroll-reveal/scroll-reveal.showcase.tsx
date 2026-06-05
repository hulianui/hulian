"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrollReveal } from "./scroll-reveal";

export const scrollRevealShowcase: ShowcaseSpec = {
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
