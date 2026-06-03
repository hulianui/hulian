import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Chrome } from "./chrome";

describe("Chrome", () => {
  it("渲染地址栏文本（默认 hulian.design）", () => {
    const { container } = render(<Chrome />);
    expect(container.textContent).toContain("hulian.design");
  });
  it("title 缺省时退回 url，作为标签标题", () => {
    const { container } = render(<Chrome url="a.com" />);
    // a.com 同时出现在标签标题与地址栏 → 至少两处
    expect(container.textContent?.match(/a\.com/g)?.length).toBeGreaterThanOrEqual(2);
  });
  it("三个红绿灯圆点", () => {
    const { container } = render(<Chrome />);
    const dots = container.querySelectorAll("span.rounded-full");
    // 3 红绿灯 + 1 favicon 点
    expect([...dots].filter((d) => d.className.includes("size-3")).length).toBe(4);
  });
  it("imageSrc 优先渲染 img；否则 children", () => {
    const withImg = render(<Chrome imageSrc="/x.png" />);
    expect(withImg.container.querySelector("img")?.getAttribute("src")).toBe("/x.png");
    const withChild = render(<Chrome>页面内容</Chrome>);
    expect(withChild.container.textContent).toContain("页面内容");
    expect(withChild.container.querySelector("img")).toBeNull();
  });
  it("窗口 chrome 用 surface/border token + className/props 透传", () => {
    const { container } = render(<Chrome url="example.com" className="w-96" data-testid="cr" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("bg-surface");
    expect(root.getAttribute("class")).toContain("w-96");
    expect(root.getAttribute("data-testid")).toBe("cr");
    expect(container.textContent).toContain("example.com");
  });
});
