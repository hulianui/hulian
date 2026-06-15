"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

export const animatedThemeTogglerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点击按钮以圆形揭示动画切换明暗主题（复用瑚琏 ThemeProvider）。",
      code: `<AnimatedThemeToggler />`,
      render: () => <AnimatedThemeToggler />,
    },
    {
      title: "自定义动画时长",
      description: "duration 调整圆形揭示动画时长（ms），默认 500。",
      code: `<AnimatedThemeToggler duration={900} />`,
      render: () => <AnimatedThemeToggler duration={900} />,
    },
    {
      title: "搭配说明文案",
      description: "切换器是一个标准按钮，可与其它元素并排放在工具栏里。",
      code: `<div className="flex items-center gap-3">
  <AnimatedThemeToggler />
  <span className="text-sm text-muted">点击：圆形揭示切换明暗</span>
</div>`,
      render: () => (
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          <span className="text-sm text-muted">点击：圆形揭示切换明暗</span>
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    {
      name: "default",
      render: () => (
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          <span className="text-sm text-muted">点击：圆形揭示切换明暗</span>
        </div>
      ),
    },
  ],
  renderWithProps: () => <AnimatedThemeToggler />,
  toCode: () => `<AnimatedThemeToggler />`,
};
