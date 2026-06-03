import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../theme/theme-provider";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

// defaultSetting="light" 避开 systemTheme 的 matchMedia（jsdom 无）；jsdom 无 startViewTransition → 走 toggle 降级路径。
const renderToggler = () =>
  render(
    <ThemeProvider defaultSetting="light">
      <AnimatedThemeToggler />
    </ThemeProvider>,
  );

describe("AnimatedThemeToggler", () => {
  beforeEach(() => localStorage.clear());

  it("渲染切换按钮（亮色态 aria-label=切换到暗色）", () => {
    const { getByRole } = renderToggler();
    expect(getByRole("button").getAttribute("aria-label")).toBe("切换到暗色");
  });

  it("点击切换主题（aria-label 翻转，降级路径不抛）", () => {
    const { getByRole } = renderToggler();
    fireEvent.click(getByRole("button"));
    expect(getByRole("button").getAttribute("aria-label")).toBe("切换到亮色");
  });

  it("透传 className", () => {
    const { getByRole } = render(
      <ThemeProvider defaultSetting="light">
        <AnimatedThemeToggler className="my-toggler" />
      </ThemeProvider>,
    );
    expect(getByRole("button").classList.contains("my-toggler")).toBe(true);
  });
});
