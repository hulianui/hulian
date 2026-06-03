import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GlareHover } from "./glare-hover";

describe("GlareHover", () => {
  it("渲染 children + group/overflow-hidden 容器", () => {
    const { container } = render(<GlareHover>卡片</GlareHover>);
    const root = container.firstElementChild!;
    expect(root.textContent).toContain("卡片");
    expect(root.getAttribute("class")).toContain("group");
    expect(root.getAttribute("class")).toContain("overflow-hidden");
  });
  it("反光层 group-hover translate + transition + aria-hidden", () => {
    const { container } = render(<GlareHover>x</GlareHover>);
    const glare = container.querySelector('[aria-hidden="true"]')!;
    expect(glare.getAttribute("class")).toContain("group-hover:translate-x-[150%]");
    expect(glare.getAttribute("class")).toContain("transition-transform");
  });
  it("glareColor/duration 落 CSS 变量", () => {
    const { container } = render(<GlareHover glareColor="rgba(0,0,0,0.3)" duration="900ms">x</GlareHover>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-glare-color")).toBe("rgba(0,0,0,0.3)");
    expect(root.style.getPropertyValue("--hulian-glare-duration")).toBe("900ms");
  });
  it("motion-reduce 关过渡 + className/props 透传", () => {
    const { container } = render(<GlareHover className="rounded-xl" data-testid="gh">x</GlareHover>);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("rounded-xl");
    expect(root.getAttribute("data-testid")).toBe("gh");
    expect(container.querySelector('[aria-hidden="true"]')!.getAttribute("class")).toContain("motion-reduce:transition-none");
  });
});
