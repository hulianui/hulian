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

// #278 活内容场景：顶栏尾部的占位要能让出去，内容区要在高度链上。
describe("Safari headerExtra 与高度链（#278）", () => {
  it("不传 headerExtra：占位格保持原样（w-12 空 div），对称性不变", () => {
    const { container } = render(<Safari />);
    const cell = container.querySelector("div.w-12.shrink-0")!;
    expect(cell).not.toBeNull();
    expect(cell.childElementCount).toBe(0);
    expect(cell.textContent).toBe("");
  });

  it("传 headerExtra：占位让给内容，宽度下限仍锁在占位宽", () => {
    const { container, getByRole } = render(
      <Safari headerExtra={<button type="button">下载</button>} />,
    );
    const btn = getByRole("button", { name: "下载" });
    const cell = btn.parentElement!;
    expect(cell.className).toContain("min-w-12");
    expect(cell.className).toContain("shrink-0");
    // 死占位不该同时还在（否则胶囊两侧各多一格）
    expect(container.querySelectorAll("div.w-12.shrink-0").length).toBe(0);
  });

  it("内容区在高度链上：根是列向 flex，内容区 min-h-0 flex-1", () => {
    const { container, getByTestId } = render(
      <Safari>
        <div data-testid="viewport" />
      </Safari>,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("flex flex-col");
    const body = getByTestId("viewport").parentElement!;
    expect(body.className).toContain("flex-1");
    expect(body.className).toContain("min-h-0");
  });
});
