import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../theme/theme-provider";
import { AnimatedThemeToggler } from "./animated-theme-toggler";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

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

  it("默认标签跟随 ConfigProvider", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}><ThemeProvider defaultSetting="light"><AnimatedThemeToggler /></ThemeProvider></ConfigProvider>,
    );
    expect(getByRole("button").getAttribute("aria-label")).toBe("Switch to dark mode");
  });

  it("透传 className", () => {
    const { getByRole } = render(
      <ThemeProvider defaultSetting="light">
        <AnimatedThemeToggler className="my-toggler" />
      </ThemeProvider>,
    );
    expect(getByRole("button").classList.contains("my-toggler")).toBe(true);
  });

  // 缺 Provider 时曾直接 throw（useTheme 的硬约束）→ 整页白屏。一个装饰性开关不该有这种杀伤力。
  describe("无 ThemeProvider 时降级", () => {
    it("不抛异常，照常渲染出按钮", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(() => render(<AnimatedThemeToggler />)).not.toThrow();
      warn.mockRestore();
    });

    it("自持主题态：点击改写 <html data-theme> 并落盘 localStorage", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      document.documentElement.setAttribute("data-theme", "light");
      const { getByRole } = render(<AnimatedThemeToggler />);
      fireEvent.click(getByRole("button"));
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(localStorage.getItem("hulian-theme")).toBe("dark");
      expect(getByRole("button").getAttribute("aria-label")).toBe("切换到亮色");
      warn.mockRestore();
    });

    it("初值取自已有的 <html data-theme>（anti-FOUC 脚本先写的那份）", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      document.documentElement.setAttribute("data-theme", "dark");
      const { getByRole } = render(<AnimatedThemeToggler />);
      expect(getByRole("button").getAttribute("aria-label")).toBe("切换到亮色");
      warn.mockRestore();
    });

    it("dev 下给出可读告警，指明少挂了 ThemeProvider", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<AnimatedThemeToggler />);
      expect(warn.mock.calls.flat().join(" ")).toContain("ThemeProvider");
      warn.mockRestore();
    });
  });

  // #284：主题真源在消费方（ThemeProvider 挂 forcedTheme 只是镜像）时，非受控 toggle 点了不切。
  describe("受控 theme + onThemeChange", () => {
    it("forcedTheme 下：点击回调下一个值，不改 Provider 视觉；显示跟随 theme prop", () => {
      const onThemeChange = vi.fn();
      const ui = (theme: "light" | "dark") => (
        <ThemeProvider defaultSetting="light" forcedTheme="light">
          <AnimatedThemeToggler theme={theme} onThemeChange={onThemeChange} />
        </ThemeProvider>
      );
      const { getByRole, rerender } = render(ui("dark"));
      // 显示以受控值为准（Provider 是 light，按钮却按 dark 显示「切换到亮色」）
      expect(getByRole("button").getAttribute("aria-label")).toBe("切换到亮色");
      fireEvent.click(getByRole("button"));
      expect(onThemeChange).toHaveBeenCalledWith("light");
      // 只回调不落值：外部没改 theme 前按钮不翻
      expect(getByRole("button").getAttribute("aria-label")).toBe("切换到亮色");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      rerender(ui("light"));
      expect(getByRole("button").getAttribute("aria-label")).toBe("切换到暗色");
    });

    it("受控且无 ThemeProvider：不进自持降级（不告警、不写 <html> / localStorage）", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      document.documentElement.setAttribute("data-theme", "light");
      const onThemeChange = vi.fn();
      const { getByRole } = render(<AnimatedThemeToggler theme="light" onThemeChange={onThemeChange} />);
      fireEvent.click(getByRole("button"));
      expect(onThemeChange).toHaveBeenCalledWith("dark");
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(localStorage.getItem("hulian-theme")).toBeNull();
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it("非受控也回调 onThemeChange，且照常切换", () => {
      const onThemeChange = vi.fn();
      const { getByRole } = render(
        <ThemeProvider defaultSetting="light">
          <AnimatedThemeToggler onThemeChange={onThemeChange} />
        </ThemeProvider>,
      );
      fireEvent.click(getByRole("button"));
      expect(onThemeChange).toHaveBeenCalledWith("dark");
      expect(getByRole("button").getAttribute("aria-label")).toBe("切换到亮色");
    });
  });
});
