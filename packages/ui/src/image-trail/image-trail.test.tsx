import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ImageTrail } from "./image-trail";

const IMGS = ["/a.png", "/b.png", "/c.png"];

describe("ImageTrail", () => {
  it("渲染根捕获层 + 每张图一个槽 div，不抛错", () => {
    const { container } = render(<ImageTrail images={IMGS} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    // 根带 token 化的边框/底色与裁切
    expect(root.className).toContain("border-border");
    expect(root.className).toContain("bg-surface");
    expect(root.className).toContain("overflow-hidden");
    // 每张图一个槽
    const slots = root.querySelectorAll("[aria-hidden]");
    expect(slots.length).toBe(IMGS.length);
  });

  it("图槽吃 backgroundImage(url) + imageWidth 派生宽高(1.1 比)", () => {
    const { container } = render(<ImageTrail images={IMGS} imageWidth={220} />);
    const slot = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(slot.style.backgroundImage).toContain("/a.png");
    expect(slot.style.width).toBe("220px");
    expect(slot.style.height).toBe("200px"); // 220 / 1.1
  });

  it("图槽带 motion-reduce:hidden + will-change + pointer-events-none", () => {
    const { container } = render(<ImageTrail images={IMGS} />);
    const slot = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(slot.className).toContain("motion-reduce:hidden");
    expect(slot.className).toContain("will-change");
    expect(slot.className).toContain("pointer-events-none");
  });

  it("pointerMove 不抛错（jsdom 无真实布局也安全）", () => {
    const { container } = render(<ImageTrail images={IMGS} />);
    const root = container.firstElementChild as HTMLElement;
    expect(() =>
      fireEvent.pointerMove(root, { clientX: 120, clientY: 80 }),
    ).not.toThrow();
  });

  it("className 透传到根 + children 渲染在拖尾层之上", () => {
    const { container, getByText } = render(
      <ImageTrail images={IMGS} className="test-trail-class">
        <span>瑚琏</span>
      </ImageTrail>,
    );
    expect(container.firstElementChild?.className).toContain("test-trail-class");
    expect(getByText("瑚琏")).not.toBeNull();
  });

  it("images 为空时仍渲染根容器不崩", () => {
    const { container } = render(<ImageTrail images={[]} />);
    expect(container.firstElementChild).not.toBeNull();
    expect(container.querySelectorAll("[aria-hidden]").length).toBe(0);
  });
});
