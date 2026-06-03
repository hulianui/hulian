"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

export const animatedThemeTogglerShowcase: ShowcaseSpec = {
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
