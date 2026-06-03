import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Safari } from "./safari";

describe("Safari", () => {
  it("渲染地址栏文本（默认 hulian.design）", () => {
    const { container } = render(<Safari />);
    expect(container.textContent).toContain("hulian.design");
  });
  it("三个红绿灯圆点", () => {
    const { container } = render(<Safari />);
    const dots = container.querySelectorAll("span.rounded-full");
    expect(dots.length).toBe(3);
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<Safari imageSrc="/x.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/x.png");
    const withChild = render(<Safari>页面内容</Safari>);
    expect(withChild.container.textContent).toContain("页面内容");
    expect(withChild.container.querySelector("img")).toBeNull();
  });
  it("窗口 chrome 用 surface/border token + className/props 透传", () => {
    const { container } = render(<Safari url="example.com" className="w-96" data-testid="sf" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("bg-surface");
    expect(root.getAttribute("class")).toContain("w-96");
    expect(root.getAttribute("data-testid")).toBe("sf");
    expect(container.textContent).toContain("example.com");
  });
});
