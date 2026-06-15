"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TypingAnimation } from "./typing-animation";

export const typingAnimationShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "逐字打出文本并附闪烁光标，打完自动隐藏光标。",
      code: `<TypingAnimation
  text="瑚琏 Hulian — 吸取式聚合设计系统"
  className="text-2xl font-semibold text-foreground"
/>`,
      render: () => (
        <TypingAnimation
          text="瑚琏 Hulian — 吸取式聚合设计系统"
          className="text-2xl font-semibold text-foreground"
          startOnView={false}
        />
      ),
    },
    {
      title: "打字速度",
      description: "duration 控制每字毫秒（默认 80），越小越快。",
      code: `<TypingAnimation
  text="Faster typing speed"
  duration={40}
  className="text-xl font-medium text-foreground"
/>`,
      render: () => (
        <TypingAnimation
          text="Faster typing speed"
          duration={40}
          className="text-xl font-medium text-foreground"
          startOnView={false}
        />
      ),
    },
    {
      title: "隐藏光标",
      description: "showCursor=false 时不渲染闪烁光标，仅保留打字过程。",
      code: `<TypingAnimation
  text="无光标的打字效果"
  showCursor={false}
  className="text-xl font-medium text-foreground"
/>`,
      render: () => (
        <TypingAnimation
          text="无光标的打字效果"
          showCursor={false}
          className="text-xl font-medium text-foreground"
          startOnView={false}
        />
      ),
    },
    {
      title: "进入视口触发",
      description: "startOnView=true（默认）时滚动进入视口才开始打字，适合长页面。",
      code: `<TypingAnimation
  text="滚动到此处才开始打字"
  startOnView
  className="text-xl font-medium text-foreground"
/>`,
      render: () => (
        <TypingAnimation
          text="滚动到此处才开始打字"
          startOnView
          className="text-xl font-medium text-foreground"
        />
      ),
    },
  ],
  controls: [
    { prop: "duration", type: "number", defaultValue: 80 },
    { prop: "showCursor", type: "boolean", defaultValue: true },
  ],
  states: [
    {
      name: "default（进入视口逐字打字 + 闪烁光标）",
      render: () => (
        <TypingAnimation
          text="瑚琏 Hulian — 吸取式聚合设计系统"
          className="text-2xl font-semibold text-foreground"
          startOnView={false}
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <TypingAnimation
      text="瑚琏 Hulian — 吸取式聚合设计系统"
      className="text-2xl font-semibold text-foreground"
      duration={p.duration as number}
      showCursor={p.showCursor as boolean}
      startOnView={false}
    />
  ),
  toCode: (p) => `<TypingAnimation text="瑚琏 Hulian" duration={${p.duration}} showCursor={${p.showCursor}} />`,
};
