"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GlitchText } from "./glitch-text";

export const glitchTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "两层伪元素 RGB 错位 + clip-path 切片，常驻数字故障感。",
      code: `<GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>`,
      render: () => (
        <GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>
      ),
    },
    {
      title: "悬停触发",
      description: "enableOnHover 静息为普通文本，悬停时才故障。",
      code: `<GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
  GLITCH
</GlitchText>`,
      render: () => (
        <GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
          GLITCH
        </GlitchText>
      ),
    },
    {
      title: "撕裂频率",
      description: "speed 是撕裂周期秒数，越小抖动越狂躁。",
      code: `<GlitchText speed={0.8} className="text-4xl font-extrabold tracking-tight">
  SYSTEM
</GlitchText>`,
      render: () => (
        <GlitchText speed={0.8} className="text-4xl font-extrabold tracking-tight">
          SYSTEM
        </GlitchText>
      ),
    },
  ],
  controls: [
    { prop: "speed", type: "number", defaultValue: 2.5 },
    { prop: "enableOnHover", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "default（常驻故障）",
      render: () => (
        <GlitchText className="text-4xl font-extrabold tracking-tight">HULIAN</GlitchText>
      ),
    },
    {
      name: "enableOnHover（悬停触发）",
      render: () => (
        <GlitchText enableOnHover className="text-4xl font-extrabold tracking-tight">
          GLITCH
        </GlitchText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <GlitchText
      speed={p.speed as number}
      enableOnHover={p.enableOnHover as boolean}
      className="text-4xl font-extrabold tracking-tight"
    >
      SYSTEM
    </GlitchText>
  ),
  toCode: (p) =>
    `<GlitchText speed={${p.speed}} enableOnHover={${p.enableOnHover}}>SYSTEM</GlitchText>`,
};
