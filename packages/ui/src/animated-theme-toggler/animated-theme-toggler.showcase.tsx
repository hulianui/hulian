"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Wrench } from "../_icons";
import { Button } from "../button";
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
  <span className="text-sm text-muted-foreground">点击：圆形揭示切换明暗</span>
</div>`,
      render: () => (
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler />
          <span className="text-sm text-muted-foreground">点击：圆形揭示切换明暗</span>
        </div>
      ),
    },
    {
      title: "顶栏工具区（ghost · 紧凑）",
      description: "variant=\"ghost\" 去掉描边与底色，size=\"sm\" 与 Button iconSm 同高，并排时上下沿对齐。",
      code: `<div className="flex items-center gap-1">
  <Button variant="ghost" muted size="iconSm" aria-label="设置">…</Button>
  <AnimatedThemeToggler variant="ghost" size="sm" />
</div>`,
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" muted size="iconSm" aria-label="设置">
            <Wrench className="size-4" />
          </Button>
          <AnimatedThemeToggler variant="ghost" size="sm" />
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
          <span className="text-sm text-muted-foreground">点击：圆形揭示切换明暗</span>
        </div>
      ),
    },
  ],
  renderWithProps: () => <AnimatedThemeToggler />,
  toCode: () => `<AnimatedThemeToggler />`,
};
