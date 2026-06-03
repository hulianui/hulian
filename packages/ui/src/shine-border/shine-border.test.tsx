import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ShineBorder } from "./shine-border";

describe("ShineBorder", () => {
  it("渲染绝对定位边框层 + shine-border 动画类", () => {
    const { container } = render(<ShineBorder />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("absolute");
    expect(root.getAttribute("class")).toContain("inset-0");
    expect(root.getAttribute("class")).toContain("[animation:hulian-shine-border");
  });
  it("默认色用 chart token 拼 radial-gradient", () => {
    const { container } = render(<ShineBorder />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundImage).toContain("var(--color-chart-1)");
    expect(root.style.backgroundImage).toContain("radial-gradient");
  });
  it("borderWidth 落 padding + duration 落 CSS 变量", () => {
    const { container } = render(<ShineBorder borderWidth={2} duration={8} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.padding).toBe("2px");
    expect(root.style.getPropertyValue("--hulian-shine-duration")).toBe("8s");
  });
  it("单色 shineColor + motion-reduce 停 + className 透传", () => {
    const { container } = render(<ShineBorder shineColor="var(--color-primary)" className="z-10" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundImage).toContain("var(--color-primary)");
    expect(root.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    expect(root.getAttribute("class")).toContain("z-10");
  });
});
