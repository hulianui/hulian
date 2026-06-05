import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { BorderGlow } from "./border-glow";

// motion/react 的 useReducedMotion 在 jsdom 下默认 false；个别用例覆写。
vi.mock("motion/react", async (orig) => {
  const mod = (await orig()) as Record<string, unknown>;
  return { ...mod, useReducedMotion: () => false };
});

describe("BorderGlow", () => {
  it("渲染根容器 + 内容 + 发光层结构", () => {
    const { container, getByText } = render(
      <BorderGlow>瑚琏</BorderGlow>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.className).toContain("border-glow");
    // 内容渲染在 .bg-inner 内
    expect(getByText("瑚琏")).toBeTruthy();
    // 外层光晕 span 存在
    expect(container.querySelector(".bg-edge-light")).toBeTruthy();
    // 注入作用域 <style>
    expect(container.querySelector("style")).toBeTruthy();
  });

  it("默认色走 chart token（作用域 CSS 含 --color-chart-1）", () => {
    const { container } = render(<BorderGlow>x</BorderGlow>);
    const style = container.querySelector("style")!;
    expect(style.innerHTML).toContain("var(--color-chart-1)");
    // glow 用 color-mix 调透明度而非写死 hex
    expect(style.innerHTML).toContain("color-mix(");
  });

  it("自定义参数落进作用域 CSS（borderRadius / glowColor / coneSpread）", () => {
    const { container } = render(
      <BorderGlow
        borderRadius={12}
        glowColor="var(--color-primary)"
        coneSpread={40}
      >
        x
      </BorderGlow>,
    );
    const html = container.querySelector("style")!.innerHTML;
    expect(html).toContain("--bg-border-radius:12px");
    expect(html).toContain("--bg-cone-spread:40");
    expect(html).toContain("var(--color-primary)");
  });

  it("className / 其它 props 透传到根 div", () => {
    const { container } = render(
      <BorderGlow className="my-card" data-testid="bg" id="hero">
        x
      </BorderGlow>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("my-card");
    expect(root.getAttribute("data-testid")).toBe("bg");
    expect(root.getAttribute("id")).toBe("hero");
  });

  it("animated 不抛错（jsdom 下 RAF 安全降级）", () => {
    expect(() =>
      render(<BorderGlow animated>x</BorderGlow>),
    ).not.toThrow();
  });
});
