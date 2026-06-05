import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BounceCards } from "./bounce-cards";

const IMAGES = ["/a.png", "/b.png", "/c.png"];

describe("BounceCards", () => {
  it("按 images 渲染对应张数的卡片 + 根容器宽高", () => {
    const { container } = render(
      <BounceCards images={IMAGES} containerWidth={500} containerHeight={300} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("500px");
    expect(root.style.height).toBe("300px");
    expect(container.querySelectorAll("[data-bounce-card]")).toHaveLength(3);
    expect(container.querySelectorAll("img")).toHaveLength(3);
  });

  it("卡片用 token 边框/背景（border-surface · bg-surface · rounded-3xl · shadow）", () => {
    const { container } = render(<BounceCards images={IMAGES} />);
    const card = container.querySelector("[data-bounce-card] > *")!;
    const cls = card.getAttribute("class")!;
    expect(cls).toContain("border-surface");
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("rounded-3xl");
    expect(cls).toContain("shadow-lg");
  });

  it("children 模式优先于 images（自定义卡片内容、无 img）", () => {
    const { container, getByText } = render(
      <BounceCards images={IMAGES}>{[<span key="x">卡A</span>, <span key="y">卡B</span>]}</BounceCards>,
    );
    expect(getByText("卡A")).toBeTruthy();
    expect(container.querySelectorAll("[data-bounce-card]")).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("className/style 透传到根容器 + enableHover=false 去掉 cursor-pointer", () => {
    const { container } = render(
      <BounceCards
        images={IMAGES}
        enableHover={false}
        className="ring-1"
        style={{ opacity: 0.5 }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("ring-1");
    expect(root.style.opacity).toBe("0.5");
    const card = container.querySelector("[data-bounce-card] > *")!;
    expect(card.getAttribute("class")).not.toContain("cursor-pointer");
  });
});
