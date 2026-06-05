import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ReflectiveCard } from "./reflective-card";

// 高光横扫层 = 带 hulian-reflective-card 动画类的 aria-hidden div
const sheenOf = (c: HTMLElement) =>
  c.querySelector("[class*='animation:hulian-reflective-card']") as HTMLElement;

describe("ReflectiveCard", () => {
  it("默认渲染：根容器 + 内置文案，不抛错（jsdom 无 WebGL/摄像头依赖）", () => {
    const { container, getByText } = render(<ReflectiveCard />);
    expect(container.firstElementChild).not.toBeNull();
    // 内置默认文案
    expect(getByText("ALEXANDER DOE")).toBeTruthy();
    expect(getByText("SECURE ACCESS")).toBeTruthy();
    expect(getByText("8901-2345-6789")).toBeTruthy();
  });

  it("根容器带 token / 隔离 / 圆角类，且写入金属 CSS 变量", () => {
    const { container } = render(<ReflectiveCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("isolate");
    expect(root.className).toContain("rounded-2xl");
    expect(root.className).toContain("overflow-hidden");
    expect(root.style.getPropertyValue("--hl-rc-sheen")).toBe(
      "var(--color-foreground)",
    );
    expect(root.style.getPropertyValue("--hl-rc-base")).toBe(
      "var(--color-chart-1)",
    );
  });

  it("高光层带 hulian-reflective-card 动画类 + motion-reduce 禁用类 + will-change-transform", () => {
    const { container } = render(<ReflectiveCard />);
    const sheen = sheenOf(container);
    expect(sheen).not.toBeNull();
    expect(sheen.className).toContain("[animation:hulian-reflective-card");
    expect(sheen.className).toContain("motion-reduce:[animation:none]");
    expect(sheen.className).toContain("will-change-transform");
  });

  it("speed / sheenColor prop 透传：duration 变量与高光色生效", () => {
    const { container } = render(
      <ReflectiveCard speed={12} sheenColor="oklch(0.8 0.2 60)" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hl-rc-duration")).toBe("12s");
    expect(root.style.getPropertyValue("--hl-rc-sheen")).toBe(
      "oklch(0.8 0.2 60)",
    );
  });

  it("roughness 被夹到 0–1，children 完全替换内置布局", () => {
    const { container, getByText, queryByText } = render(
      <ReflectiveCard roughness={5} metalness={-1}>
        <div>CUSTOM BODY</div>
      </ReflectiveCard>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hl-rc-roughness")).toBe("1");
    expect(root.style.getPropertyValue("--hl-rc-metal")).toBe("0");
    expect(getByText("CUSTOM BODY")).toBeTruthy();
    // 自定义 children 时不渲染内置默认文案
    expect(queryByText("ALEXANDER DOE")).toBeNull();
  });

  it("className 透传到根容器", () => {
    const { container } = render(
      <ReflectiveCard className="test-rc-class" />,
    );
    expect(container.firstElementChild?.className).toContain("test-rc-class");
  });
});
